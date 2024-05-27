from django.urls import path

from ranks.views import ProductRankViewSet

urlpatterns = [
    path("product-ranks/", ProductRankViewSet.as_view({"get": "list"})),
]
