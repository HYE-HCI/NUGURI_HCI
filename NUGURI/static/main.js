import { onConnectButtonClick, onDisconnectButtonClick } from "./DotPad_CSUNdemo_chart2.js";

document.addEventListener("DOMContentLoaded", function () {
    const contentDiv = document.getElementById("content");

    // 이미지 처리 버튼
    const processImageBtn = document.getElementById("processImageBtn");
    if (processImageBtn) {
        processImageBtn.addEventListener("click", async function () {
            const productId = "{{ product.id }}";
            const resultDiv = document.getElementById("processResult");

            try {
                const response = await fetch(`/app/process_image/${productId}/`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": "{{ csrf_token }}" // CSRF 토큰 포함
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    resultDiv.innerHTML = "<pre>" + JSON.stringify(result, null, 2) + "</pre>";
                } else {
                    resultDiv.innerHTML = "<p>이미지 처리를 실패했습니다.</p>";
                }
            } catch (error) {
                console.error("Error:", error);
                resultDiv.innerHTML = "<p>서버 오류가 발생했습니다.</p>";
            }
        });
    }

    // 토글 버튼 이벤트
    const toggleButtonElement = document.getElementById("buttonImage");
    if (toggleButtonElement) {
        toggleButtonElement.parentElement.addEventListener("click", function () {
            toggleButton();
        });
    }

    // 필터 버튼 이벤트
    const filterButtons = document.querySelectorAll(".sidebar button");
    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            const category = this.getAttribute("data-category") || "all";
            filterImages(category);
        });
    });

    // 이미지 필터링 함수
    function filterImages(category) {
        const images = document.querySelectorAll('#imageGrid img');
        images.forEach(img => {
            if (category === 'all') {
                img.classList.remove('hidden');
            } else {
                if (img.classList.contains(category)) {
                    img.classList.remove('hidden');
                } else {
                    img.classList.add('hidden');
                }
            }
        });
    }

    // 버튼 토글 함수
    window.toggleButton = function () {
        var buttonImg = document.getElementById("buttonImage");
        if (buttonImg.alt === "OFF") {
            buttonImg.src = "/static/images/on_button.jpg";
            buttonImg.alt = "ON";
            onConnectButtonClick();
        } else {
            buttonImg.src = "/static/images/off_button.jpg";
            buttonImg.alt = "OFF";
            onDisconnectButtonClick();
        }
    };

    // 초기화 시 전체 이미지 표시
    filterImages("all");
});
