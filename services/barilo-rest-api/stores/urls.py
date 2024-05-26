from django.urls import path
from stores.views import (
    StoreViewSet,
    upload_circular,
    CircularViewSet,
    CircularProductViewSet,
    SearchCircularListView,
    RankCircularProductListView,
)

urlpatterns = [
    path("stores/", StoreViewSet.as_view({"get": "list", "post": "create"})),
    path("stores/<int:pk>/circulars/upload", upload_circular),
    path("stores/<int:pk>/circulars/", CircularViewSet.as_view({"get": "list"})),
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
