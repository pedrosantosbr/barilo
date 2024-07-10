from django.urls import path
from markets.views import (
    SearchCircularListView,
    RankCircularProductListView,
)

app_name = "markets"

urlpatterns = [
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
]
