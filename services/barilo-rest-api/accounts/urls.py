from django.urls import path
from accounts.views import user_preferences, whatsapp_numbers, user_info

urlpatterns = [
    path("current-user/", user_info, name="me"),
    path("lo/preferences/", user_preferences, name="set-address"),
    path("lo/whatsapp-numbers", whatsapp_numbers),
]
