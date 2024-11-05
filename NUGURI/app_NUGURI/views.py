from django.http import FileResponse, JsonResponse, HttpResponseNotFound
import os
from django.conf import settings
from django.shortcuts import render
from .models import Product


def product_list_view(request):
    products = Product.objects.all()
    return render(request, 'app_NUGURI/product_list.html', {'products': products})


def product_detail_view(request, product_id):
    product = Product.objects.get(id=product_id)
    return render(request, 'app_NUGURI/product_detail.html', {'product': product})
