import googlemaps

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ParseError
from core.authentication import JWTAuthentication
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from typing import cast
from typing import TypedDict

from accounts.serializers import PreferencesSerializer

from accounts.models import User, WhatsAppNumber
from accounts.serializers import (
    LoggedInUserSerializerReadOnly,
    WhatsAppNumberSerializer,
    RegisterUserSerializer,
)

import structlog

logger = structlog.get_logger(__name__)

LOCATION_KEY = "barilo.address"
PREFERENCES_KEY = "barilo.preferences"

gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)


class Location(TypedDict):
    address: str
    lat: float
    lng: float


def search_user_location(cep: str) -> Location:
    try:
        geocode_result = gmaps.geocode(cep)
    except Exception as e:
        logger.error(f"Error while geocoding address: {e}")
        raise ParseError("Error while geocoding address")

    geocode_result = cast(list[dict], geocode_result)

    if len(geocode_result) == 0:
        raise ParseError("Location not found")

    location = geocode_result[0]["geometry"]["location"]
    address = geocode_result[0]["formatted_address"]

    if location is None or address is None:
        raise ParseError("Invalid geocode result")

    return Location(address=address, lat=location["lat"], lng=location["lng"])


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = get_object_or_404(User, pk=request.user.id)
    serializer = LoggedInUserSerializerReadOnly(user)
    return Response(serializer.data)


@api_view(["GET"])
def set_address(request):
    cep = request.query_params.get("cep")
    if not cep:
        return Response(
            {"error": "cep query parameter is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    address = search_user_location(cep)

    response = Response({"address": address}, status=status.HTTP_201_CREATED)
    response.set_cookie(LOCATION_KEY, address)

    return response


@api_view(["GET", "POST"])
def user_preferences(request):
    if request.method == "GET":
        serializer = PreferencesSerializer(data=request.session.get(PREFERENCES_KEY))
        if not serializer.is_valid():
            request.session[PREFERENCES_KEY] = {}

        response = Response(request.session[PREFERENCES_KEY])
        response.set_cookie(PREFERENCES_KEY, request.session[PREFERENCES_KEY])
        return response

    serializer = PreferencesSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    location = search_user_location(serializer.validated_data["cep"])

    request.session[PREFERENCES_KEY] = {
        "cep": serializer.validated_data["cep"],
        "location": location,
    }

    if "radius" not in serializer.validated_data:
        request.session[PREFERENCES_KEY]["radius"] = 10

    response = Response(
        request.session[PREFERENCES_KEY], status=status.HTTP_201_CREATED
    )

    response.set_cookie(
        PREFERENCES_KEY, request.session[PREFERENCES_KEY], samesite="lax"
    )

    return response


@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def whatsapp_numbers(request):
    if request.method == "GET":
        numbers = WhatsAppNumber.objects.filter(user=request.user)
        serializer = WhatsAppNumberSerializer(numbers, many=True)
        results = [number["phone_number"] for number in serializer.data]
        return Response(results)

    serializer = WhatsAppNumberSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    sanitized_number = (
        serializer.validated_data["phone_number"]
        .replace(" ", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
    )

    exists = WhatsAppNumber.objects.filter(phone_number=sanitized_number).exists()
    if exists:
        return Response(
            {"error": "Phone number already exists"}, status=status.HTTP_400_BAD_REQUEST
        )

    new_number = WhatsAppNumber.objects.create(
        user=request.user, phone_number=sanitized_number
    )
    new_number.save()

    return Response(
        {"phone_number": new_number.phone_number}, status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
def create_account(request):
    serialzier = RegisterUserSerializer(data=request.data)
    serialzier.is_valid(raise_exception=True)

    user = User.objects.create_user(
        email=serialzier.validated_data["email"],
        name=serialzier.validated_data["name"],
        password=serialzier.validated_data["password"],
    )

    return Response({"id": user.id}, status=status.HTTP_201_CREATED)
