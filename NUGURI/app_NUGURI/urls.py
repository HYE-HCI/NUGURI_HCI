from django.urls import path
from .views import product_list_view, product_detail_view, process_product_image
from django.conf import settings
from django.conf.urls.static import static
from .views import connect_action, disconnect_action

urlpatterns = [
    path('connect/', connect_action, name='connect_action'),
    path('disconnect/', disconnect_action, name='disconnect_action'),
    path('products/', product_list_view, name='product_list'),
    path('products/<int:product_id>/', product_detail_view, name='product_detail'),
    path('process_image/<int:product_id>/', process_product_image, name='process_product_image'), 
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)