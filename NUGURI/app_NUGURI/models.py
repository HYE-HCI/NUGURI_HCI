# app_NUGURI/models.py
from django.db import models
from django.urls import reverse

class Product(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    description = models.TextField()
    original_url = models.URLField(max_length=200, blank=True, null=True)  # 이 필드가 추가되어 있어야 합니다.

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('product_detail', args=[str(self.id)])