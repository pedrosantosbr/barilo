from django.contrib import admin
from comparisons.models import ProductBucket, ProductBucketItem


class ProductBucketAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]


class ProductBucketItemAdmin(admin.ModelAdmin):
    list_display = ["id", "bucket", "product_metadata"]

    # custom product name
    def product_metadata(self, obj):
        return obj.product.name + " - " + obj.product.location.cep


admin.site.register(ProductBucket, ProductBucketAdmin)
admin.site.register(ProductBucketItem, ProductBucketItemAdmin)
