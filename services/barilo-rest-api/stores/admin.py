from django.contrib import admin
from stores.models import Store, Product, Circular, CircularProduct

# Register your models here.
admin.site.register([Store, Product, Circular, CircularProduct])
