from django.contrib import admin
from markets.models import (
    Market,
    MarketUnit,
    Product,
    Circular,
    CircularProduct,
)

# Register your models here.
admin.site.register([Market, MarketUnit, Product, Circular, CircularProduct])
