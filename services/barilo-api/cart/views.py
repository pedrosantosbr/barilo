from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers
from products.models import Product
from cart.cart import Cart
from markets.serializers import MarketSerializer, LocationSerializer
from django.shortcuts import get_object_or_404


class ProductSerializer(serializers.ModelSerializer):
    market = MarketSerializer(read_only=True)
    location = LocationSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "price", "weight", "brand", "market", "location"]


class CartItemSerializer(serializers.Serializer):
    product = ProductSerializer()
    quantity = serializers.IntegerField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)


@api_view(["POST"])
def cart_add(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(product)
    quantity = int(request.data.get("quantity", 1))
    cart.add(product=product, quantity=quantity)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def cart_remove(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.remove(product)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def cart_update(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(product)
    quantity = int(request.data.get("quantity", 1))
    cart.update(product=product, quantity=quantity)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def cart_detail(request):
    cart = Cart(request)
    items = list(cart)
    serializer = CartItemSerializer(items, many=True)
    return Response(serializer.data)
