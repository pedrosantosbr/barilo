from rest_framework import serializers
from accounts.models import User


class RegisterUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=100)
    password_confirmation = serializers.CharField(max_length=100)

    def validate(self, attrs):
        email = attrs.get("email")
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already in use"})

        if attrs.get("password") != attrs.get("password_confirmation"):
            raise serializers.ValidationError(
                {"password": "Password and password confirmation must match"}
            )

        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "name", "password"]
        extra_kwargs = {"password": {"write_only": True}}


class AddAddressSerializer(serializers.Serializer):
    cep = serializers.CharField(max_length=8)


class PreferencesSerializer(serializers.Serializer):
    cep = serializers.CharField(max_length=8)
    distance = serializers.IntegerField()


class LoggedInUserSerializerReadOnly(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    name = serializers.CharField(read_only=True)


class WhatsAppNumberSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=11)
