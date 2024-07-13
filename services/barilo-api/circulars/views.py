from django.db import transaction
import pandas as pd
from datetime import datetime as dt, UTC

from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework import generics
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.db.models import Prefetch
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from markets.models import Location
from products.models import Product
from circulars.models import CircularProduct, Circular
from circulars.serializers import (
    UploadCircularSerializer,
    RankCircularProductListSerializer,
    CircularSerializer,
    CircularProductSerializer,
    SearchCircularSerializer,
)
from products.producers import send_product_created


import structlog

logger = structlog.get_logger(__name__)


# Create your views here.
@api_view(["POST"])
def upload_circular(request):
    serializer = UploadCircularSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    location = get_object_or_404(Location, pk=serializer.validated_data["location_id"])

    file = request.FILES["file"]

    dtype_spec = {
        "name": str,
        "price": float,
        "weight": str,
        "brand": str,
    }

    try:
        df = pd.read_csv(file, dtype=dtype_spec)
    except Exception as e:
        logger.error("Error reading CSV file", error=str(e))
        return Response({"message": "Error reading CSV file."}, status=400)

    logger.info(f"Reading circular for market {location.market.name}", file=df)

    circular = location.circular_set.create(
        title=serializer.validated_data["title"],
        description=serializer.validated_data["description"],
        expiration_date=serializer.validated_data["expiration_date"],
    )

    with transaction.atomic():
        # check if products already exist
        for _, row in df.iterrows():
            logger.info("Processing row", row=row)
            product_name = row["name"].lower()

            try:
                product_price = int(row["price"])
            except ValueError:
                raise ValidationError({"message": f"Invalid price for {product_name}"})

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
                transaction.on_commit(lambda: send_product_created(product))

            # -

            circularproduct = (
                CircularProduct.objects.filter(
                    description=product_name,
                    product=product,
                    circular__expiration_date__gt=dt.now(UTC).strftime("%Y-%m-%d"),
                )
                .select_related("circular")
                .first()
            )

            if not circularproduct:
                circularproduct = CircularProduct.objects.create(
                    description=f"{product.brand} {product.name} {product.weight}".strip(),
                    circular=circular,
                    product=product,
                    discount_price=product_price,
                )

    return Response({"message": "Circular uploaded successfully."})


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
