import ulid
from django.contrib.gis.db import models


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


class Market(BaseModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=11)
    cnpj = models.CharField(max_length=14)
    email = models.EmailField()

    def __str__(self):
        return self.name


class Location(BaseModel):
    market = models.ForeignKey(Market, on_delete=models.CASCADE)
    address = models.CharField(max_length=500)
    cep = models.CharField(max_length=8)
    geolocation = models.PointField(srid=4326)

    def __str__(self):
        return self.cep
