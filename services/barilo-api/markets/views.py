import structlog
import googlemaps
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from core.authentication import JWTAuthentication
from typing import cast, TypedDict
from django.conf import settings
from django.contrib.gis.geos import Point

from markets.serializers import (
    MarketSerializer,
    AdminMarketSerializer,
    AdminLocationSerializer,
)

from markets.models import (
    Market,
    Location,
)


logger = structlog.get_logger(__name__)


class MarketViewSet(ModelViewSet):
    queryset = Market.objects.all()
    serializer_class = MarketSerializer


# -


class AdminMarketViewSet(ModelViewSet):
    queryset = Market.objects.all()
    serializer_class = AdminMarketSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def list(self, request, *args, **kwargs):
        self.queryset = Market.objects.filter(user=request.user)[:1]
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        request.data["user"] = request.user.id

        return super().create(request, *args, **kwargs)


#

gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)


class Address(TypedDict):
    address: str
    lat: float
    lng: float


def search_address_with_geolocation_by_cep(cep: str) -> Address:
    try:
        geocode_result = gmaps.geocode(cep)
    except Exception as e:
        logger.error(f"Error while geocoding address: {e}")
        return None

    geocode_result = cast(list[dict], geocode_result)

    if len(geocode_result) == 0:
        return None

    location = geocode_result[0]["geometry"]["location"]
    address = geocode_result[0]["formatted_address"]

    if location is None or address is None:
        raise ValueError("Invalid geocode result")

    return Address(address=address, lat=location["lat"], lng=location["lng"])


class AdminLocationViewSet(ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = AdminLocationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    lookup_field = "market_id"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exists = Location.objects.filter(
            cep=serializer.validated_data["cep"],
            market_id=self.kwargs.get("market_id"),
        ).exists()
        if exists:
            return Response(
                {"message": "Store already exists for this market."}, status=400
            )
        # get the market id from the request params
        market_id = self.kwargs.get("market_id")
        market = get_object_or_404(Market, pk=market_id)
        cep = serializer.validated_data["cep"]

        resp = search_address_with_geolocation_by_cep(cep)
        print("resp", resp)

        serializer.validated_data["address"] = resp["address"]
        serializer.validated_data["market"] = market

        # lng => x
        # lat => y
        serializer.validated_data["geolocation"] = Point(
            resp["lng"],
            resp["lat"],
            srid=4326,
        )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
