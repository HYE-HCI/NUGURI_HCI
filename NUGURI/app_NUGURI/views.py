from django.http import FileResponse, JsonResponse, HttpResponseNotFound , HttpResponse
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from .models import Product
from edge import process_image  # 이미지 처리 함수 import
import os

def product_list_view(request):
    products = Product.objects.all()
    return render(request, 'app_NUGURI/product_list.html', {'products': products})

def product_detail_view(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return render(request, 'app_NUGURI/product_detail.html', {'product': product})

# 이미지 처리 뷰 추가
def process_product_image(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        image_path = product.image.path  # 이미지 파일 경로 가져오기
        print('이미지 경로:', image_path)
        
        try:
            # 이미지 처리 함수 호출
            binary_arrays = process_image(image_path)
            print('binary_arrays:', binary_arrays)
            return HttpResponse("이미지 처리 완료") 
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)