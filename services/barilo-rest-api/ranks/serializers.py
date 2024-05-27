from rest_framework import serializers
from ranks.models import ProductRanking, ProductRankingItem


class ProductRankingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRankingItem
        fields = "__all__"


class ProductRankingSerializer(serializers.ModelSerializer):
    items = ProductRankingItemSerializer(many=True, read_only=True)

    class Meta:
        model = ProductRanking
        fields = [
            "id",
            "title_index",
            "weight_index",
            "brand_index",
            "items",
            "created_at",
            "updated_at",
        ]
