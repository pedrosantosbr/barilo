from django.urls import path
from markets.views import (
    MarketViewSet,
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
