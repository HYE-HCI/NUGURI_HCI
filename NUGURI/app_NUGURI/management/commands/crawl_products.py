from django.core.management.base import BaseCommand
from app_NUGURI.models import Product
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from urllib.request import urlopen
from django.core.files.base import ContentFile
from deep_translator import GoogleTranslator
import json


class Command(BaseCommand):
    help = 'Crawl products from Musinsa website and save to the database'

    def handle(self, *args, **kwargs):
        # Selenium 설정
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--ignore-certificate-errors')  # SSL 에러 무시
        options.add_argument('--allow-insecure-localhost')  # 로컬 SSL 무시

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

        url = 'https://www.musinsa.com/products/3593772'  # 테스트 URL
        driver.get(url)

        # 제품명 추출 (CSS Selector)
        try:
            name_tag = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'span.text-lg.font-medium.break-all.flex-1.font-pretendard'))
            )
            name = name_tag.text.strip()
        except Exception as e:
            print(f"Error fetching product name: {e}")
            name = "Unknown Product"

        print(f"Product Name: {name}")

        # 제품명을 영어로 번역
        translated_name = GoogleTranslator(source='ko', target='en').translate(name)
        print(f"Translated Name: {translated_name}")

        # 이미지 URL 추출 (CSS Selector)
        try:
            image_tag = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div.swiper-slide-active img'))
            )
            image_url = image_tag.get_attribute('src')
            if image_url and "thumbnails/" in image_url:
                image_url = image_url.replace("thumbnails/", "")
            if "?w=" in image_url:
                image_url = image_url.split('?')[0]
        except Exception as e:
            print(f"Error fetching image URL: {e}")
            image_url = None

        print(f"Image URL: {image_url}")

        # 핏/체감감 크롤링 (CSS Selector)
        fit_info = {}
        try:
            # `ul` 태그에서 키(예: 핏, 촉감 등) 가져오기
            keys_section = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'ul.sc-v134d5-2.jzKult'))
            )
            keys = [li.text.strip() for li in keys_section.find_elements(By.CSS_SELECTOR, 'li.sc-v134d5-3.iJaECU')]

            # 테이블의 행(Row) 데이터 가져오기
            rows_section = WebDriverWait(driver, 30).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'tr.sc-v134d5-7.glEovq'))
            )

            # 행 데이터를 리스트로 변환
            table_data = []
            for row in rows_section:
                row_values = [td.text.strip() for td in row.find_elements(By.CSS_SELECTOR, 'td.iwXmpA')]
                table_data.append(row_values)

            # 키와 테이블 데이터를 매핑
            for i, key in enumerate(keys):
                if i < len(table_data):  # 키와 데이터 길이 맞추기
                    fit_info[key] = table_data[i]

        except Exception as e:
            # 에러가 발생하면 기본값으로 처리
            print(f"Error parsing fit info: {e}")
            fit_info = {"핏/체감감 정보": "없음"}

        print(f"Fit Info: {json.dumps(fit_info, ensure_ascii=False)}")


        # 데이터베이스 저장
        if image_url:
            try:
                image_content = urlopen(image_url).read()
                product, created = Product.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': json.dumps({'fit_info': fit_info}, ensure_ascii=False),
                        'original_url': url
                    }
                )

                if created:
                    product.image.save(f"{translated_name}.jpg", ContentFile(image_content))
                    product.save()
            except Exception as e:
                print(f"Error saving image: {e}")

        driver.quit()

        self.stdout.write(self.style.SUCCESS('Product successfully crawled and saved to the database'))
