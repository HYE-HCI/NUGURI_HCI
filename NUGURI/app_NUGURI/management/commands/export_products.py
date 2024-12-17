# app_NUGURI/management/commands/export_products.py
import os
from django.core.management.base import BaseCommand
from django.core import serializers
from app_NUGURI.models import Product

### Dohoon
class Command(BaseCommand):
    help = 'Export all products to a JSON file'

    def handle(self, *args, **kwargs):
        # 폴더가 없으면 생성
        os.makedirs('static/data', exist_ok=True)
        
        # UTF-8 인코딩으로 파일을 저장
        products = Product.objects.all()
        with open('static/data/products.json', 'w', encoding='utf-8') as f:
            f.write(serializers.serialize('json', products))
        self.stdout.write(self.style.SUCCESS('Products exported to static/data/products.json'))