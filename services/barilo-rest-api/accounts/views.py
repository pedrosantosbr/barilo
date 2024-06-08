import googlemaps

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
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
from typing import Optional

from accounts.serializers import PreferencesSerializer

from accounts.models import User, WhatsAppNumber
from accounts.serializers import (
    LoggedInUserSerializerReadOnly,
    WhatsAppNumberSerializer,
    UserSerializer,
)

import structlog

logger = structlog.get_logger(__name__)

location_key = "barilo.address"
preferences_key = "barilo.preferences"

gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)


def get_address_by_cep(cep: str) -> Optional[str]:
    try:
        geocode_result = gmaps.geocode(cep)
    except Exception as e:
        logger.error(f"Error while geocoding address: {e}")
        return None

    geocode_result = cast(list[dict], geocode_result)

    if len(geocode_result) == 0:
        return None

    return geocode_result[0]["formatted_address"]


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

    address = get_address_by_cep(cep)
    if not address:
        return Response(
            {"error": f"Address not found for cep {cep}"},
            status=status.HTTP_404_NOT_FOUND,
        )

    matrix = gmaps.distance_matrix(origins=address, destinations="Av. Paulista, 1000")

    logger.info(f"Matrix: {matrix}")

    response = Response({"address": address}, status=status.HTTP_201_CREATED)
    response.set_cookie(location_key, address)

    return response


@api_view(["GET", "POST"])
def user_preferences(request):
    if request.method == "GET":
        serializer = PreferencesSerializer(data=request.session.get(preferences_key))
        if not serializer.is_valid():
            request.session[preferences_key] = {}

        response = Response(request.session[preferences_key])
        response.set_cookie(preferences_key, request.session[preferences_key])
        return response

    serializer = PreferencesSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    address = get_address_by_cep(serializer.validated_data["cep"])
    if not address:
        return Response(
            {"error": f"Address not found for cep {serializer.validated_data['cep']}"},
            status=status.HTTP_404_NOT_FOUND,
        )

    request.session[preferences_key] = {
        "cep": serializer.validated_data["cep"],
        "distance": serializer.validated_data["distance"],
        "address": address,
    }

    response = Response(
        request.session[preferences_key], status=status.HTTP_201_CREATED
    )

    response.set_cookie(
        preferences_key, request.session[preferences_key], samesite="lax"
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
    serialzier = UserSerializer(data=request.data)
    serialzier.is_valid(raise_exception=True)

    user = User.objects.create_user(
        email=serialzier.validated_data["email"],
        name=serialzier.validated_data["name"],
        password=serialzier.validated_data["password"],
    )

    return Response({"id": user.id}, status=status.HTTP_201_CREATED)
