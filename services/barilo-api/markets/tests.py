from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from accounts.models import User
from markets.models import Market, Location


class MarketTests(APITestCase):
    token: str = ""

    def _obtain_jwt_token(self, email, password):
        url = reverse("token_obtain_pair")
        resp = self.client.post(
            url,
            data={"email": email, "password": password},
            format="json",
        )
        print(resp.json())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.token = resp.data["access"]

    def test_create_market(self):
        url = reverse("markets:admin-market-list")

        user = User.objects.create_user("testuser", "123456")

        data = {
            "user": user.id,
            "name": "Market Test",
            "phone_number": "1234567890",
            "cnpj": "12345678901234",
            "email": "test.user@email.com",
        }

        self._obtain_jwt_token(user.email, "123456")
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + self.token)
        resp = self.client.post(url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Market.objects.count(), 1)

    def test_create_location(self):
        market = Market.objects.create(
            user=User.objects.create_user(
                email="test.user@email.com", password="testpassword123"
            ),
            name="Market Test",
            phone_number="1234567890",
            cnpj="12345678901234",
            email="test.user@email.com",
        )

        url = reverse("markets:location-list", kwargs={"market_id": market.id})

        data = {
            "cep": "27340270",  # need to be a real CEP
        }

        self._obtain_jwt_token(market.user.email, "testpassword123")
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + self.token)
        resp = self.client.post(url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Location.objects.count(), 1)
