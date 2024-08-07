from rest_framework import serializers
from markets.models import (
    Market,
    Location,
)


class MarketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Market
        fields = "__all__"


class ReadMarketSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    # logo = serializers.URLField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()


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
            "geolocation": {
                "lat": instance.geolocation.y,
                "lng": instance.geolocation.x,
            },
        }
