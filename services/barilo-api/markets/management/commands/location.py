from django.core.management.base import BaseCommand
from markets.models import Location

from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance


class Command(BaseCommand):
    help = "Add a location"

    def handle(self, *args, **kwargs):
        # with transaction.atomic():
        #     user = User.objects.create_user(
        #         email="test3@barilo.com",
        #         password="test123",
        #         name="Test User 3",
        #     )
        #     market = Market.objects.create(
        #         user=user,
        #         cnpj="12345678901232",
        #         name="Example Market 3",
        #         phone_number="11999999999",
        #         email="market3@gmail.com",
        #     )

        #     store = Store(
        #         market=market,
        #         cep="00000000",
        #         address="Rua Exemplo",
        #         location=Point(-22.5367035, -44.1843431),  # Longitude, Latitude
        #     )
        #     store.save()

        #     store = Store(
        #         market=market,
        #         cep="00000000",
        #         address="Rua Exemplo",
        #         location=Point(-22.54441, -44.1626821),  # Longitude, Latitude
        #     )
        #     store.save()

        user_location = Point(
            float(-22.5741986),
            float(
                -44.17395260000001,
            ),
            srid=4326,
        )
        radius = 3
        nearby = (
            Location.objects.annotate(distance=Distance("location", user_location))
            .filter(distance__lte=radius * 1000)
            .order_by("distance")
        )

        print(nearby)

        self.stdout.write(self.style.SUCCESS("Successfully added location"))
