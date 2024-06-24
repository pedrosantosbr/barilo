from django.urls import path
from markets.views import (
    MarketViewSet,
    upload_circular,
    CircularViewSet,
    CircularProductViewSet,
    SearchCircularListView,
    RankCircularProductListView,
    AdminMarketViewSet,
    AdminLocationViewSet,
)

app_name = "markets"

urlpatterns = [
    # public resources
    path(
        "markets/",
        MarketViewSet.as_view({"get": "list"}),
        name="market-list",
    ),
    path(
        "markets/<str:market_id>/circulars/upload/",
        upload_circular,
        name="upload-circular",
    ),
    path(
        "markets/<int:pk>/circulars/",
        CircularViewSet.as_view({"get": "list"}),
        name="circular-list",
    ),
    path(
        "circulars/<int:pk>/prices/",
        CircularProductViewSet.as_view({"get": "list"}),
        name="circular-product-list",
    ),
    path(
        "circulars/search/",
        SearchCircularListView.as_view(),
        name="search-circulars",
    ),
    path(
        "circulars/rank/",
        RankCircularProductListView.as_view(),
        name="rank-circulars",
    ),
    # user resources
    path(
        "admin/markets/",
        AdminMarketViewSet.as_view({"get": "list", "post": "create"}),
        name="admin-market-list",
    ),
    path(
        "admin/markets/<str:market_id>/locations/",
        AdminLocationViewSet.as_view({"get": "list", "post": "create"}),
        name="location-list",
    ),
]
