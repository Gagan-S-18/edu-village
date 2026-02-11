from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.users.views import CustomTokenObtainPairView
from django.http import HttpResponse



urlpatterns = [
    path('admin/', admin.site.urls),
    
]

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns += [
   
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/courses/', include('apps.courses.urls')),
    path('api/enrollments/', include('apps.enrollments.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view()),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path("api/enrollments/", include("apps.enrollments.urls")),
    path("api/enrollments/", include("apps.enrollments.urls")),
    path("", lambda request: HttpResponse("Backend is running 🚀")),

]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
