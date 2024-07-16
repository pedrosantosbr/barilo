from rest_framework import viewsets

from comparisons.models import ProductBucket, ProductBucketItem
from products.models import Product
from rest_framework import serializers
from django.db.models import Prefetch


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
    product_bucket_items = ProductBucketItemSerializer(many=True, read_only=True)

    class Meta:
        model = ProductBucket
        fields = ["id", "name", "product_bucket_items"]


class ProcuctBucketViewSet(viewsets.ModelViewSet):
    queryset = ProductBucket.objects.prefetch_related(
        Prefetch(
            lookup="productbucketitem_set",
            queryset=ProductBucketItem.objects.select_related("product").all(),
            to_attr="product_bucket_items",
        )
    ).all()
    serializer_class = ProductBucketSerializer
