from django.urls import path
from markets.views import (
    MarketViewSet,
    upload_circular,
    CircularViewSet,
    CircularProductViewSet,
    SearchCircularListView,
    RankCircularProductListView,
)

urlpatterns = [
    path("markets/", MarketViewSet.as_view({"get": "list", "post": "create"})),
    path("markets/<int:pk>/circulars/upload", upload_circular),
    path("markets/<int:pk>/circulars/", CircularViewSet.as_view({"get": "list"})),
    path("circulars/<int:pk>/prices/", CircularProductViewSet.as_view({"get": "list"})),
    path(
        "circulars/search/", SearchCircularListView.as_view(), name="search-circulars"
    ),
    path(
        "circulars/rank/",
        RankCircularProductListView.as_view(),
        name="rank-circulars",
    ),
]