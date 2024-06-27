from rest_framework import serializers
from markets.models import (
    Market,
    Circular,
    Product,
    CircularProduct,
    Location,
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


class LocationSerializer(serializers.ModelSerializer):
    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ["id", "cep", "address", "lat", "lng"]

    def get_lng(self, obj):
        return obj.geolocation.x

    def get_lat(self, obj):
        return obj.geolocation.y


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


class AdminMarketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Market
        fields = "__all__"


class AdminLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"
        extra_kwargs = {
            "address": {"required": False},
            "market": {"required": False},
            "geolocation": {"required": False},
        }

    def validate_cep(self, value):
        if len(value) != 8:
            raise serializers.ValidationError("CEP must have 8 characters.")
        return value

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "address": instance.address,
            "cep": instance.cep,
            "market": instance.market.name,
        }
