from django.contrib import admin
from products.models import Product


# show product attributes in admin
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "weight", "brand", "market", "location", "_v")
    search_fields = ("name", "brand", "location")
    list_filter = ("market", "location")


admin.site.register(Product, ProductAdmin)
