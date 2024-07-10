from ranks.models import ProductRanking
from ranks.serializers import ProductRankingSerializer
from typing import Optional


class ProductRankingService:
    def get_by_product_attributes(
        self, name: str, weight: str, brand: Optional[str] = None
    ):
        queryset = ProductRanking.objects.filter(weight=weight)
        if brand is not None:
            queryset = queryset.filter(brand=brand)

        serializer = ProductRankingSerializer(queryset, many=True)
        return serializer.data
