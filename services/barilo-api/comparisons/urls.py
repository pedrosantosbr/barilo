from django.urls import path
from comparisons.views import ListProcuctBucketListView

app_name = "comparisons"

urlpatterns = [
    # public resources
    path(
        "comparison/",
        ListProcuctBucketListView.as_view(),
        name="productbucket-list",
    ),
]
