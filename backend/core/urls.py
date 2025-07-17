from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autentização
    path('api/', include('users.urls')),
    
    # JWT Login
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
