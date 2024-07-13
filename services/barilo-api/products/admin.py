from django.contrib import admin
from products.models import Product


# show product attributes in admin
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "weight", "brand", "_v")
    search_fields = ("name", "brand")
    list_filter = ("market",)


admin.site.register(Product, ProductAdmin)
