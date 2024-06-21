from django.urls import path
from accounts.views import (
    user_preferences,
    whatsapp_numbers,
    user_info,
    create_account,
)

urlpatterns = [
    path("current-user/", user_info, name="me"),
    path("preferences/", user_preferences, name="set-address"),
    path("create-account/", create_account, name="create-account"),
    path("whatsapp/phone-numbers/", whatsapp_numbers, name="whatsapp-numbers"),
]
