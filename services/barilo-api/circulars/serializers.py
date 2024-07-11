from rest_framework import serializers
from circulars.models import (
    Circular,
    Product,
    CircularProduct,
)
from markets.models import Market, Product
from markets.serializers import ProductSerializer


class UploadCircularSerializer(serializers.Serializer):
    location_id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    expiration_date = serializers.DateTimeField()
    file = serializers.FileField()


class CircularProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = CircularProduct
        fields = "__all__"


class CircularSerializer(serializers.ModelSerializer):
    class Meta:
        model = Circular
        fields = "__all__"


class SearchCircularSerializer(serializers.ModelSerializer):
    items = CircularProductSerializer(
        source="circularproduct_set", many=True, read_only=True
    )
    market = serializers.SerializerMethodField()

    class Meta:
        model = Circular
        fields = [
            "id",
            "title",
            "description",
            "expiration_date",
            "market",
            "items",
        ]

    def get_market(self, obj):
        return {
            "id": obj.location.market.id,
            "name": obj.location.market.name,
            "address": obj.location.address,
        }


class RankCircularProductListSerializer(serializers.ModelSerializer):
    markets = serializers.SerializerMethodField()
    discount_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_discount_price(self, obj):
        # Assuming you want the discount_price from the first related CircularProduct
        circular_product = obj.circularproduct_set.first()
        if circular_product:
            return str(circular_product.discount_price)
        return None

    def get_markets(self, obj):
        # Assuming you want the market names from all related CircularProduct
        return [cp.circular.market.name for cp in obj.circularproduct_set.all()]

