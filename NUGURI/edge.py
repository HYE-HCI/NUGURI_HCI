import onnxruntime as ort
import numpy as np
import cv2

segmentation_model_path = r"C:\Users\i0108\Desktop\NUGURI_HCI\NUGURI_HCI\NUGURI\NUGURI\clothes_seg.onnx"
edge_detection_model_path = r"C:\Users\i0108\Desktop\NUGURI_HCI\NUGURI_HCI\NUGURI\NUGURI\edge_detection.onnx"

segmentation_session = ort.InferenceSession(segmentation_model_path)
edge_session = ort.InferenceSession(edge_detection_model_path)


def segment_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"이미지를 불러올 수 없습니다: {image_path}")
    
    image = cv2.resize(image, (768, 768))
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.astype(np.float32) / 255.0
    image = np.transpose(image, (2, 0, 1))  # HWC -> CHW
    input_image = np.expand_dims(image, axis=0)  # 배치 차원 추가

    # 모델 추론
    inputs = {segmentation_session.get_inputs()[0].name: input_image}
    output = segmentation_session.run(None, inputs)
    
    output_tensor = output[0] 
    output_tensor = np.exp(output_tensor) / np.exp(output_tensor).sum(axis=1, keepdims=True) 
    output_tensor = np.argmax(output_tensor, axis=1) 
    mask = output_tensor[0].astype('uint8') 

    mask[mask != 0] = 255
    mask[mask == 0] = 0

    kernel = np.ones((7, 7), np.uint8)
    mask = cv2.dilate(mask, kernel, iterations=2)
    
    return mask

def edge_detection_with_mask(image_path, mask, output_size=(40, 40)):
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"이미지를 불러올 수 없습니다: {image_path}")

    image = cv2.resize(image, (512, 512))
    mask = cv2.resize(mask, (512, 512), interpolation=cv2.INTER_NEAREST)
    
    mean_bgr = [103.939, 116.779, 123.68]

    # 이미지 및 마스크 사분할
    half_h, half_w = 512 // 2, 512 // 2
    image_quarters = [
        image[0:half_h, 0:half_w],       # 왼쪽 상단
        image[0:half_h, half_w:512],     # 오른쪽 상단
        image[half_h:512, 0:half_w],     # 왼쪽 하단
        image[half_h:512, half_w:512],   # 오른쪽 하단
    ]
    mask_quarters = [
        mask[0:half_h, 0:half_w],
        mask[0:half_h, half_w:512],
        mask[half_h:512, 0:half_w],
        mask[half_h:512, half_w:512],
    ]

    formatted_outputs = []
    # 각 사분할에 대해 엣지 검출 수행
    for i, (img_part, mask_part) in enumerate(zip(image_quarters, mask_quarters)):
        # 이미지 전처리
        img_part_resized = cv2.resize(img_part, (512, 512)).astype(np.float32)
        img_part_resized -= mean_bgr
        img_part_resized = img_part_resized.transpose((2, 0, 1))  # HWC -> CHW
        img_part_resized = np.expand_dims(img_part_resized, axis=0)  # 배치 차원 추가

        inputs = {edge_session.get_inputs()[0].name: img_part_resized}
        preds = edge_session.run(None, inputs)

        edge_map = 1 / (1 + np.exp(-preds[0][0, 0, ...]))  
        edge_map = (edge_map * 255).astype(np.uint8)

        mask_part_resized = cv2.resize(mask_part, (512, 512), interpolation=cv2.INTER_NEAREST)
        masked_edge_map = cv2.bitwise_and(edge_map, edge_map, mask=mask_part_resized)

        _, binary_edge_map = cv2.threshold(masked_edge_map, 15, 1, cv2.THRESH_BINARY)
        resized_binary_edge_map = cv2.resize(binary_edge_map, output_size, interpolation=cv2.INTER_NEAREST)

      
        formatted_output = "[\n"
        for j, row in enumerate(resized_binary_edge_map):
            formatted_output += " [" + ",".join(map(str, row)) + "]"
            if j < len(resized_binary_edge_map) - 1:
                formatted_output += ",\n"
            else:
                formatted_output += "\n"
        formatted_output += "]"
        
        formatted_outputs.append(formatted_output) 

    return formatted_outputs 

def process_image(image_path):
    print('함수 실행되나')
    # 세그멘테이션 수행
    mask = segment_image(image_path)
    
    # 엣지 검출 및 2D 배열 변환
    binary_arrays = edge_detection_with_mask(image_path, mask)
    
    return binary_arrays

# 테스트 실행
# image_path = "C:/Users/kdh03/OneDrive/Desktop/NUGURI_HCI/NUGURI/KakaoTalk_20241101_153856002_01.jpg"
# binary_arrays = process_image(image_path)

# # 예시로 결과 출력 ... 
# for i, binary_array in enumerate(binary_arrays):
#     print(f"2D 이진 배열 {i+1}:")
#     print(binary_array)