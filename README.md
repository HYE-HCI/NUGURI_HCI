# ITE3062_Project
## Team Members
- 팀장 : 곽도훈 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 김아름 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 이나영 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 정현욱 (인공지능학과, 한양대학교 ERICA)
## Roles
| Name | Role | Main Part |
|------|------|-----------|
| Dohoon Kwak | BackEnd | crawl_products.py, export_products.py  | 
| Areum Kim | ComputerVision| edge.py, DotPad_CSUNdemo_chart2.js |
| Nayoung Lee | FrontEnd | product_detail.html, product_list.html |
| Hyunwook Jung | LLM | views.py, audio_image_processor.js |
## Introduction
We are Team HCI, a group of third-year students from the Department of Artificial Intelligence at Hanyang University ERICA. We are developing an algorithm and web platform that converts clothing images into tactile information to assist visually impaired individuals with online clothing shopping. This project aims to enhance the shopping experience by enabling visually impaired users to perceive the shape and texture of clothing through tactile feedback.
## Folder Structure
```
📦NUGURI_HCI
 ┣ 📂NUGURI
 ┃ ┣ 📂app_NUGURI
 ┃ ┃ ┣ 📂management
 ┃ ┃ ┃ ┣ 📂commands
 ┃ ┃ ┃ ┃ ┣ 📜crawl_products.py
 ┃ ┃ ┃ ┃ ┣ 📜export_products.py
 ┃ ┃ ┃ ┃ ┗ 📜__init__.py
 ┃ ┃ ┃ ┗ 📜__init__ .py
 ┃ ┃ ┣ 📂migrations
 ┃ ┃ ┃ ┣ 📜0001_initial.py
 ┃ ┃ ┃ ┣ 📜0002_remove_product_description_url_product_description.py
 ┃ ┃ ┃ ┣ 📜0003_remove_product_image_url_product_image_and_more.py
 ┃ ┃ ┃ ┣ 📜0004_product_original_url.py
 ┃ ┃ ┃ ┗ 📜__init__.py
 ┃ ┃ ┣ 📂templates
 ┃ ┃ ┃ ┗ 📂app_NUGURI
 ┃ ┃ ┃ ┃ ┣ 📜product_detail.html
 ┃ ┃ ┃ ┃ ┗ 📜product_list.html
 ┃ ┃ ┣ 📜admin.py
 ┃ ┃ ┣ 📜apps.py
 ┃ ┃ ┣ 📜models.py
 ┃ ┃ ┣ 📜serializers.py
 ┃ ┃ ┣ 📜tests.py
 ┃ ┃ ┣ 📜urls.py
 ┃ ┃ ┣ 📜views.py
 ┃ ┃ ┗ 📜__init__.py
 ┃ ┣ 📂media
 ┃ ┃ ┣ 📂products
 ┃ ┃ ┣ 📂sounds
 ┃ ┃ ┃ ┣ 📜audio.mp3
 ┃ ┃ ┃ ┗ 📜speech.mp3
 ┃ ┃ ┣ 📂text
 ┃ ┃ ┃ ┣ 📜analyze.txt
 ┃ ┃ ┃ ┣ 📜qa.txt
 ┃ ┃ ┃ ┗ 📜stt.txt
 ┃ ┣ 📂NUGURI
 ┃ ┃ ┣ 📜asgi.py
 ┃ ┃ ┣ 📜settings.py
 ┃ ┃ ┣ 📜urls.py
 ┃ ┃ ┣ 📜wsgi.py
 ┃ ┃ ┗ 📜__init__.py
 ┃ ┣ 📂static
 ┃ ┃ ┣ 📂data
 ┃ ┃ ┃ ┗ 📜products.json
 ┃ ┃ ┣ 📂images
 ┃ ┃ ┣ 📜audio_image_processor.js
 ┃ ┃ ┣ 📜DotPad_Class.js
 ┃ ┃ ┣ 📜DotPad_CSUNdemo_chart2.js
 ┃ ┃ ┣ 📜jquery-3.6.0.min.js
 ┃ ┃ ┗ 📜main.js
 ┃ ┣ 📜api_key.txt
 ┃ ┣ 📜clothes_seg.onnx
 ┃ ┣ 📜db.sqlite3
 ┃ ┣ 📜edge.py
 ┃ ┣ 📜edge_detection.onnx
 ┃ ┣ 📜manage.py
 ┃ ┗  📜secret_key.txt
 ┣ 📜.gitignore
 ┣ 📜LICENSE
 ┗ 📜README.md
```
## Development Setting
- Python 3.12.0
- etc...
## Libraries & Tools
- onnx==1.17.0
- onnxruntime==1.20.0
- Django==5.1.2
- django-filter==24.3
- djangorestframework==3.15.2
- opencv-python
- etc...
## Demo
![염화수소팀 최종.pdf](https://github.com/user-attachments/files/18155083/default.pdf)
![UI-Video](https://github.com/user-attachments/assets/3b1f9205-275c-4968-a3ed-7352aeb7c1de)
![LLM-Video](https://github.com/user-attachments/assets/20061b7a-6307-4927-88fb-02006780e31d)
## How to Use
1. requirements에 적혀있는 모듈들을 설치한다.
```
pip install -r requirements.txt
```
2. 파일경로 NUGURI로 이동해 python manage.py runserver를 터미널에 입력한다 
```
python manage.py runserver
```
3. 본인이 설정한 포트로 접속한다. Ex) 'http://127.0.0.1:443'
```
http://127.0.0.1:8000/app/products/
```
