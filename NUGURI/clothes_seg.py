import onnxruntime as ort
import numpy as np
import cv2

# 모델 파일 경로
onnx_model_path = "C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/NUGURI/clothes_seg.onnx"

# ONNX 세션 생성
ort_session = ort.InferenceSession(onnx_model_path)

# 입력 이미지 로드 및 전처리
def preprocess_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"이미지를 불러올 수 없습니다: {image_path}")
    
    image = cv2.resize(image, (768, 768))
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.astype(np.float32) / 255.0
    image = np.transpose(image, (2, 0, 1))  # HWC -> CHW
    return np.expand_dims(image, axis=0)  # 배치 차원 추가

# 이미지 전처리
image_path = "C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/NUGURI/KakaoTalk_20241101_153856002_03.jpg"
input_image = preprocess_image(image_path)

# 모델 추론
inputs = {ort_session.get_inputs()[0].name: input_image}
output = ort_session.run(None, inputs)

# 출력 형태 확인
print("Model output shape:", output[0].shape)

# 소프트맥스 적용 후 가장 높은 클래스 선택
output_tensor = output[0]  # shape: (1, 4, 768, 768)
output_tensor = np.exp(output_tensor) / np.exp(output_tensor).sum(axis=1, keepdims=True)  # 소프트맥스 적용

# 각 픽셀에서 확률이 가장 높은 클래스 선택
output_tensor = np.argmax(output_tensor, axis=1)  # shape: (1, 768, 768)
output_arr = output_tensor[0]  # 첫 번째 배치 선택

# 마스크 값 변경 (클래스 0을 제외한 모든 영역을 흰색으로 처리)
output_arr[output_arr != 0] = 255
output_arr[output_arr == 0] = 0

# Convert to OpenCV format
output_arr = output_arr.astype('uint8')


# 마스크 크기 확대를 위해 팽창 연산 적용
kernel = np.ones((7, 7), np.uint8)
output_arr = cv2.dilate(output_arr, kernel, iterations=2)

# 결과 저장
output_mask_path = "segmentation_mask.png"
cv2.imwrite(output_mask_path, output_arr)
print(f"세그멘테이션 마스크가 저장되었습니다: {output_mask_path}")
