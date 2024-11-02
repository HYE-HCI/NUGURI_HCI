import cv2
import numpy as np
import onnxruntime as ort


mean_bgr = [103.939, 116.779, 123.68]

def edge_detection_with_mask(image_path, mask_path, onnx_model_path, output_prefix="masked_edge_part"):

    ort_session = ort.InferenceSession(onnx_model_path)

    # 이미지 및 마스크 로드
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        raise FileNotFoundError(f"이미지를 불러오지 못했습니다: {image_path}")
    if mask is None:
        raise FileNotFoundError(f"마스크 이미지를 불러오지 못했습니다: {mask_path}")

    # 이미지와 마스크 크기 조정
    image = cv2.resize(image, (512, 512))
    mask = cv2.resize(mask, (512, 512), interpolation=cv2.INTER_NEAREST)

    # 이미지 및 마스크 사분할
    half_h, half_w = 512 // 2, 512 // 2
    image_parts = [
        image[0:half_h, 0:half_w],       # 왼쪽 상단
        image[0:half_h, half_w:512],     # 오른쪽 상단
        image[half_h:512, 0:half_w],     # 왼쪽 하단
        image[half_h:512, half_w:512],   # 오른쪽 하단
    ]
    mask_parts = [
        mask[0:half_h, 0:half_w],
        mask[0:half_h, half_w:512],
        mask[half_h:512, 0:half_w],
        mask[half_h:512, half_w:512],
    ]

    # 각 사분할에 대해 엣지 검출 수행
    for i, (img_part, mask_part) in enumerate(zip(image_parts, mask_parts)):
        # 이미지 전처리
        img_part_resized = cv2.resize(img_part, (512, 512)).astype(np.float32)
        img_part_resized -= mean_bgr
        img_part_resized = img_part_resized.transpose((2, 0, 1))  # HWC -> CHW
        img_part_resized = np.expand_dims(img_part_resized, axis=0)  # 배치 차원 추가

        inputs = {ort_session.get_inputs()[0].name: img_part_resized}
        preds = ort_session.run(None, inputs)

        edge_map = 1 / (1 + np.exp(-preds[0][0, 0, ...]))  
        edge_map = (edge_map * 255).astype(np.uint8)

        # 마스크 적용
        mask_part_resized = cv2.resize(mask_part, (512, 512), interpolation=cv2.INTER_NEAREST)
        masked_edge_map = cv2.bitwise_and(edge_map, edge_map, mask=mask_part_resized)

        output_path = f"{output_prefix}_{i+1}.png"
        cv2.imwrite(output_path, masked_edge_map)
        print(f"사분할 엣지 결과 저장 완료: {output_path}")


def convert_image_to_binary_array(image_path):
 
    # 이미지 로드
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        print(f"이미지를 불러오지 못했습니다. 파일 경로를 확인하세요: {image_path}")
        return

    _, binary_image = cv2.threshold(image, 15, 1, cv2.THRESH_BINARY)

    resized_binary_image = cv2.resize(binary_image, (40, 40), interpolation=cv2.INTER_NEAREST)

    formatted_output = "[\n"
    for i, row in enumerate(resized_binary_image):
        formatted_output += " [" + ",".join(map(str, row)) + "]"
        if i < len(resized_binary_image) - 1:
            formatted_output += ",\n"
        else:
            formatted_output += "\n"
    formatted_output += "]"
    
    return formatted_output



edge_detection_with_mask(
    image_path="C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/NUGURI/KakaoTalk_20241101_153856002_03.jpg",
    mask_path="C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/segmentation_mask.png",
    onnx_model_path="C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/NUGURI/edge_detection.onnx"
)

convert_image_to_binary_array("C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/masked_edge_part_1.png")