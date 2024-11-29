import { onConnectButtonClick, onDisconnectButtonClick,testDisplayOnDotPad} from "./DotPad_CSUNdemo_chart2.js";
window.binaryArrays = [];
window.positions = [ 
    ["왼쪽 상단", [[1, 1, 1, 1, 1],[1,1,1,1,1]]],
    ["오른쪽 상단", [[1, 0, 1, 0, 1],[1,0,1,0,1]]],
    ["왼쪽 하단", [[0, 0, 1, 0, 0],[0,0,1,0,0]]],
    ["오른쪽 하단", [[0, 1, 0, 1, 0],[0,1,0,1,0]]],
];
document.addEventListener("DOMContentLoaded", function () {
    const processImageBtn = document.getElementById("processImageBtn");

    if (processImageBtn) {
        processImageBtn.addEventListener("click", async function () {
            const productId = this.dataset.id; // data-id에서 product_id 가져오기
            const resultDiv = document.getElementById("processResult");
    
            // CSRF 토큰 가져오기
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            try {
                const fetchStartTime = performance.now();

                console.log("Sending fetch request...");
                const response = await fetch(`/app/process_image/${productId}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken, // CSRF 토큰 추가
                    }
                });

                const fetchEndTime = performance.now();
                console.log(`Fetch request completed in ${(fetchEndTime - fetchStartTime).toFixed(2)} ms`);

                if (response.ok) {
                    const result = await response.json(); // JSON 데이터를 받아옴
                    window.binaryArrays = result.binary_arrays;
                    testDisplayOnDotPad(window.binaryArrays[0],window.positions[0][1]);

                } else {
                    resultDiv.innerHTML = "<p>이미지 처리를 실패했습니다.</p>";
                    console.error("Response error:", await response.text()); // 디버깅용 출력
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
