from django.contrib.gis.db import models
import ulid


class Market(models.Model):
    id = models.CharField(
        max_length=26,
        primary_key=True,
        editable=False,
    )
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=11)
    cnpj = models.CharField(max_length=14)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = ulid.new()
        super().save(*args, **kwargs)


class Location(models.Model):
    market = models.ForeignKey(Market, on_delete=models.CASCADE)
    address = models.CharField(max_length=500)
    cep = models.CharField(max_length=8)
    geolocation = models.PointField(srid=4326)


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    weight = models.CharField(max_length=100)
    brand = models.CharField(max_length=100, blank=True, null=True)
    store = models.ForeignKey(Location, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Circular(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    store = models.ForeignKey(Location, on_delete=models.CASCADE)
    expiration_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CircularProduct(models.Model):
    """
    This model represents the products that are in a circular.
    """

    circular = models.ForeignKey(Circular, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name}"
