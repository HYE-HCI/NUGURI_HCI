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
- 팀장 : 남서용 (컴퓨터학부, 한양대학교 ERICA)
- 팀원 : 김다영 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 김은채 (인공지능학과, 한양대학교 ERICA)
- 팀원 : 임은지 (인공지능학과, 한양대학교 ERICA)
## Introduction
이 프로젝트는 시각장애인 이용자를 위한 이미지 인식을 통해 일상생활의 불편을 덜어주는 것을 목적으로 하여, 서명란의 위치가 어디에 있는지 안내 및 오프라인 종이로 나오는 서류의 내용을 기존에 자신이 서명하려 했던 서류가 맞는지 유사율을 나타낸다.
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
DAI3004_Project
├── LICENSE
├── README.md
├── app.py                  // main python file
├── cam.py                  // operating camera python code
├── comparison.py           // document comparison python code
├── ocr.py                  // ocr python code
├── ocr_capture.py          // captured image ocr python code
├── img
├── static
│   ├── favicon.ico
│   ├── file.jpg
│   ├── images
│   │   ├── file_A.png      // scenario A image file
│   │   ├── file_B.png      // scenario A image file
│   │   └── file_C.png      // scenario A image file
│   ├── script.js           // JavaScript code needed for the web
│   ├── style.css           // CSS code needed for the web
│   ├── tts
│   └── uploads
├── templates
│   ├── compare.html        // compare web html code
│   ├── index.html          // main web html code
│   └── object.html         // signature bounding box web html code
├── text
│   ├── A.txt               // result of scenario A ocr
│   ├── B.txt               // result of scenario B ocr
│   ├── C.txt               // result of scenario C ocr
│   ├── boundingbox.txt     // coordinate of signature box
│   ├── output.txt          // result of picture's ocr
│   └── result.txt          // result of similarity of two documents
└── tts
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
