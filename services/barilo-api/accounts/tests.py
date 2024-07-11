from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from accounts.models import User


class UserTests(APITestCase):
    def test_register_user(self):
        url = reverse("create-account")
        data = {
            "email": "test.user@email.com",
            "password": "password123",
            "password_confirmation": "password123",
            "name": "Test User",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)

    def test_token_obtain_pair(self):
        user = User.objects.create_user(
            email="test.user@emailcom", password="password123", name="Test User"
        )

        url = reverse("token_obtain_pair")
        data = {
            "email": user.email,
            "password": "password123",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
