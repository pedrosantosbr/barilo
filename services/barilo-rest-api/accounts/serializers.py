from rest_framework import serializers


class AddAddressSerializer(serializers.Serializer):
    cep = serializers.CharField(max_length=8)


class PreferencesSerializer(serializers.Serializer):
    cep = serializers.CharField(max_length=8)
    distance = serializers.IntegerField()


class LoggedInUserSerializerReadOnly(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    name = serializers.CharField(read_only=True)
