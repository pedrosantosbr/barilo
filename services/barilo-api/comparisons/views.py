from rest_framework import filters

from comparisons.models import ProductBucket, ProductBucketItem
from products.models import Product
from rest_framework import serializers, generics
from django.db.models import Prefetch

import structlog

logger = structlog.get_logger(__name__)


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "brand", "weight", "price", "location"]


class ProductBucketItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ProductBucketItem
        fields = ["id", "product"]


class ProductBucketSerializer(serializers.ModelSerializer):
    # product_bucket_items = ProductBucketItemSerializer(many=True, read_only=True)

    total = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()
    lower_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductBucket
        fields = ["id", "name", "total", "products", "lower_price", "max_price"]

    def get_total(self, obj):
        return len(obj.product_bucket_items)

    def get_products(self, obj):
        products = []

        for product_bucket_item in obj.product_bucket_items:
            products.append(ProductSerializer(product_bucket_item.product).data)

        return products

    def get_lower_price(self, obj):
        prices = []
        for product in obj.product_bucket_items:
            prices.append(product.product.price)
        return min(prices)

    def get_max_price(self, obj):
        prices = []
        for product in obj.product_bucket_items:
            prices.append(product.product.price)
        return max(prices)


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
