from rest_framework import filters

from comparisons.models import ProductBucket, ProductBucketItem
from products.models import Product
from rest_framework import serializers, generics
from django.db.models import Prefetch
from markets.models import Location
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.postgres.search import SearchVector

import structlog

logger = structlog.get_logger(__name__)


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "brand", "weight", "price", "location", "market"]


class ProductBucketItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ProductBucketItem
        fields = ["id", "product"]


class ProductBucketSerializer(serializers.ModelSerializer):
    # product_bucket_items = ProductBucketItemSerializer(many=True, read_only=True)

    total = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()
    cheapest_product = serializers.SerializerMethodField()

    class Meta:
        model = ProductBucket
        fields = [
            "id",
            "name",
            "total",
            "products",
            "cheapest_product",
        ]

    def get_total(self, obj):
        return len(obj.product_bucket_items)

    def get_products(self, obj):
        products = []

        for product_bucket_item in obj.product_bucket_items:
            products.append(ProductSerializer(product_bucket_item.product).data)

        return products

    def get_cheapest_product(self, obj):
        return ProductSerializer(obj.product_bucket_items[0].product).data


class ProductBucketSearchFilter(filters.SearchFilter):
    search_param = "name"


class SearchProcuctBucketListView(generics.ListAPIView):
    queryset = ProductBucket.objects.prefetch_related(
        Prefetch(
            lookup="productbucketitem_set",
            queryset=ProductBucketItem.objects.prefetch_related("product").all(),
            to_attr="product_bucket_items",
        )
    ).all()

    serializer_class = ProductBucketSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["@name"]

    def get_queryset(self):
        queryset = ProductBucket.objects.annotate(search=SearchVector("name")).filter(
            search=self.request.query_params.get("name", None)
        )

        lng = self.request.query_params.get("lng", None)
        lat = self.request.query_params.get("lat", None)
        rad = self.request.query_params.get("rad", None)

        if not (lng and lat and rad):
            return queryset.prefetch_related(
                Prefetch(
                    "productbucketitem_set",
                    queryset=ProductBucketItem.objects.prefetch_related("product"),
                    to_attr="product_bucket_items",
                )
            )

        try:
            user_location = Point(float(lng), float(lat), srid=4326)
            rad = float(rad)
        except (ValueError, TypeError):
            logger.error("Invalid query parameters", lng=lng, lat=lat, rad=rad)
            return queryset.prefetch_related(
                Prefetch(
                    "productbucketitem_set",
                    queryset=ProductBucketItem.objects.prefetch_related("product"),
                    to_attr="product_bucket_items",
                )
            )

        if user_location:
            # Get all locations within the radius
            nearby_locations = (
                Location.objects.annotate(
                    distance=Distance("geolocation", user_location)
                )
                .filter(distance__lte=rad * 1000)
                .values_list("id", flat=True)
            )

            # Get all products within the nearby locations
            filtered_items = (
                ProductBucketItem.objects.filter(
                    product__location__id__in=nearby_locations
                )
                .prefetch_related("product")
                .annotate(
                    distance=Distance("product__location__geolocation", user_location)
                )
                .order_by("product__price", "distance")
            )

            # Prefetch the filtered items
            queryset = queryset.prefetch_related(
                Prefetch(
                    "productbucketitem_set",
                    queryset=filtered_items,
                    to_attr="product_bucket_items",
                )
            )

        return queryset
