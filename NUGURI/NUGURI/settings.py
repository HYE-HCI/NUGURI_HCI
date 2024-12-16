"""
Django settings for NUGURI project.

Generated by 'django-admin startproject' using Django 5.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os
import sys
import onnxruntime as ort
import numpy as np


BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
sys.path.append(os.path.join(BASE_DIR, 'NUGURI'))
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY_PATH = os.path.join(BASE_DIR, 'secret_key.txt')
# OpenAI API 키 로드
try:
    with open(SECRET_KEY_PATH, 'r') as key_file:
        SECRET_KEY = key_file.read().strip()
except FileNotFoundError:
    SECRET_KEY = None
    print("DJANGO secret 키 파일(secret_key.txt)을 찾을 수 없습니다.")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

segmentation_model_path = os.path.join(BASE_DIR, "clothes_seg.onnx")
edge_detection_model_path = os.path.join(BASE_DIR, "edge_detection_fq.onnx")
print(segmentation_model_path)
segmentation_session = ort.InferenceSession(segmentation_model_path, providers=['CUDAExecutionProvider'])

image = np.random.randn(3, 768, 768).astype(np.float32)
input_image = np.expand_dims(image, axis=0)  # 배치 차원 추가
inputs = {segmentation_session.get_inputs()[0].name: input_image}
segmentation_session.run(None, inputs)


image = np.random.randn(3, 512, 512).astype(np.float32)
input_image = np.expand_dims(image, axis=0)  # 배치 차원 추가
edge_session = ort.InferenceSession(edge_detection_model_path, providers=['CUDAExecutionProvider'])
inputs = {edge_session.get_inputs()[0].name: input_image}
edge_session.run(None, inputs)




MODEL = {
    "segmentation": segmentation_session,
    "edge_detection": edge_session
}

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app_NUGURI', 
    'rest_framework', 
    # "sslserver"
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'NUGURI.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'app_NUGURI', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'NUGURI.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

### Hyunwook
API_KEY_PATH = os.path.join(BASE_DIR, 'api_key.txt')
# OpenAI API 키 로드
try:
    with open(API_KEY_PATH, 'r') as key_file:
        OPENAI_API_KEY = key_file.read().strip()
except FileNotFoundError:
    OPENAI_API_KEY = None
    print("API 키 파일(api_key.txt)을 찾을 수 없습니다.")

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
