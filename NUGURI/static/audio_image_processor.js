$(document).ready(() => {
    console.log("jQuery is ready and working!");
});


// 녹음 상태 관리
let isRecording = false;
let mediaRecorder;
let audioStream;
let audioChunks = [];

// JSON 데이터 파일 URL (static 폴더에 저장된 JSON 파일 경로)
const jsonFilePath = "/static/data/products.json";

// JSON 데이터를 읽어와 특정 PK의 이미지 경로 가져오기
async function getImagePath(pk) {
    try {
        const response = await fetch(jsonFilePath);
        const data = await response.json();
        const product = data.find(item => item.pk === pk);

        if (product) {
            return `/media/${product.fields.image}`;
        } else {
            console.error("해당 PK에 대한 제품 데이터를 찾을 수 없습니다.");
            return null;
        }
    } catch (error) {
        console.error("JSON 데이터 읽기 오류:", error);
        return null;
    }
}

// 이미지 분석 요청
async function analyzeImage(pk) {
    const imagePath = await getImagePath(pk);
    if (!imagePath) {
        alert("이미지 경로를 찾을 수 없습니다.");
        return;
    }

    try {
        const formData = new FormData();
        const response = await fetch(imagePath);
        const blob = await response.blob();
        formData.append("image", blob);

        const question = $("#questionText").val(); // 선택적으로 질문 추가
        if (question) {
            formData.append("question", question);
        }

        const result = await fetch("/app/analyze_image/", {
            method: "POST",
            body: formData,
        });

        if (result.ok) {
            const data = await result.json();
            console.log("이미지 분석 결과:", data.response);
            playTTS(data.response); // TTS 재생
        } else {
            console.error("이미지 분석 실패:", result.statusText);
            alert("이미지 분석 중 오류가 발생했습니다.");
        }
    } catch (error) {
        console.error("이미지 분석 요청 오류:", error);
    }
}

// 음성과 이미지를 함께 처리
async function processAudioWithImage(pk) {
    const imagePath = await getImagePath(pk);
    if (!imagePath) {
        alert("이미지 경로를 찾을 수 없습니다.");
        return;
    }

    try {
        const formData = new FormData();
        const response = await fetch(imagePath);
        const blob = await response.blob();
        formData.append("image", blob);

        const audioBlob = new Blob(audioChunks, { type: "audio/webm;codecs=opus" });
        formData.append("audio", audioBlob, "temp_audio.webm");

        const result = await fetch("/app/process_audio/", {
            method: "POST",
            body: formData,
        });

        if (result.ok) {
            const data = await result.json();
            console.log("질문:", data.question);
            console.log("응답:", data.response);

            // 응답을 TTS로 재생
            playTTS(data.response);
        } else {
            console.error("음성 및 이미지 처리 실패:", result.statusText);
            alert("음성 처리 중 오류가 발생했습니다.");
        }
    } catch (error) {
        console.error("음성 및 이미지 처리 요청 오류:", error);
    }
}

// TTS로 응답 읽기
function playTTS(text) {
    const audio = new Audio("/media/sounds/speech.mp3");
    audio.play().catch(error => {
        console.error("TTS 재생 실패:", error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const pk = parseInt(productPk, 10); // PK 값 설정 (요구 사항에 따라 동적으로 변경 가능)
    console.log("현재 제품의 PK는:", pk);

    // 키보드 이벤트 처리
    document.addEventListener("keydown", async (event) => {
        console.log("현재 제품의 PK는:", pk);
        if (event.key === "R" || event.key === "r") {
            console.log("키보드 R 입력: 이미지 분석 시작");
            await analyzeImage(pk);
        } else if (event.key === "T" || event.key === "t") {
            if (!isRecording) {
                console.log("키보드 T 입력: 녹음 시작");
                try {
                    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm;codecs=opus" });
                    audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = async () => {
                        console.log("녹음 중지");
                        audioStream.getTracks().forEach(track => track.stop());
                        await processAudioWithImage(pk);
                    };

                    mediaRecorder.start();
                    isRecording = true;
                } catch (error) {
                    console.error("마이크 접근 오류:", error);
                    alert("마이크 접근에 실패했습니다.");
                }
            } else {
                console.log("키보드 T 입력: 녹음 중지");
                mediaRecorder.stop();
                isRecording = false;
            }
        }
    });
});
