import structlog
import googlemaps
import pandas as pd
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework import generics, status
from django.db import transaction
from datetime import datetime as dt, UTC
from django.utils.timezone import now
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from core.authentication import JWTAuthentication
from typing import cast, TypedDict
from django.conf import settings
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance

from markets.serializers import (
    UploadCircularSerializer,
    MarketSerializer,
    CircularSerializer,
    CircularProductSerializer,
    SearchCircularSerializer,
    RankCircularProductListSerializer,
    AdminMarketSerializer,
    AdminLocationSerializer,
)

from markets.models import (
    Market,
    Location,
    Product,
    Circular,
    CircularProduct,
)

from markets.producers import CircularProductCreatedProducer, CircularProductCreated

logger = structlog.get_logger(__name__)


def get_producer():
    return CircularProductCreatedProducer()


class MarketViewSet(ModelViewSet):
    queryset = Market.objects.all()
    serializer_class = MarketSerializer


class CircularViewSet(ModelViewSet):
    queryset = Circular.objects.all()
    serializer_class = CircularSerializer

    @action(detail=False, methods=["GET"])
    def search(self, request):
        queryset = self.get_queryset()
        queryset = queryset.filter(
            expiration_date__gte=dt.now(UTC).strftime("%Y-%m-%d")
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CircularProductViewSet(ModelViewSet):
    queryset = CircularProduct.objects.all()
    serializer_class = CircularProductSerializer

    def get_queryset(self):
        circular_id = self.kwargs.get("pk")
        return CircularProduct.objects.prefetch_related("product").filter(
            circular_id=circular_id
        )


class SearchCircularListView(generics.ListAPIView):
    serializer_class = SearchCircularSerializer

    def get_queryset(self):
        queryset = (
            Circular.objects.prefetch_related("location")
            .prefetch_related(
                Prefetch(
                    "circularproduct_set",
                    queryset=CircularProduct.objects.select_related("product"),
                )
            )
            .filter(expiration_date__gte=dt.now(UTC).strftime("%Y-%m-%d"))
        )

        lng = self.request.query_params.get("lng")
        lat = self.request.query_params.get("lat")
        rad = self.request.query_params.get("rad")

        if not (lng and lat and rad):
            raise ValidationError({"message": "Missing query parameters"})

        user_location = None
        try:
            user_location = Point(
                float(lng),
                float(lat),
                srid=4326,
            )
            rad = float(rad)
        except (ValueError, TypeError):
            logger.error(
                "Invalid query parameters",
                lng=lng,
                lat=lat,
                rad=rad,
            )
            return queryset

        if user_location:
            nearby = (
                Location.objects.annotate(
                    distance=Distance("geolocation", user_location)
                )
                .filter(distance__lte=rad * 1000)
                .order_by("distance")
                .values_list("id", flat=True)
            )

            queryset = queryset.filter(location_id__in=nearby)

        return queryset


class RankCircularProductListView(generics.ListAPIView):
    serializer_class = RankCircularProductListSerializer

    def get_queryset(self):
        return Product.objects.prefetch_related(
            Prefetch(
                "circularproduct_set",
                queryset=CircularProduct.objects.select_related("circular").filter(
                    circular__expiration_date__gte=now()
                ),
            )
        )

    def rank(self, request):
        queryset = self.get_queryset()
        queryset = queryset.order_by("name", "circularproduct_set__discount_price")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@api_view(["POST"])
@transaction.atomic
def upload_circular(request, location_id):
    serializer = UploadCircularSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    location = get_object_or_404(Location, pk=location_id)

    file = request.FILES["csv"]

    dtype_spec = {
        "name": str,
        "price": float,
        "weight": str,
        "brand": str,
    }
    df = pd.read_csv(file, dtype=dtype_spec)

    logger.info(f"Reading circular for market {location.market.name}", file=df)

    circular = location.circular_set.create(
        title=serializer.validated_data["title"],
        description=serializer.validated_data["description"],
        expiration_date=serializer.validated_data["expiration_date"],
    )

    # check if products already exist
    for _, row in df.iterrows():
        product_name = row["name"].lower()

        try:
            product_price = int(row["price"])
        except ValueError:
            return Response(
                {"message": f"Price {row['price']} is not a valid number."}, status=400
            )

        product = Product.objects.filter(
            name=product_name,
            brand=row["brand"],
            market=location.market,
            weight=row["weight"],
        ).first()

        if not product:
            product = Product.objects.create(
                name=product_name,
                price=product_price,
                weight=row["weight"],
                brand=row["brand"],
                market=location.market,
            )

        circularproduct = (
            CircularProduct.objects.filter(
                description=product_name,
                product=product,
                circular__expiration_date__gt=dt.now(UTC).strftime("%Y-%m-%d"),
            )
            .select_related("circular")
            .first()
        )

        if circularproduct:
            return Response(
                {
                    "message": f"Product {product.name} already exists in a circular that expires on {circularproduct.circular.expiration_date}."
                },
                status=400,
            )

        circularproduct = CircularProduct.objects.create(
            description=product_name,
            circular=circular,
            product=product,
            discount_price=product_price,
        )

        # xxx: This is the part that sends the message to RabbitMQ
        # Lazy initialize and send the message to RabbitMQ
        producer = get_producer()
        producer.publish(
            body=CircularProductCreated(
                id=circularproduct.id,
                description=circularproduct.description,
                product_weight=product.weight,
                product_brand=product.brand,
            )
        )

    return Response({"message": "Circular uploaded successfully."})


# -


class AdminMarketViewSet(ModelViewSet):
    queryset = Market.objects.all()
    serializer_class = AdminMarketSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def list(self, request, *args, **kwargs):
        self.queryset = Market.objects.filter(user=request.user)[:1]
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        request.data["user"] = request.user.id

        return super().create(request, *args, **kwargs)


#

gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)


class Address(TypedDict):
    address: str
    lat: float
    lng: float


def search_address_with_geolocation_by_cep(cep: str) -> Address:
    try:
        geocode_result = gmaps.geocode(cep)
    except Exception as e:
        logger.error(f"Error while geocoding address: {e}")
        return None

    geocode_result = cast(list[dict], geocode_result)

    if len(geocode_result) == 0:
        return None

    location = geocode_result[0]["geometry"]["location"]
    address = geocode_result[0]["formatted_address"]

    if location is None or address is None:
        raise ValueError("Invalid geocode result")

    return Address(address=address, lat=location["lat"], lng=location["lng"])


class AdminLocationViewSet(ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = AdminLocationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    lookup_field = "market_id"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exists = Location.objects.filter(
            cep=serializer.validated_data["cep"],
            market_id=self.kwargs.get("market_id"),
        ).exists()
        if exists:
            return Response(
                {"message": "Store already exists for this market."}, status=400
            )
        # get the market id from the request params
        market_id = self.kwargs.get("market_id")
        market = get_object_or_404(Market, pk=market_id)
        cep = serializer.validated_data["cep"]

        resp = search_address_with_geolocation_by_cep(cep)
        print("resp", resp)

        serializer.validated_data["address"] = resp["address"]
        serializer.validated_data["market"] = market

        # lng => x
        # lat => y
        serializer.validated_data["geolocation"] = Point(
            resp["lng"],
            resp["lat"],
            srid=4326,
        )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
