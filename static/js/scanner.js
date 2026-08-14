document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const imagePreview = document.getElementById("imagePreview");
    const scanLine = document.getElementById("scanLine");

    const startBtn = document.getElementById("startBtn");
    const captureBtn = document.getElementById("captureBtn");
    const stopBtn = document.getElementById("stopBtn");
    const fileUploadInput = document.getElementById("fileUploadInput");

    const loadingBox = document.getElementById("loadingBox");
    const scannerAlert = document.getElementById("scannerAlert");
    const scannerAlertMsg = document.getElementById("scannerAlertMsg");

    let stream = null;

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
    async function startCamera() {
        hideAlert();
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            });

            video.srcObject = stream;
            video.classList.remove("d-none");
            imagePreview.classList.add("d-none");
            scanLine.classList.remove("d-none");

            startBtn.classList.add("d-none");
            captureBtn.classList.remove("d-none");
            stopBtn.classList.remove("d-none");
        } catch (err) {
            console.error("Camera access error:", err);
            showAlert("Unable to access camera. Please allow camera permission or use the 'Upload Photo' option.");
        }
    }

    // 2. STOP CAMERA
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        scanLine.classList.add("d-none");
        startBtn.classList.remove("d-none");
        captureBtn.classList.add("d-none");
        stopBtn.classList.add("d-none");
    }

    // 3. STEP PROGRESS ANIMATION
    function animateSteps() {
        const steps = [
            { id: "step1", text: "1. Frame captured.", icon: "fa-solid fa-check-circle text-success" },
            { id: "step2", text: "2. Detecting face alignment...", icon: "fa-solid fa-circle-notch fa-spin text-primary" },
            { id: "step3", text: "3. Extracting facial regions...", icon: "fa-solid fa-circle-notch fa-spin text-primary" },
            { id: "step4", text: "4. Analyzing skin metrics...", icon: "fa-solid fa-circle-notch fa-spin text-primary" },
            { id: "step5", text: "5. Finalizing skincare report...", icon: "fa-solid fa-circle-notch fa-spin text-primary" }
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
        }, 600);

        return interval;
    }

    // 4. SEND IMAGE TO BACKEND FOR ANALYSIS
    async function sendAnalysisRequest(payload, isFormData = false) {
        hideAlert();
        loadingBox.style.display = "block";
        loadingBox.scrollIntoView({ behavior: "smooth", block: "center" });

        const progressTimer = animateSteps();

        try {
            let fetchOptions = {
                method: "POST"
            };

            if (isFormData) {
                fetchOptions.body = payload;
            } else {
                fetchOptions.headers = { "Content-Type": "application/json" };
                fetchOptions.body = JSON.stringify(payload);
            }

            const response = await fetch("/analyze", {
                ...fetchOptions
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
                }, 800);
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

    // 5. CAPTURE FROM VIDEO
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
        imagePreview.src = base64Image;
        imagePreview.classList.remove("d-none");
        video.classList.add("d-none");

        sendAnalysisRequest({ image: base64Image }, false);
    }

    // 6. UPLOAD IMAGE FROM FILE
    if (fileUploadInput) {
        fileUploadInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            stopCamera();

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                imagePreview.src = base64;
                imagePreview.classList.remove("d-none");
                video.classList.add("d-none");

                sendAnalysisRequest({ image: base64 }, false);
            };
            reader.readAsDataURL(file);
        });
    }

    // Event Listeners
    if (startBtn) startBtn.addEventListener("click", startCamera);
    if (captureBtn) captureBtn.addEventListener("click", captureAndAnalyze);
    if (stopBtn) stopBtn.addEventListener("click", stopCamera);
});