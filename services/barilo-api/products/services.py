from typing import Optional
from django.db import transaction
from products.models import Product
from products.producers import ProductCreatedProducer
from barilo.schemas.events import ProductCreatedEvent


def get_producer():
    return ProductCreatedProducer()


class ProductService:
    @transaction.atomic
    def create(
        self,
        market: str,
        name: str,
        price: float,
        weight: str,
        brand: Optional[str] = None,
    ):
        product = Product.objects.create(
            market=market, name=name, price=price, weight=weight, brand=brand
        )

        producer = get_producer()
        producer.publish(
            ProductCreatedEvent(
                market={"id": product.market, "name": product.market},
                name=product.name,
                price=product.price,
                weight=product.weight,
                brand=product.brand,
            )
        )

        return product

    def search(
        self,
        name: Optional[str],
        market: Optional[str],
        weight: Optional[str],
        brand: Optional[str],
    ):
        products = Product.objects.all()

        if name:
            products = products.filter(name__icontains=name)

        if market:
            products = products.filter(market=market)

        if weight:
            products = products.filter(weight=weight)

        if brand:
            products = products.filter(brand=brand)

        return products
