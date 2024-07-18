from django.contrib import admin
from markets.models import (
    Market,
    Location,
)

# Register your models here.
admin.site.register([Market, Location])
