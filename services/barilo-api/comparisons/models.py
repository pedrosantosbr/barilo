from django.db import models
import ulid
from products.models import Product


class ProductBucket(models.Model):
    id = models.CharField(max_length=26, primary_key=True, editable=False)

    name = models.CharField(max_length=500)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = ulid.new()
        super().save(*args, **kwargs)


class ProductBucketItem(models.Model):
    id = models.CharField(max_length=26, primary_key=True, editable=False)

    bucket = models.ForeignKey(ProductBucket, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = ulid.new()
        super().save(*args, **kwargs)
