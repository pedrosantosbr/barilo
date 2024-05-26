import pandas as pd
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import generics
from django.db import transaction
from datetime import datetime as dt, UTC
from django.db.models import Prefetch

from stores.serializers import (
    UploadCircularSerializer,
    StoreSerializer,
    CircularSerializer,
    CircularProductSerializer,
    SearchCircularSerializer,
    RankCircularProductListSerializer,
)

from stores.models import (
    Store,
    Product,
    Circular,
    CircularProduct,
)


import structlog

logger = structlog.get_logger(__name__)


class StoreViewSet(ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer


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
            Circular.objects.prefetch_related("store")
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

    store = Store.objects.get(id=pk)

    file = request.FILES["csv"]

    dtype_spec = {
        "name": str,
        "price": float,
        "weight": str,
        "brand": str,
    }
    df = pd.read_csv(file, dtype=dtype_spec)

    logger.info(f"Reading circular for store {store.name}", file=df)

    circular = store.circular_set.create(
        title=serializer.validated_data["title"],
        description=serializer.validated_data["description"],
        expiration_date=serializer.validated_data["expiration_date"],
    )

    # check if products already exist
    for _, row in df.iterrows():
        product = Product.objects.filter(
            name=row["name"].lower(),
            brand=row["brand"],
            store=store,
            weight=row["weight"],
        ).first()

        if not product:
            product = Product.objects.create(
                name=row["name"].lower(),
                price=row["price"],
                weight=row["weight"],
                brand=row["brand"],
                store=store,
            )

        circular_product = (
            CircularProduct.objects.filter(
                product=product,
                circular__expiration_date__gt=dt.now(UTC).strftime("%Y-%m-%d"),
            )
            .select_related("circular")
            .first()
        )

        if circular_product:
            return Response(
                {
                    "message": f"Product {product.name} already exists in a circular that expires on {circular_product.circular.expiration_date}."
                },
                status=400,
            )

        circular_product = CircularProduct.objects.create(
            circular=circular,
            product=product,
            discount_price=row["price"],
        )

    return Response({"message": "Circular uploaded successfully."})
