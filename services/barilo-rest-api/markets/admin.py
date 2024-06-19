from django.contrib import admin
from markets.models import (
    Market,
    Store,
    Product,
    Circular,
    CircularProduct,
)

# Register your models here.
admin.site.register([Market, Store, Product, Circular, CircularProduct])
