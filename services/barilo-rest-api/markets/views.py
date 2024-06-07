import structlog
import googlemaps
import pandas as pd
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import generics, status
from django.db import transaction
from datetime import datetime as dt, UTC
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from typing import cast, Optional
from django.conf import settings

from markets.serializers import (
    UploadCircularSerializer,
    MarketSerializer,
    CircularSerializer,
    CircularProductSerializer,
    SearchCircularSerializer,
    RankCircularProductListSerializer,
    AdminMarketSerializer,
    AdminMarketUnitSerializer,
)

from markets.models import (
    Market,
    MarketUnit,
    Product,
    Circular,
    CircularProduct,
)

from markets.producers import CircularProductCreatedProducer, CircularProductCreated

logger = structlog.get_logger(__name__)

producer = CircularProductCreatedProducer()


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
        return (
            Circular.objects.prefetch_related("market")
            .prefetch_related(
                Prefetch(
                    "circularproduct_set",
                    queryset=CircularProduct.objects.select_related("product"),
                )
            )
            .filter(expiration_date__gte=dt.now(UTC).strftime("%Y-%m-%d"))
        )


class RankCircularProductListView(generics.ListAPIView):
    serializer_class = RankCircularProductListSerializer

    def get_queryset(self):
        now = dt.now(UTC).date()  # Get the current date in a timezone-aware manner

        return Product.objects.prefetch_related(
            Prefetch(
                "circularproduct_set",
                queryset=CircularProduct.objects.select_related("circular").filter(
                    circular__expiration_date__gte=now
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
def upload_circular(request, pk):
    serializer = UploadCircularSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    market = get_object_or_404(Market, pk=pk)

    file = request.FILES["csv"]

    dtype_spec = {
        "name": str,
        "price": float,
        "weight": str,
        "brand": str,
    }
    df = pd.read_csv(file, dtype=dtype_spec)

    logger.info(f"Reading circular for market {market.name}", file=df)

    circular = market.circular_set.create(
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
            market=market,
            weight=row["weight"],
        ).first()

        if not product:
            product = Product.objects.create(
                name=product_name,
                price=product_price,
                weight=row["weight"],
                brand=row["brand"],
                market=market,
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
        self.queryset = Market.objects.filter(user=request.user)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        request.data["user"] = request.user.id

        return super().create(request, *args, **kwargs)


#


gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)


def get_address_by_cep(cep: str) -> Optional[str]:
    try:
        geocode_result = gmaps.geocode(cep)
    except Exception as e:
        logger.error(f"Error while geocoding address: {e}")
        return None

    geocode_result = cast(list[dict], geocode_result)

    if len(geocode_result) == 0:
        return None

    return geocode_result[0]["formatted_address"]


class AdminMarketUnitViewSet(ModelViewSet):
    queryset = MarketUnit.objects.all()
    serializer_class = AdminMarketUnitSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # get the market id from the request params
        market_id = self.kwargs.get("pk")
        market = get_object_or_404(Market, pk=market_id)
        cep = serializer.validated_data["cep"]
        address = get_address_by_cep(cep)

        serializer.validated_data["address"] = address
        serializer.validated_data["market"] = market

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
