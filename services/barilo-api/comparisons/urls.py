from django.urls import path
from comparisons.views import SearchProcuctBucketListView

app_name = "comparisons"

urlpatterns = [
    # public resources
    path(
        "comparison/search/",
        SearchProcuctBucketListView.as_view(),
        name="productbucket-search",
    )
]
