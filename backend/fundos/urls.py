from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FundoViewSet, RelatorioViewSet

router = DefaultRouter()
router.register(r'fundos', FundoViewSet)
router.register(r'relatorios', RelatorioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]

