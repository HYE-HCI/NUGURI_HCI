import onnxruntime as ort
import numpy as np
import cv2
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

segmentation_model_path = os.path.join(base_dir, "clothes_seg.onnx")
edge_detection_model_path = os.path.join(base_dir, "edge_detection.onnx")

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
def apply_dilation(image, kernel_size=7, iterations=2):

    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    dilated_image = cv2.dilate(image, kernel, iterations=iterations)
    
    return dilated_image


def enhance_contrast(image, contrast_factor=2.0):
    
    float_image = image.astype(np.float32)
    enhanced = np.clip((float_image - 128) * contrast_factor + 128, 0, 255)
    
    return enhanced.astype(np.uint8)

def edge_detection_with_mask(image_path, mask, output_size=(40, 40)):
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"이미지를 불러올 수 없습니다: {image_path}")

    image = cv2.resize(image, (512, 512))
    mask = cv2.resize(mask, (512, 512), interpolation=cv2.INTER_NEAREST)
    
    mean_bgr = [103.939, 116.779, 123.68]

    # 전체 이미지에 대한 처리
    full_image_resized = image.astype(np.float32)
    full_image_resized -= mean_bgr
    full_image_resized = full_image_resized.transpose((2, 0, 1))  # HWC -> CHW
    full_image_resized = np.expand_dims(full_image_resized, axis=0)  # 배치 차원 추가

    inputs = {edge_session.get_inputs()[0].name: full_image_resized}
    preds = edge_session.run(None, inputs)

    full_edge_map = 1 / (1 + np.exp(-preds[0][0, 0, ...]))  
    full_edge_map = (full_edge_map * 255).astype(np.uint8)

    masked_full_edge_map = cv2.bitwise_and(full_edge_map, full_edge_map, mask=mask)

    # 팽창 및 대비 강화
    full_dilated_edge_map = apply_dilation(masked_full_edge_map, kernel_size=7, iterations=2)
    full_contrasted_edge_map = enhance_contrast(full_dilated_edge_map, contrast_factor=2.0)

    # 이진화 및 크기 조정
    _, full_binary_edge_map = cv2.threshold(full_contrasted_edge_map, 80, 1, cv2.THRESH_BINARY)
    resized_full_binary_edge_map = cv2.resize(full_binary_edge_map, output_size, interpolation=cv2.INTER_NEAREST)

    # 사분할 처리
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

    resized_binary_edge_maps = []
    for img_part, mask_part in zip(image_quarters, mask_quarters):
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

        dilated_edge_map = apply_dilation(masked_edge_map, kernel_size=7, iterations=2)
        contrasted_edge_map = enhance_contrast(dilated_edge_map, contrast_factor=2.0)

        _, binary_edge_map = cv2.threshold(contrasted_edge_map, 80, 1, cv2.THRESH_BINARY)
        resized_binary_edge_map = cv2.resize(binary_edge_map, output_size, interpolation=cv2.INTER_NEAREST)
        resized_binary_edge_maps.append(resized_binary_edge_map.tolist())

    # 전체 배열을 리스트의 첫 번째 요소로 추가
    resized_binary_edge_maps.insert(0, resized_full_binary_edge_map.tolist())

    return resized_binary_edge_maps

def process_image(image_path):
    # 세그멘테이션 수행
    mask = segment_image(image_path)
    
    # 엣지 검출 및 2D 배열 변환
    binary_arrays = edge_detection_with_mask(image_path, mask)
    
    return binary_arrays