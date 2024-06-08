from django.db import models


class Market(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=11)
    cnpj = models.CharField(max_length=14)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class MarketUnit(models.Model):
    market = models.ForeignKey(Market, on_delete=models.CASCADE)
    address = models.CharField(max_length=500)
    cep = models.CharField(max_length=8)


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    weight = models.CharField(max_length=100)
    brand = models.CharField(max_length=100, blank=True, null=True)
    market = models.ForeignKey(Market, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Circular(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    market = models.ForeignKey(Market, on_delete=models.CASCADE)
    expiration_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CircularProduct(models.Model):
    circular = models.ForeignKey(Circular, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name}"
