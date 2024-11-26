import { onConnectButtonClick, onDisconnectButtonClick,testDisplayOnDotPad} from "./DotPad_CSUNdemo_chart2.js";

document.addEventListener("DOMContentLoaded", function () {
    const processImageBtn = document.getElementById("processImageBtn");
    if (processImageBtn) {
        processImageBtn.addEventListener("click", async function () {
            const productId = this.dataset.id; // data-id에서 product_id 가져오기
            const resultDiv = document.getElementById("processResult");
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content'); // CSRF 토큰 가져오기

            try {
                const fetchStartTime = performance.now();
                console.log("Sending fetch request...");
                const response = await fetch(`/app/process_image/${productId}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    }
                });

                const fetchEndTime = performance.now();
                console.log(`Fetch request completed in ${(fetchEndTime - fetchStartTime).toFixed(2)} ms`);

                if (response.ok) {
                    const result = await response.json();
                    const binaryArrays = result.binary_arrays;
                    testDisplayOnDotPad(binaryArrays);
                } else {
                    resultDiv.innerHTML = "<p>이미지 처리를 실패했습니다.</p>";
                    console.error("Response error:", await response.text());
                }
            } catch (error) {
                console.error("Error:", error);
                resultDiv.innerHTML = "<p>서버 오류가 발생했습니다.</p>";
            }
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
            if (category === 'all' || img.classList.contains(category)) {
                img.classList.remove('hidden');
            } else {
                img.classList.add('hidden');
            }
        });
    }

    // 초기화 시 전체 이미지 표시
    filterImages("all");
});


