from django.urls import path
from . import views

app_name = "cart"

urlpatterns = [
    path("", views.cart_detail, name="cart_detail"),
    path("add/<str:product_id>/", views.cart_add, name="cart_add"),
    path("remove/<str:product_id>/", views.cart_remove, name="cart_remove"),
    path("update/<str:product_id>/", views.cart_update, name="cart_update"),
]
