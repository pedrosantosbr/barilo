import ulid
from django.db import models
from markets.models import Location
from products.models import Product


class BaseModel(models.Model):
    id = models.CharField(max_length=26, primary_key=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = ulid.new()
        super().save(*args, **kwargs)


class Circular(BaseModel):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    title = models.CharField(max_length=100)
    description = models.TextField()
    expiration_date = models.DateField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CircularProduct(BaseModel):
    """
    This model represents the products that are in a circular.
    """

    circular = models.ForeignKey(Circular, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name}"
