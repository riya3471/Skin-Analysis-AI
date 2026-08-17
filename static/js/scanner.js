document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const imagePreview = document.getElementById("imagePreview");
    const scanLine = document.getElementById("scanLine");
    const cameraStandby = document.getElementById("cameraStandby");
    const faceGuide = document.getElementById("faceGuide");
    const faceGuideText = document.getElementById("faceGuideText");

    const standbyStartBtn = document.getElementById("standbyStartBtn");
    const startBtn = document.getElementById("startBtn");
    const captureBtn = document.getElementById("captureBtn");
    const flipBtn = document.getElementById("flipBtn");
    const stopBtn = document.getElementById("stopBtn");
    const fileUploadInput = document.getElementById("fileUploadInput");
    const dropzone = document.getElementById("dropzone");

    const loadingBox = document.getElementById("loadingBox");
    const scannerAlert = document.getElementById("scannerAlert");
    const scannerAlertMsg = document.getElementById("scannerAlertMsg");

    let stream = null;
    let currentFacingMode = "user";

    function showAlert(msg) {
        if (scannerAlert && scannerAlertMsg) {
            scannerAlertMsg.textContent = msg;
            scannerAlert.classList.remove("d-none");
            scannerAlert.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            alert(msg);
        }
    }

    function hideAlert() {
        if (scannerAlert) {
            scannerAlert.classList.add("d-none");
        }
    }

    // 1. START CAMERA
    async function startCamera(facingMode = "user") {
        hideAlert();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: facingMode
                },
                audio: false
            });

            video.srcObject = stream;
            video.classList.remove("d-none");
            if (cameraStandby) cameraStandby.classList.add("d-none");
            if (imagePreview) imagePreview.classList.add("d-none");
            if (scanLine) scanLine.classList.remove("d-none");
            if (faceGuide) {
                faceGuide.classList.remove("d-none");
                faceGuide.classList.add("ready");
            }
            if (faceGuideText) faceGuideText.classList.remove("d-none");

            if (startBtn) startBtn.classList.add("d-none");
            if (standbyStartBtn) standbyStartBtn.classList.add("d-none");
            if (captureBtn) captureBtn.classList.remove("d-none");
            if (flipBtn) flipBtn.classList.remove("d-none");
            if (stopBtn) stopBtn.classList.remove("d-none");
        } catch (err) {
            console.error("Camera access error:", err);
            showAlert("Unable to access camera. Please check camera permissions or drag-and-drop a photo below.");
            stopCamera();
        }
    }

    // 2. STOP CAMERA
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (video) {
            video.srcObject = null;
            video.classList.add("d-none");
        }
        if (cameraStandby) cameraStandby.classList.remove("d-none");
        if (scanLine) scanLine.classList.add("d-none");
        if (faceGuide) faceGuide.classList.add("d-none");
        if (faceGuideText) faceGuideText.classList.add("d-none");

        if (startBtn) startBtn.classList.remove("d-none");
        if (standbyStartBtn) standbyStartBtn.classList.remove("d-none");
        if (captureBtn) captureBtn.classList.add("d-none");
        if (flipBtn) flipBtn.classList.add("d-none");
        if (stopBtn) stopBtn.classList.add("d-none");
    }

    // 3. FLIP CAMERA
    function flipCamera() {
        currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
        startCamera(currentFacingMode);
    }

    // 4. STEP PROGRESS ANIMATION
    function animateSteps() {
        const steps = [
            { id: "step1", text: "1. Camera frame validated.", icon: "fa-solid fa-check-circle text-success" },
            { id: "step2", text: "2. Detecting face alignment...", icon: "fa-solid fa-circle-notch fa-spin text-primary" },
            { id: "step3", text: "3. Isolating forehead, cheeks & T-zone...", icon: "fa-solid fa-circle-notch fa-spin text-primary" },
            { id: "step4", text: "4. Analyzing oiliness, texture & redness...", icon: "fa-solid fa-circle-notch fa-spin text-primary" },
            { id: "step5", text: "5. Formulating skincare regimen...", icon: "fa-solid fa-circle-notch fa-spin text-primary" }
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index > 0 && index - 1 < steps.length) {
                const prev = document.getElementById(`step${index}`);
                if (prev) {
                    prev.className = "py-1 text-success fw-medium";
                    prev.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> ${steps[index - 1].text.replace("...", " completed.")}`;
                }
            }

            if (index < steps.length) {
                const curr = document.getElementById(steps[index].id);
                if (curr) {
                    curr.className = "py-1 fw-bold text-dark";
                    curr.innerHTML = `<i class="${steps[index].icon} me-2"></i> ${steps[index].text}`;
                }
                index++;
            } else {
                clearInterval(interval);
            }
        }, 500);

        return interval;
    }

    // 5. SEND IMAGE TO BACKEND FOR ANALYSIS
    async function sendAnalysisRequest(payload) {
        hideAlert();
        loadingBox.style.display = "block";
        loadingBox.scrollIntoView({ behavior: "smooth", block: "center" });

        const progressTimer = animateSteps();

        try {
            const response = await fetch("/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            clearInterval(progressTimer);

            if (response.ok && data.success) {
                // Mark all steps as complete
                for (let i = 1; i <= 5; i++) {
                    const el = document.getElementById(`step${i}`);
                    if (el) {
                        el.className = "py-1 text-success fw-medium";
                        el.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> Step ${i} complete.`;
                    }
                }

                setTimeout(() => {
                    window.location.href = data.redirect || "/result";
                }, 600);
            } else {
                loadingBox.style.display = "none";
                showAlert(data.message || "Skin analysis could not be completed. Please try again with better lighting.");
            }
        } catch (error) {
            clearInterval(progressTimer);
            loadingBox.style.display = "none";
            console.error("Analysis network error:", error);
            showAlert("Server error during skin analysis. Please check your connection and try again.");
        }
    }

    // 6. CAPTURE FROM VIDEO
    function captureAndAnalyze() {
        if (!video.videoWidth) {
            showAlert("Camera video is not ready yet. Please wait a moment.");
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64Image = canvas.toDataURL("image/jpeg", 0.92);
        stopCamera();

        // Show captured image in preview
        if (imagePreview) {
            imagePreview.src = base64Image;
            imagePreview.classList.remove("d-none");
            if (cameraStandby) cameraStandby.classList.add("d-none");
        }

        sendAnalysisRequest({ image: base64Image });
    }

    // 7. HANDLE FILE UPLOAD (INPUT & DRAG-AND-DROP)
    function processImageFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            showAlert("Please upload a valid image file (JPEG, PNG, WEBP).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showAlert("The selected file exceeds the 10MB size limit.");
            return;
        }

        stopCamera();

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            if (imagePreview) {
                imagePreview.src = base64;
                imagePreview.classList.remove("d-none");
                if (cameraStandby) cameraStandby.classList.add("d-none");
            }
            sendAnalysisRequest({ image: base64 });
        };
        reader.readAsDataURL(file);
    }

    if (fileUploadInput) {
        fileUploadInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                processImageFile(e.target.files[0]);
            }
        });
    }

    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                processImageFile(e.dataTransfer.files[0]);
            }
        });
    }

    // Event Listeners
    if (standbyStartBtn) standbyStartBtn.addEventListener("click", () => startCamera("user"));
    if (startBtn) startBtn.addEventListener("click", () => startCamera("user"));
    if (captureBtn) captureBtn.addEventListener("click", captureAndAnalyze);
    if (flipBtn) flipBtn.addEventListener("click", flipCamera);
    if (stopBtn) stopBtn.addEventListener("click", stopCamera);
});