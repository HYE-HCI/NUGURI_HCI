# app_NUGURI/serializers.py
from rest_framework import serializers
from .models import Product

### Dohoon
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__' 
