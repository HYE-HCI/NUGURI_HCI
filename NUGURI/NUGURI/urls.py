# NUGURI/urls.py
from django.contrib import admin  # admin을 임포트합니다.
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # admin URL을 추가합니다.
    path('app/', include('app_NUGURI.urls')),  # app_NUGURI의 URL을 포함
]

# MEDIA_URL 설정 추가
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
