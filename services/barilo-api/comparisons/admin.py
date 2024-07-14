from django.contrib import admin
from comparisons.models import ProductIndex


class ProductIndexAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "weight", "brand", "address", "market_id")
    search_fields = ("name", "brand")
    list_filter = ("address", "brand")


admin.site.register(ProductIndex, ProductIndexAdmin)
