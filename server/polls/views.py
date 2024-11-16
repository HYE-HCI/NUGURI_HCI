from django.conf import settings
from django.db.models import F
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
import base64
import openai
import os
import tempfile
from pydub import AudioSegment
import io

# OpenAI API 키 설정
openai.api_key = "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"


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

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

def get_tts(prompt):
    speech_file_path = Path(__file__).parent / "static/polls/sounds/speech.mp3"
    with openai.audio.speech.with_streaming_response.create(
        model="tts-1-hd",
        voice="nova",
        input=prompt,
    ) as response:
        response.stream_to_file(speech_file_path)

def get_stt(audio_file_path):
    try:
        with open(audio_file_path, 'rb') as audio_file:
            print(f"Processing audio file: {audio_file_path}")
            print(f"File size: {os.path.getsize(audio_file_path)} bytes")
            
            transcription = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ko"
            )
            
            print(f"Transcription result: {transcription.text}")
            return transcription.text if transcription.text else "음성을 인식하지 못했습니다."
    except Exception as e:
        print(f"STT Error: {str(e)}")
        return f"음성 인식 중 오류가 발생했습니다: {str(e)}"


def main_view(request):
    return render(request, 'polls/gpt.html')

@csrf_exempt
def analyze_image(request):
    if request.method == 'POST':
        image_file = request.FILES.get('image')
        question = request.POST.get('question')
        
        if not image_file:
            return JsonResponse({'error': '이미지가 필요합니다.'}, status=400)
            
        # 이미지 임시 저장
        temp_path = default_storage.save(f'temp/{image_file.name}', ContentFile(image_file.read()))
        file_path = os.path.join(settings.MEDIA_ROOT, temp_path)
        
        try:
            if question:
                # 텍스트 질문이 있는 경우
                prompt = f"""You are a fashion expert and personal color consultant and you must answer in Korean. 
                Answer the following question about the clothing in the image: {question}
                Consider these characteristics that suit a Summer Cool Light complexion:
                - Colors: Pastel tones, light colors, colors with a grayish undertone
                - Saturation: Medium to low
                - Brightness: High
                - Contrast: Low"""
                response = get_completion(file_path, prompt)
            else:
                # 기본 분석
                response = get_completion(file_path)
            
            get_tts(response)
            return JsonResponse({'response': response})
            
        finally:
            # 임시 파일 삭제
            default_storage.delete(temp_path)
            
    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)


@csrf_exempt
def process_audio(request):
    if request.method == 'POST':
        audio_file = request.FILES.get('audio')
        image_file = request.FILES.get('image')
        
        if not audio_file or not image_file:
            return JsonResponse({'error': '오디오와 이미지가 모두 필요합니다.'}, status=400)
        
        print(f"Received audio file: {audio_file.name}")
        print(f"Content type: {audio_file.content_type}")
        print(f"File size: {audio_file.size} bytes")
        
        try:
            # 오디오 파일을 static/polls/sounds/audio.mp3에 직접 저장
            audio_path = Path(__file__).parent / "static/polls/sounds/audio.mp3"
            
            # 디렉토리가 없으면 생성
            audio_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 파일 저장
            with open(audio_path, 'wb') as f:
                for chunk in audio_file.chunks():
                    f.write(chunk)
            
            print(f"Saved audio file at: {audio_path}")
            print(f"Saved file size: {os.path.getsize(audio_path)} bytes")

            # STT로 음성을 텍스트로 변환
            with open(audio_path, 'rb') as audio_data:
                transcription = openai.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_data,
                    language="ko"
                )
                question = transcription.text
                print(f"Transcription result: '{question}'")

            if not question:
                return JsonResponse({
                    'question': '음성을 인식하지 못했습니다.',
                    'response': '음성을 다시 한 번 말씀해 주시겠어요?'
                })

            # 이미지 처리
            image_temp_path = default_storage.save(f'temp/{image_file.name}', ContentFile(image_file.read()))
            image_path = os.path.join(settings.MEDIA_ROOT, image_temp_path)

            prompt = f"""You are a fashion expert and personal color consultant and you must answer in Korean. 
            Answer the following question about the clothing in the image: {question}"""
            
            response = get_completion(image_path, prompt)
            get_tts(response)
            
            return JsonResponse({
                'question': question,
                'response': response
            })
            
        except Exception as e:
            print(f"Error processing audio: {str(e)}")
            return JsonResponse({
                'question': '',
                'response': '음성 처리 중 오류가 발생했습니다.'
            })
            
        finally:
            if 'image_temp_path' in locals():
                default_storage.delete(image_temp_path)
            
    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)