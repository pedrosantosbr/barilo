from django.urls import path
from comparisons.views import ProcuctBucketViewSet

app_name = "comparisons"

urlpatterns = [
    # public resources
    path(
        "comparison/",
        ProcuctBucketViewSet.as_view({"get": "list"}),
        name="productbucket-list",
    ),
]
