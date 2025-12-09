from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.eshop.admin import custom_admin_site

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('admin/', custom_admin_site.urls),
    

    # API Endpoints
    path('api/auth/', include('apps.usr.urls')),
    path('api/', include('apps.eshop.urls')),
    
    # API Schema / Docs
    path('api/schema/file', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger_ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# --------------------
# Admin site customization
# --------------------
admin.site.site_header = "Dany Shop | Admin"
admin.site.index_title = "Management"
admin.site.site_title = "Control Panel"