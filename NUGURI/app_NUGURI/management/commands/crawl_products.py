from django.core.management.base import BaseCommand
from app_NUGURI.models import Product
from bs4 import BeautifulSoup
from urllib.request import urlopen
import requests
from django.core.files.base import ContentFile
from deep_translator import GoogleTranslator

class Command(BaseCommand):
    help = 'Crawl products from SPAO website and save to the database'

    def handle(self, *args, **kwargs):
        url = 'https://spao.elandmall.co.kr/i/item?itemNo=2406299347&lowerVendNo=LV16003579&pageId=1733040021986&preCornerNo=R01402002_srchOutcome'
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 제품명 추출 (한국어)
        name_tag = soup.select_one('.title_wrap')  # 실제 HTML의 클래스명으로 대체 필요
        name = name_tag.get_text(strip=True) if name_tag else "Unknown Product"

        # 제품명을 영어로 번역 (이미지 저장용)
        translated_name = GoogleTranslator(source='ko', target='en').translate(name)

        # 이미지 URL 추출
        image_tag = soup.select_one('.js-picture.is-loaded img')  # 실제 HTML의 클래스명으로 대체 필요
        image_url = image_tag['src'] if image_tag else None

        # 설명 추출
        description_tag = soup.select_one('.data_table01')  # 실제 HTML의 클래스명으로 대체 필요
        description = description_tag.get_text(strip=True) if description_tag else "No description available"

        # 원본 URL 설정
        original_url = url

        # 이미지 파일 저장
        if image_url:
            image_content = urlopen(image_url).read()

            # 데이터베이스에 저장
            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'original_url': original_url
                }
            )

            # 이미지 저장 (영어 이름 사용)
            if created:
                product.image.save(f"{translated_name}.jpg", ContentFile(image_content))
                product.save()

        self.stdout.write(self.style.SUCCESS('Product successfully crawled and saved to the database'))