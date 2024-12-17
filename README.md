# NUGURI_HCI
We are Team HCI, a group of third-year students from the Department of Artificial Intelligence at Hanyang University ERICA.
We are developing an algorithm and web platform that converts clothing images into tactile information to assist visually impaired individuals with online clothing shopping. This project aims to enhance the shopping experience by enabling visually impaired users to perceive the shape and texture of clothing through tactile feedback.

# Roles
| Name | Role | Main Part |
|------|------|-----------|
| Dohoon Kwak | BackEnd | crawl_products.py, export_products.py  | 
| Areum Kim | | |
| Nayoung Lee | | |
| Hyunwook Jung | LLM | views.py, audio_image_processor.js |

# Demo
![염화수소팀 최종.pdf](https://github.com/user-attachments/files/18155083/default.pdf)

![UI-Video](https://github.com/user-attachments/assets/3b1f9205-275c-4968-a3ed-7352aeb7c1de)

![LLM-Video](https://github.com/user-attachments/assets/20061b7a-6307-4927-88fb-02006780e31d)



# DAI3004_Project
## Team Members
- 팀장 : 곽도훈 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 김아름 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 이나영 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 정현욱 (인공지능학과, 한양대학교 ERICA)
## Introduction
We are Team HCI, a group of third-year students from the Department of Artificial Intelligence at Hanyang University ERICA. We are developing an algorithm and web platform that converts clothing images into tactile information to assist visually impaired individuals with online clothing shopping. This project aims to enhance the shopping experience by enabling visually impaired users to perceive the shape and texture of clothing through tactile feedback.
## Contents
0. [Folder Structure](#folder-structure)
1. [Deelopment Setting](#development-setting)
2. [Libraries & Tools](#libraries--tools)
3. [Pages](#pages)
4. [서류 비교](#signature)
5. [서명 하기](#comparison)
6. [파일 설명](#file-explain)
7. [Demo](#demo)
### Folder Structure
```
NUGURI_HCI
 ┣ NUGURI
 ┃ ┣ app_NUGURI
 ┃ ┃ ┣ management
 ┃ ┃ ┃ ┣ commands
 ┃ ┃ ┃ ┃ ┣ __pycache__
 ┃ ┃ ┃ ┃ ┃ ┣ crawl_products.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┃ ┣ crawl_products.cpython-39.pyc
 ┃ ┃ ┃ ┃ ┃ ┣ export_products.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┃ ┣ __init__.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┃ ┗ __init__.cpython-39.pyc
 ┃ ┃ ┃ ┃ ┣ crawl_products.py
 ┃ ┃ ┃ ┃ ┣ export_products.py
 ┃ ┃ ┃ ┃ ┗ __init__.py
 ┃ ┃ ┃ ┗ __init__ .py
 ┃ ┃ ┣ migrations
 ┃ ┃ ┃ ┣ __pycache__
 ┃ ┃ ┃ ┃ ┣ 0001_initial.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┣ 0002_remove_product_description_url_product_description.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┣ 0003_remove_product_image_url_product_image_and_more.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┣ 0004_product_original_url.cpython-312.pyc
 ┃ ┃ ┃ ┃ ┗ __init__.cpython-312.pyc
 ┃ ┃ ┃ ┣ 0001_initial.py
 ┃ ┃ ┃ ┣ 0002_remove_product_description_url_product_description.py
 ┃ ┃ ┃ ┣ 0003_remove_product_image_url_product_image_and_more.py
 ┃ ┃ ┃ ┣ 0004_product_original_url.py
 ┃ ┃ ┃ ┗ __init__.py
 ┃ ┃ ┣ templates
 ┃ ┃ ┃ ┗ app_NUGURI
 ┃ ┃ ┃ ┃ ┣ product_detail.html
 ┃ ┃ ┃ ┃ ┗ product_list.html
 ┃ ┃ ┣ __pycache__
 ┃ ┃ ┃ ┣ admin.cpython-312.pyc
 ┃ ┃ ┃ ┣ apps.cpython-312.pyc
 ┃ ┃ ┃ ┣ models.cpython-312.pyc
 ┃ ┃ ┃ ┣ serializers.cpython-312.pyc
 ┃ ┃ ┃ ┣ urls.cpython-312.pyc
 ┃ ┃ ┃ ┣ views.cpython-312.pyc
 ┃ ┃ ┃ ┗ __init__.cpython-312.pyc
 ┃ ┃ ┣ admin.py
 ┃ ┃ ┣ apps.py
 ┃ ┃ ┣ models.py
 ┃ ┃ ┣ serializers.py
 ┃ ┃ ┣ tests.py
 ┃ ┃ ┣ urls.py
 ┃ ┃ ┣ views.py
 ┃ ┃ ┗ __init__.py
 ┃ ┣ media
 ┃ ┃ ┣ products
 ┃ ┃ ┃ ┣ Extra_Oversized_Hooded_Sweatshirt_Surf_Blue.jpg
 ┃ ┃ ┃ ┗ Wool_Brush_Stripe_Knit_Blue.jpg
 ┃ ┃ ┣ sounds
 ┃ ┃ ┃ ┣ audio.mp3
 ┃ ┃ ┃ ┗ speech.mp3
 ┃ ┃ ┣ temp
 ┃ ┃ ┃ ┣ blob
 ┃ ┃ ┃ ┣ blob_1fKByCA
 ┃ ┃ ┃ ┣ blob_AVCOVQ8
 ┃ ┃ ┃ ┣ blob_DAGnBOV
 ┃ ┃ ┃ ┣ blob_jJbLucl
 ┃ ┃ ┃ ┣ blob_laCGb8R
 ┃ ┃ ┃ ┣ blob_Mqqkx9X
 ┃ ┃ ┃ ┣ blob_NiBjkB1
 ┃ ┃ ┃ ┣ blob_NJQ5Cv8
 ┃ ┃ ┃ ┣ blob_Pwg3DYR
 ┃ ┃ ┃ ┣ blob_spIaiVr
 ┃ ┃ ┃ ┗ blob_w0iyIx2
 ┃ ┃ ┣ text
 ┃ ┃ ┃ ┣ analyze.txt
 ┃ ┃ ┃ ┣ qa.txt
 ┃ ┃ ┃ ┗ stt.txt
 ┃ ┃ ┗ uploads
 ┃ ┃ ┃ ┗ blob
 ┃ ┣ NUGURI
 ┃ ┃ ┣ __pycache__
 ┃ ┃ ┃ ┣ settings.cpython-312.pyc
 ┃ ┃ ┃ ┣ urls.cpython-312.pyc
 ┃ ┃ ┃ ┣ wsgi.cpython-312.pyc
 ┃ ┃ ┃ ┗ __init__.cpython-312.pyc
 ┃ ┃ ┣ asgi.py
 ┃ ┃ ┣ settings.py
 ┃ ┃ ┣ urls.py
 ┃ ┃ ┣ wsgi.py
 ┃ ┃ ┗ __init__.py
 ┃ ┣ static
 ┃ ┃ ┣ data
 ┃ ┃ ┃ ┗ products.json
 ┃ ┃ ┣ images
 ┃ ┃ ┃ ┣ image_processing.jpg
 ┃ ┃ ┃ ┣ off_button.jpg
 ┃ ┃ ┃ ┣ on_button.jpg
 ┃ ┃ ┃ ┣ return_button.jpg
 ┃ ┃ ┃ ┣ shop_now_button.jpg
 ┃ ┃ ┃ ┗ title_image.jpg
 ┃ ┃ ┣ audio_image_processor.js
 ┃ ┃ ┣ DotPad_Class.js
 ┃ ┃ ┣ DotPad_CSUNdemo_chart2.js
 ┃ ┃ ┣ jquery-3.6.0.min.js
 ┃ ┃ ┗ main.js
 ┃ ┣ __pycache__
 ┃ ┃ ┗ edge.cpython-312.pyc
 ┃ ┣ api_key.txt
 ┃ ┣ clothes_seg.onnx
 ┃ ┣ db.sqlite3
 ┃ ┣ edge.py
 ┃ ┣ edge_detection.onnx
 ┃ ┗ manage.py
 ┣ .gitignore
 ┣ LICENSE
 ┗ README.md
```
### Development Setting
- Ubuntu 20.04
- Python 3.8
- etc...
### Libraries & Tools
- easyocr
- Flask
- matplotlib
- mediapipe
- numpy
- opencv-python
- Pillow
- pygame
- PyYAML
- requests
- scipy
- sounddevice
- etc...
### Pages
메인 화면 <br>
![mainpage](./img/main_page.png)
서류 확인 <br>
![comparison](./img/compare.png)
서명 하기 <br>
![signature](./img/hand.png)
### Comparison
서류를 미리 전달받으면 DB에 저장하고, 이를 OCR을 진행한다. 이후, 사용자가 은행이나 시청 등의 기관에 가서 받은 서류를 촬영한 뒤 유사율을 확인해본다. 모든 과정은 TTS로 도움을 받을 수 있다. <br><br>
OCR 한 후의 서류의 모습 <br>
![boundingbox](./img/boundingbox.png)
### Signature
서류를 카메라로 촬영하면, (서명) 혹은 (인)이라고 써져있는 글자를 찾는다. 이를 바운딩 박스로 띄우고, 검지 손가락 위치와 비교하며 상, 하, 좌, 우로 손가락을 어디로 가야할지 TTS로 알려준다. 만약 바운딩 박스 안에 손가락이 위치한다면, 성공이라는 TTS가 나온다.
### Demo
1. requirements에 적혀있는 모듈들을 설치한다.
```
pip install -r requirements.txt
```
2. 메인 디렉토리 내의 app.py를 실행한다.
```
python app.py
```
3. 본인이 설정한 포트로 접속한다. Ex) 'http://127.0.0.1:443'
