from django.contrib import admin
from markets.models import (
    Market,
    Location,
    Product,
    Circular,
    CircularProduct,
)

# Register your models here.
admin.site.register([Market, Location, Product, Circular, CircularProduct])
