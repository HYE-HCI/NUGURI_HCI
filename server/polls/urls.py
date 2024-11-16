from django.urls import path
from . import views

app_name = "polls"
urlpatterns = [
    path('', views.main_view, name='main'),  # 메인 페이지 URL 추가
    path('analyze_image', views.analyze_image, name='analyze_image'),
    path('process_audio', views.process_audio, name='process_audio'),
]