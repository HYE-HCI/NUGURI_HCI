document.addEventListener("DOMContentLoaded", function () {
    const contentDiv = document.getElementById("content");

    // AJAX 페이지 로딩 함수
    async function loadPage(url) {
        try {
            const response = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
            if (response.ok) {
                const html = await response.text();
                contentDiv.innerHTML = html;

                // 브라우저 히스토리 관리
                history.pushState({ url: url }, null, url);

                // 새 콘텐츠에 이벤트 재등록
                attachEvents();
            } else {
                contentDiv.innerHTML = "<p>페이지를 로드할 수 없습니다.</p>";
            }
        } catch (error) {
            console.error("AJAX 요청 중 오류 발생:", error);
            contentDiv.innerHTML = "<p>서버와의 통신 중 오류가 발생했습니다.</p>";
        }
    }

    // '뒤로가기/앞으로가기' 버튼 처리
    window.addEventListener("popstate", function (event) {
        if (event.state && event.state.url) {
            loadPage(event.state.url);
        }
    });

    // 버튼과 링크에 이벤트 등록
    function attachEvents() {
        // 목록으로 돌아가기
        const backToListLink = document.getElementById("backToListLink");
        if (backToListLink) {
            backToListLink.addEventListener("click", function (event) {
                event.preventDefault();
                const url = this.getAttribute("href");
                loadPage(url);
            });
        }

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
    }

    // 초기 이벤트 등록
    attachEvents();
});
