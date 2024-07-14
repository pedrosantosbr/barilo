from django.db import models


class ProductIndex(models.Model):
    name = models.CharField(max_length=500)
    price = models.CharField(max_length=10)
    weight = models.CharField(max_length=80)
    brand = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=500)

    market = models.ForeignKey("markets.Market", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("name", "market_id", "address")
        indexes = [models.Index(fields=["name", "market_id", "address"])]
