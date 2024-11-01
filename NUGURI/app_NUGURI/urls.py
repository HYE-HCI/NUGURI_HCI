from django.urls import path
from .views import product_list_view, product_detail_view

urlpatterns = [
    path('products/', product_list_view, name='product_list'),
    path('products/<int:product_id>/', product_detail_view, name='product_detail'),
]