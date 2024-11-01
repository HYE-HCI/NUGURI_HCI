import cv2
import numpy as np
import onnxruntime as ort
import matplotlib.pyplot as plt


# ONNX 모델 로드
onnx_model_path = "NUGURI/edge_detection.onnx"
ort_session = ort.InferenceSession(onnx_model_path)

# BGR 평균값 설정
mean_bgr = [103.939, 116.779, 123.68]

# 입력 이미지 로드 및 전처리
image_path = "NUGURI/KakaoTalk_20241101_153856002_01.jpg"
image = cv2.imread(image_path, cv2.IMREAD_COLOR)
if image is None:
    print(f"이미지를 불러오지 못했습니다. 파일 경로를 확인하세요: {image_path}")
else:
    original_size = image.shape[1], image.shape[0]  # (width, height)
    image = cv2.resize(image, (512, 512))
    image = np.array(image, dtype=np.float32)

    # BGR 평균값 빼기
    image -= mean_bgr
    image = image.transpose((2, 0, 1))  # HWC -> CHW
    image = np.expand_dims(image, axis=0) 

    # ONNX 추론
    inputs = {ort_session.get_inputs()[0].name: image}
    preds = ort_session.run(None, inputs)

    # 엣지 맵 후처리
    edge_maps = []
    for pred in preds:
        tmp = 1 / (1 + np.exp(-pred)) 
        edge_maps.append(tmp)

    tmp_img = edge_maps[-1][0, 0, ...] 

    # 이미지 정규화 및 반전
    def image_normalization(img, img_min=0, img_max=255):
        img = np.float32(img)
        epsilon = 1e-12 
        img = (img - np.min(img)) * (img_max - img_min) / ((np.max(img) - np.min(img)) + epsilon) + img_min
        return img

    tmp_img = np.uint8(image_normalization(tmp_img))
    tmp_img = cv2.bitwise_not(tmp_img)

    # 결과 이미지를 원본 이미지 크기로 리사이즈
    resized_output = cv2.resize(tmp_img, original_size, interpolation=cv2.INTER_LINEAR)

    output_path = "./test.png"
    cv2.imwrite(output_path, resized_output)