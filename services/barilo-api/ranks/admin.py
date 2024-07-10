from django.contrib import admin

from ranks.models import ProductRanking, ProductRankingItem

admin.site.register([ProductRanking, ProductRankingItem])
