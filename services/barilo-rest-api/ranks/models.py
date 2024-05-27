from typing import Any, Unpack
from django.db import models


class ProductRanking(models.Model):
    title_index = models.CharField(max_length=500)
    weight_index = models.CharField(max_length=255)
    brand_index = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title_index}"


class ProductRankingItem(models.Model):
    expiration_date = models.DateField()

    rank = models.ForeignKey(ProductRanking, on_delete=models.CASCADE)
    circular_id = models.IntegerField()
    productcircular_id = models.IntegerField()
    productcircular_description = models.CharField(max_length=255)
    productcircular_discount_price = models.DecimalField(
        max_digits=10, decimal_places=2
    )
    product_weight = models.CharField(max_length=255)
    product_brand = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
