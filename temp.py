import json
import uuid
from django.http import FileResponse, JsonResponse, HttpResponseNotFound , HttpResponse
from django.conf import settings
from django.shortcuts import render, get_object_or_404, redirect
from .models import Product
from edge import process_image  # 이미지 처리 함수 import
from django.http import HttpResponse
import os
from django.views.decorators.csrf import csrf_exempt
import openai
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
import base64

# OpenAI API 키 설정
if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY
else:
    raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다. settings.py 또는 api_key.txt를 확인하세요.")

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
            return JsonResponse({"binary_arrays": binary_arrays})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
    

# 이미지 인코딩 함수
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


# 이미지 분석 함수
def get_completion(image_path, custom_prompt=None):
    if custom_prompt:
        prompt = custom_prompt
    else:
        prompt = """You are a fashion expert and personal color consultant and you must answer in Korean. Your task is to analyze an image of a top (upper body garment) and provide two types of responses:
        1. A brief description (2-3 sentences) of the garment's characteristics, style, and how well it suits a Summer Cool Light complexion.
        2. A concise summary in the following format:
        Garment type:, Color:, Texture:, Suitability for personal color: (1: Good, 2: Neutral, 3: Poor)
        When analyzing the image, consider these characteristics that suit a Summer Cool Light complexion:
        - Colors: Pastel tones, light colors, colors with a grayish undertone
        - Saturation: Medium to low
        - Brightness: High
        - Contrast: Low"""

    base64_image = encode_image(image_path)
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=300,
        )
        
        if response.choices:
            return response.choices[0].message.content
        else:
            return "응답을 받지 못했습니다."
    except Exception as e:
        return f"오류가 발생했습니다: {str(e)}"


# TTS (Text-to-Speech) 기능
def get_tts(prompt):
    tts_directory = Path(settings.MEDIA_ROOT) / "sounds"
    tts_directory.mkdir(parents=True, exist_ok=True)

    speech_file_name = f"{uuid.uuid4()}.mp3"
    speech_file_path = tts_directory / speech_file_name

    try:
        with openai.audio.speech.with_streaming_response.create(
            model="tts-1-hd",
            voice="nova",
            input=prompt,
        ) as response:
            response.stream_to_file(speech_file_path)
        return str(speech_file_path)
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        return None


# STT (Speech-to-Text) 기능
def process_stt(audio_path):
    try:
        with open(audio_path, 'rb') as audio_data:
            transcription = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_data,
                language="ko"
            )
            return transcription.text
    except Exception as e:
        print(f"STT Error: {str(e)}")
        return None

def get_image_analysis(image_path, question=None):
    prompt = (
        f"""You are a fashion expert and personal color consultant and you must answer in Korean. 
        Answer the following question about the clothing in the image: {question}""" if question
        else """You are a fashion expert and personal color consultant and you must answer in Korean. 
        Analyze the clothing in the image and provide details as described in the project requirements."""
    )
    try:
        return get_completion(image_path, prompt)
    except Exception as e:
        print(f"Image Analysis Error: {str(e)}")
        return None


# 이미지 분석 뷰
@csrf_exempt
def handle_image_analysis(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')

        # 상품 ID가 없으면 오류 반환
        if not product_id:
            return JsonResponse({'error': '상품 ID가 필요합니다.'}, status=400)

        # JSON 데이터에서 경로 찾기
        json_file_path = os.path.join(settings.STATIC_ROOT, 'data/products.json')
        try:
            with open(json_file_path, 'r', encoding='utf-8') as json_file:
                products = json.load(json_file)
        except Exception as e:
            return JsonResponse({'error': f'JSON 파일 읽기 오류: {str(e)}'}, status=500)

        # 상품 ID로 이미지 경로 찾기
        product_data = next((p for p in products if str(p['pk']) == product_id), None)
        if not product_data:
            return JsonResponse({'error': f'상품 ID {product_id}에 해당하는 데이터를 찾을 수 없습니다.'}, status=404)

        image_relative_path = product_data['fields']['image']
        image_absolute_path = os.path.join(settings.MEDIA_ROOT, image_relative_path)

        # 이미지 경로 확인
        if not os.path.exists(image_absolute_path):
            return JsonResponse({'error': f'이미지 파일이 존재하지 않습니다: {image_absolute_path}'}, status=404)

        # 이미지 처리
        try:
            response = get_completion(image_absolute_path)
            tts_path = get_tts(response)
            return JsonResponse({'response': response, 'tts_path': tts_path})
        except Exception as e:
            return JsonResponse({'error': f'이미지 분석 중 오류 발생: {str(e)}'}, status=500)

    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

# STT 처리 뷰
@csrf_exempt
def handle_stt(request):
    if request.method == 'POST' and request.FILES.get('audio'):
        audio_file = request.FILES['audio']
        temp_path = default_storage.save(f'temp/{audio_file.name}', ContentFile(audio_file.read()))
        audio_path = default_storage.path(temp_path)

        try:
            transcription = process_stt(audio_path)
            if not transcription:
                return JsonResponse({'error': 'STT 변환에 실패했습니다.'}, status=500)

            return JsonResponse({'transcription': transcription})
        except Exception as e:
            print(f"STT 처리 중 에러: {e}")
            return JsonResponse({'error': f"STT 처리 중 에러: {e}"}, status=500)
        finally:
            default_storage.delete(temp_path)

    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)


