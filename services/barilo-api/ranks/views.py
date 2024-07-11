from rest_framework.viewsets import ModelViewSet
from django.db.models import Prefetch
from datetime import datetime as dt, UTC

from ranks.models import ProductRanking, ProductRankingItem
from ranks.serializers import ProductRankingSerializer


class ProductRankViewSet(ModelViewSet):
    serializer_class = ProductRankingSerializer

    class Meta:
        model = ProductRanking
        fields = "__all__"

    def get_queryset(self):
        today = dt.now(UTC)
        return ProductRanking.objects.prefetch_related(
            Prefetch(
                "productrankingitem_set",
                queryset=ProductRankingItem.objects.filter(expiration_date__gte=today),
                to_attr="items",
            )
        )
