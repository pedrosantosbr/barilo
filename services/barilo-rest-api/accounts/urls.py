from django.urls import path
from accounts.views import user_preferences, whatsapp_numbers, user_info

urlpatterns = [
    path("current-user/", user_info, name="me"),
    path("preferences/", user_preferences, name="set-address"),
    path("whatsapp/phone-numbers/", whatsapp_numbers, name="whatsapp-numbers"),
]