@csrf_exempt
def perform_tts(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data.get('text')
        if not text:
            return JsonResponse({'error': '텍스트가 필요합니다.'}, status=400)

        try:
            tts_path = get_tts(text)  # TTS 처리 함수 호출
            if not tts_path:
                return JsonResponse({'error': 'TTS 변환에 실패했습니다.'}, status=500)

            # TTS 파일 URL 반환
            audio_url = f"{settings.MEDIA_URL}sounds/{os.path.basename(tts_path)}"
            return JsonResponse({'audio_url': audio_url})
        except Exception as e:
            print(f"TTS 처리 중 에러: {e}")
            return JsonResponse({'error': f"TTS 처리 중 에러: {e}"}, status=500)

    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

@csrf_exempt
def handle_audio_and_image(request):
    if request.method == 'POST':
        action = request.POST.get('action')  # 요청에서 'action' 키를 가져옴

        if action == 'stt':  # STT 처리
            if request.FILES.get('audio'):
                audio_file = request.FILES['audio']
                temp_path = default_storage.save(f'temp/{audio_file.name}', ContentFile(audio_file.read()))
                audio_path = default_storage.path(temp_path)

                try:
                    transcription = process_stt(audio_path)
                    if not transcription:
                        return JsonResponse({'error': 'STT 변환에 실패했습니다.'}, status=500)

                    return JsonResponse({'transcription': transcription})
                except Exception as e:
                    print(f"STT 처리 중 에러: {e}")
                    return JsonResponse({'error': f"STT 처리 중 에러: {e}"}, status=500)
                finally:
                    default_storage.delete(temp_path)
            else:
                return JsonResponse({'error': '오디오 파일이 필요합니다.'}, status=400)

        elif action == 'image_analysis':  # 이미지 분석 처리
            product_id = request.POST.get('product_id')
            if not product_id:
                return JsonResponse({'error': '상품 ID가 필요합니다.'}, status=400)

            # JSON 데이터에서 경로 찾기
            json_file_path = os.path.join(settings.STATIC_ROOT, 'data/products.json')
            try:
                with open(json_file_path, 'r', encoding='utf-8') as json_file:
                    products = json.load(json_file)
            except Exception as e:
                return JsonResponse({'error': f'JSON 파일 읽기 오류: {str(e)}'}, status=500)

            # 상품 ID로 이미지 경로 찾기
            product_data = next((p for p in products if str(p['pk']) == product_id), None)
            if not product_data:
                return JsonResponse({'error': f'상품 ID {product_id}에 해당하는 데이터를 찾을 수 없습니다.'}, status=404)

            image_relative_path = product_data['fields']['image']
            image_absolute_path = os.path.join(settings.MEDIA_ROOT, image_relative_path)

            if not os.path.exists(image_absolute_path):
                return JsonResponse({'error': f'이미지 파일이 존재하지 않습니다: {image_absolute_path}'}, status=404)

            # 이미지 처리
            try:
                response = get_completion(image_absolute_path)
                tts_path = get_tts(response)
                return JsonResponse({'response': response, 'tts_path': tts_path})
            except Exception as e:
                return JsonResponse({'error': f'이미지 분석 중 오류 발생: {str(e)}'}, status=500)

        else:
            return JsonResponse({'error': '유효하지 않은 action 값입니다.'}, status=400)

    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)
