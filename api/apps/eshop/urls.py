from django.urls import include, path
from rest_framework_nested import routers
from apps.eshop.views import *

router = routers.SimpleRouter()

urlpatterns = [
    path("", include(router.urls)),
]