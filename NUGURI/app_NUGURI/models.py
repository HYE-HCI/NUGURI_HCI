# app_NUGURI/models.py
from django.db import models
from django.urls import reverse

class Product(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/', blank=True, null=True) # 이미지 파일을 저장할 필드
    description = models.TextField()  # 설명 텍스트

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('product_detail', args=[str(self.id)])
