from django.contrib import admin
from markets.models import Market, Product, Circular, CircularProduct

# Register your models here.
admin.site.register([Market, Product, Circular, CircularProduct])
