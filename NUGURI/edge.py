import cv2
import numpy as np
import onnxruntime as ort


# BGR 평균값 설정
mean_bgr = [103.939, 116.779, 123.68]

def edge_detection_with_onnx(image_path, onnx_model_path, output_path):
    """
    ONNX 엣지 검출 모델을 사용하여 엣지 맵 생성 및 결과 저장
    """
    # ONNX 세션 로드
    ort_session = ort.InferenceSession(onnx_model_path)

    # 입력 이미지 로드 및 전처리
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if image is None:
        print(f"이미지를 불러오지 못했습니다. 파일 경로를 확인하세요: {image_path}")
        return None

    # 이미지 원본 크기 저장
    original_size = image.shape[1], image.shape[0]  # (width, height)

    # 이미지 전처리
    image = cv2.resize(image, (512, 512))
    image = np.array(image, dtype=np.float32)
    image -= mean_bgr
    image = image.transpose((2, 0, 1))  # HWC -> CHW
    image = np.expand_dims(image, axis=0)  

    # ONNX 추론
    inputs = {ort_session.get_inputs()[0].name: image}
    preds = ort_session.run(None, inputs)


    edge_map = 1 / (1 + np.exp(-preds[0][0, 0, ...]))  
    edge_map = np.uint8(image_normalization(edge_map)) 
    edge_map = cv2.bitwise_not(edge_map)  # 반전 처리

    # 결과 이미지를 원본 이미지 크기로 리사이즈
    resized_output = cv2.resize(edge_map, original_size, interpolation=cv2.INTER_LINEAR)

    # 결과 이미지 저장
    cv2.imwrite(output_path, resized_output)
    return output_path

def image_normalization(img, img_min=0, img_max=255):
    img = np.float32(img)
    epsilon = 1e-12 
    img = (img - np.min(img)) * (img_max - img_min) / ((np.max(img) - np.min(img)) + epsilon) + img_min
    return img


def convert_image_to_binary_array(image_path):

    # 이미지 로드
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        print(f"이미지를 불러오지 못했습니다. 파일 경로를 확인하세요: {image_path}")
        return None

    # 이진화
    _, binary_image = cv2.threshold(image, 220, 1, cv2.THRESH_BINARY_INV)

    # 리사이즈
    resized_binary_image = cv2.resize(binary_image, (40, 40), interpolation=cv2.INTER_NEAREST)

    # 2차원 배열로 변환하여 포맷팅
    formatted_output = "[\n"
    for row in resized_binary_image:
        formatted_output += " [" + ",".join(map(str, row)) + "],\n"
    formatted_output += "]"

    return formatted_output


edge_detection_with_onnx(
    image_path="./KakaoTalk_20241101_153856002_01.jpg",
    onnx_model_path="./edge_detection.onnx",
    output_path="./edge_result.png"
)

convert_image_to_binary_array('./edge_result.png')