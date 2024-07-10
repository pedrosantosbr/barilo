from django.urls import path
from circulars.views import upload_circular, CircularProductViewSet, SearchCircularListView, RankCircularProductListView

app_name = "markets"

urlpatterns = [
    path(
        "circulars/<str:pk>/prices/",
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
    # admin
    path(
        "admin/circulars/upload/",
        upload_circular,
        name="upload-circular",
    ),
]
