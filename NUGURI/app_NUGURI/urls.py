from django.urls import path
from .views import product_list_view, product_detail_view, process_product_image, analyze_image, process_audio
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    ### Dohoon
    path('products/', product_list_view, name='product_list'),
    path('products/<int:product_id>/', product_detail_view, name='product_detail'),
    ### Hyunwook
    path('process_image/<int:product_id>/', process_product_image, name='process_product_image'),
    path('analyze_image/', analyze_image, name='analyze_image'),  # 이미지 분석
    path('process_audio/', process_audio, name='process_audio'),  # 음성 + 이미지 처리
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)