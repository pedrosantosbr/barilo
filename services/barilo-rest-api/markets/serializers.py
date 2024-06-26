from rest_framework import serializers
from markets.models import (
    Market,
    Circular,
    Product,
    CircularProduct,
    MarketUnit,
)


class UploadCircularSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField()
    expiration_date = serializers.DateTimeField()
    csv = serializers.FileField()


class MarketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Market
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


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
    market = MarketSerializer(read_only=True)
    items = CircularProductSerializer(
        source="circularproduct_set", many=True, read_only=True
    )

    class Meta:
        model = Circular
        fields = ["id", "title", "description", "market", "expiration_date", "items"]


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


class AdminMarketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Market
        fields = "__all__"


class AdminMarketUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketUnit
        fields = "__all__"
        extra_kwargs = {"address": {"required": False}, "market": {"required": False}}
