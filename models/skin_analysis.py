import cv2
import os
import json
import base64
import urllib.request
import urllib.error
import numpy as np
from models.recommendations import get_recommendations

# =====================================================================
# 1. COLOR CONSTANCY & ILLUMINATION NORMALIZATION HELPERS
# =====================================================================

def apply_gray_world_white_balance(bgr_image, skin_mask=None):
    """
    Applies gentle illumination normalization:
    Normalizes lighting variation using adaptive luminance equalization in LAB space
    while preserving physiological skin chrominance.
    """
    lab = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2LAB)
    l_chan, a_chan, b_chan = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
    l_norm = clahe.apply(l_chan)
    return cv2.cvtColor(cv2.merge([l_norm, a_chan, b_chan]), cv2.COLOR_LAB2BGR)


def get_skin_mask(bgr_image):
    """
    Extracts a robust skin mask combining universal YCrCb and HSV color spaces.
    Accommodates diverse Fitzpatrick skin tones and varying ambient color temperatures.
    """
    ycrcb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2YCrCb)
    mask_ycrcb = cv2.inRange(
        ycrcb,
        np.array([0, 120, 68], dtype=np.uint8),
        np.array([255, 185, 144], dtype=np.uint8)
    )

    hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
    mask_hsv1 = cv2.inRange(
        hsv,
        np.array([0, 12, 35], dtype=np.uint8),
        np.array([35, 255, 255], dtype=np.uint8)
    )
    mask_hsv2 = cv2.inRange(
        hsv,
        np.array([168, 12, 35], dtype=np.uint8),
        np.array([180, 255, 255], dtype=np.uint8)
    )
    mask_hsv = cv2.bitwise_or(mask_hsv1, mask_hsv2)

    combined = cv2.bitwise_and(mask_ycrcb, mask_hsv)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=1)
    return combined


# =====================================================================
# 2. GEMINI MULTIMODAL VISION HELPER (OPTIONAL HYBRID ENGINE)
# =====================================================================

def analyze_with_gemini_vision(image_path):
    """
    Uses OpenRouter Multimodal AI Vision (Gemini) as primary face detector and biomarker analyst.
    Returns structured JSON with face detection status, normalized face bounding box, and dermatological biomarkers.
    """
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    nvidia_key = os.environ.get("NVIDIA_API_KEY", "").strip()
    openrouter_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not openrouter_key and api_key.startswith("sk-or-"):
        openrouter_key = api_key

    if not openai_key and not nvidia_key and not openrouter_key and not api_key:
        return None

    try:
        # Pre-resize image to max 640px before encoding for instant sub-3s cloud vision inference
        img_bgr = cv2.imread(image_path)
        if img_bgr is not None:
            hi, wi = img_bgr.shape[:2]
            scale = 512.0 / max(hi, wi) if max(hi, wi) > 512 else 1.0
            if scale < 1.0:
                img_small = cv2.resize(img_bgr, (int(wi * scale), int(hi * scale)), interpolation=cv2.INTER_AREA)
            else:
                img_small = img_bgr
            _, buf = cv2.imencode(".jpg", img_small, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            base64_data = base64.b64encode(buf).decode("utf-8")
        else:
            with open(image_path, "rb") as img_file:
                base64_data = base64.b64encode(img_file.read()).decode("utf-8")

        prompt = (
            "You are a strict dermatological facial verification and biomarker AI.\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. FACE VERIFICATION: Inspect whether this image contains a clear, real HUMAN FACE suitable for facial skin analysis.\n"
            "   - If the image contains a real human face (e.g. front portrait, selfie, webcam capture, angled pose with visible forehead/cheeks), set is_face_detected to true.\n"
            "   - If the image contains NO human face (e.g. animals, pets, cars, food, clothing, nature/landscape, furniture, documents, hand/foot/body parts without a face, cartoons, or non-human objects), set is_face_detected to false and provide rejection_reason: 'Only human faces are accepted. Please upload or scan a clear front-facing portrait of your face.'\n"
            "2. FACE BOUNDING BOX: If is_face_detected is true, provide normalized coordinates [ymin, xmin, ymax, xmax] as integers between 0 and 1000 tightly framing the human face from forehead/hairline to chin.\n"
            "3. OVERALL CONDITION: If is_face_detected is true, provide a concise 3-5 word clinical description in overall_condition (e.g., 'Normal Skin', 'Mild T-Zone Shine', 'Balanced Barrier', 'Dehydrated Barrier', 'Erythema & Sensitivity').\n\n"
            "Strictly return a JSON object matching this schema:\n"
            "{\n"
            '  "is_face_detected": true,\n'
            '  "rejection_reason": null,\n'
            '  "face_box": [100, 250, 850, 750],\n'
            '  "overall_condition": "<Short 3-5 word clinical description>"\n'
            "}"
        )

        def _parse_ai_json(text_content):
            clean_text = str(text_content or "").strip()
            if "```json" in clean_text:
                clean_text = clean_text.split("```json", 1)[1].split("```", 1)[0].strip()
            elif "```" in clean_text:
                clean_text = clean_text.split("```", 1)[1].split("```", 1)[0].strip()
            start_i = clean_text.find("{")
            end_i = clean_text.rfind("}")
            if start_i != -1 and end_i > start_i:
                clean_text = clean_text[start_i:end_i+1]
            try:
                return json.loads(clean_text)
            except Exception:
                for patch in ["}", '"}', '"]}', '"}]}', '"}}']:
                    try:
                        return json.loads(clean_text + patch)
                    except Exception:
                        pass
                raise

        # 1. Primary: OpenAI Vision (gpt-4o-mini with low detail for fast, minimal-token cost)
        if openai_key:
            try:
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_data}",
                                        "detail": "low"
                                    }
                                }
                            ]
                        }
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 180,
                    "temperature": 0.1
                }
                req = urllib.request.Request(
                    "https://api.openai.com/v1/chat/completions",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {openai_key}"
                    }
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    resp_body = json.loads(response.read().decode("utf-8"))
                    candidate_text = resp_body["choices"][0]["message"]["content"]
                    ai_data = _parse_ai_json(candidate_text)
                    print("Skin Analysis AI: Successfully processed facial scan via OpenAI (gpt-4o-mini).")
                    return ai_data
            except Exception as oaiex:
                print(f"OpenAI Vision note: {oaiex}")

        # 2. Secondary: NVIDIA NIM Multimodal Vision (meta/llama-3.2-11b-vision-instruct)
        if nvidia_key:
            nv_vision_models = [
                "meta/llama-3.2-11b-vision-instruct"
            ]
            for nv_model in nv_vision_models:
                try:
                    payload = {
                        "model": nv_model,
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt},
                                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_data}"}}
                                ]
                            }
                        ],
                        "max_tokens": 300,
                        "temperature": 0.1
                    }
                    req = urllib.request.Request(
                        "https://integrate.api.nvidia.com/v1/chat/completions",
                        data=json.dumps(payload).encode("utf-8"),
                        headers={
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": f"Bearer {nvidia_key}"
                        }
                    )
                    with urllib.request.urlopen(req, timeout=25) as response:
                        resp_body = json.loads(response.read().decode("utf-8"))
                        candidate_text = resp_body["choices"][0]["message"]["content"]
                        ai_data = _parse_ai_json(candidate_text)
                        print(f"Skin Analysis AI: Successfully processed facial scan via NVIDIA NIM ({nv_model}).")
                        return ai_data
                except Exception as nvex:
                    print(f"NVIDIA NIM Vision ({nv_model}) note: {nvex}")
                    continue

        # 2. Secondary: OpenRouter AI Vision (Gemini 3.5 Flash Lite / 3.7 Flash)
        if openrouter_key:
            or_models = [
                "google/gemini-3.5-flash-lite",
                "google/gemini-3.7-flash",
                "google/gemini-3.6-flash",
            ]
            for model_name in or_models:
                try:
                    payload = {
                        "model": model_name,
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt},
                                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_data}"}}
                                ]
                            }
                        ],
                        "response_format": {"type": "json_object"},
                        "max_tokens": 400,
                        "temperature": 0.2
                    }
                    req = urllib.request.Request(
                        "https://openrouter.ai/api/v1/chat/completions",
                        data=json.dumps(payload).encode("utf-8"),
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {openrouter_key}",
                            "HTTP-Referer": "https://skinai.com",
                            "X-Title": "Skin Analysis AI"
                        }
                    )
                    with urllib.request.urlopen(req, timeout=25) as response:
                        resp_body = json.loads(response.read().decode("utf-8"))
                        candidate_text = resp_body["choices"][0]["message"]["content"].strip()
                        if candidate_text.startswith("```"):
                            candidate_text = candidate_text.split("\n", 1)[1]
                            if candidate_text.endswith("```"):
                                candidate_text = candidate_text.rsplit("```", 1)[0]
                            candidate_text = candidate_text.strip()
                        ai_data = json.loads(candidate_text)
                        print(f"Skin Analysis AI: Successfully processed facial scan via OpenRouter ({model_name}).")
                        return ai_data
                except Exception as ex:
                    print(f"OpenRouter Vision model {model_name} note: {ex}")
                    if "402" in str(ex):
                        break
                    continue

        # 2. Secondary: Direct Google Gemini REST API (if non-OpenRouter key configured)
        if api_key and not api_key.startswith("sk-or-"):
            models_to_try = [
                "models/gemini-3.5-flash-lite",
                "models/gemini-3.6-flash",
                "models/gemini-flash-latest",
            ]
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": base64_data
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.2
                }
            }
            json_bytes = json.dumps(payload).encode("utf-8")
            for model_name in models_to_try:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={api_key}"
                    req = urllib.request.Request(
                        url,
                        data=json_bytes,
                        headers={
                            "Content-Type": "application/json",
                            "x-goog-api-key": api_key
                        }
                    )
                    with urllib.request.urlopen(req, timeout=10) as response:
                        resp_body = json.loads(response.read().decode("utf-8"))
                        candidate_text = resp_body["candidates"][0]["content"]["parts"][0]["text"].strip()
                        if candidate_text.startswith("```"):
                            candidate_text = candidate_text.split("\n", 1)[1]
                            if candidate_text.endswith("```"):
                                candidate_text = candidate_text.rsplit("```", 1)[0]
                            candidate_text = candidate_text.strip()
                        gemini_data = json.loads(candidate_text)
                        print(f"Skin Analysis AI: Successfully received multimodal assessment from {model_name}.")
                        return gemini_data
                except Exception as ex:
                    print(f"Gemini API model {model_name} note: {ex}")
                    continue

        return None

    except Exception as e:
        print(f"AI Vision API Note: {e}. Gracefully continuing with enhanced CV pipeline.")
        return None



# =====================================================================
# 3. MAIN ANALYSIS PIPELINE
# =====================================================================

def analyze_skin_image(image_path, output_dir=None):
    """
    Performs robust, illumination-invariant, noise-filtered computer vision skin analysis.
    Uses Gray-World color constancy, inner-malar skin masking, bandpass texture extraction,
    and relative baseline metrics.
    """
    if not os.path.exists(image_path):
        return {"success": False, "message": "Image not found."}

    image = cv2.imread(image_path)
    if image is None:
        return {"success": False, "message": "Unable to read image."}

    # Prepare output directory for crops
    if output_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_dir = os.path.join(base_dir, "static", "uploads", "crops")
    os.makedirs(output_dir, exist_ok=True)

    h_img, w_img = image.shape[:2]
    if h_img < 60 or w_img < 60:
        return {"success": False, "message": "Image resolution is too low for skin analysis."}

    gray_full = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean_brightness = float(np.mean(gray_full))
    std_contrast = float(np.std(gray_full))

    if mean_brightness < 28:
        return {
            "success": False,
            "message": "Image is too dark or the camera is covered. Please ensure good lighting and uncover the lens."
        }

    if mean_brightness > 245 and std_contrast < 15:
        return {
            "success": False,
            "message": "Image is completely overexposed or white. Please adjust camera exposure and lighting."
        }

    if std_contrast < 10:
        return {
            "success": False,
            "message": "Image appears blank or uniform. Please point the camera clearly at your face."
        }

    # =====================================================
    # 1. FACE REGISTRATION & LOCALIZATION
    # =====================================================
    face_box = None
    clinical_condition = None
    engine_used = "opencv_cv"

    # Primary: Multimodal AI Vision face detector
    ai_data = analyze_with_gemini_vision(image_path)
    if ai_data is not None:
        if not ai_data.get("is_face_detected", True):
            return {
                "success": False,
                "message": ai_data.get("rejection_reason") or "Only human faces are accepted. Please upload or scan a clear front-facing portrait of your face."
            }
        else:
            clinical_condition = ai_data.get("overall_condition")
            raw_box = ai_data.get("face_box")
            if isinstance(raw_box, (list, tuple)) and len(raw_box) == 4:
                try:
                    ymin, xmin, ymax, xmax = [float(v) for v in raw_box]
                    y1 = int(max(0, min(h_img, (ymin / 1000.0) * h_img)))
                    y2 = int(max(0, min(h_img, (ymax / 1000.0) * h_img)))
                    x1 = int(max(0, min(w_img, (xmin / 1000.0) * w_img)))
                    x2 = int(max(0, min(w_img, (xmax / 1000.0) * w_img)))
                    bw = x2 - x1
                    bh = y2 - y1
                    # Enforce anatomical head proportion: height should not exceed 1.30x width
                    if bh > int(bw * 1.30):
                        bh = int(bw * 1.30)
                    if bw > 40 and bh > 40:
                        face_box = (x1, y1, bw, bh)
                        engine_used = "ai_vision"
                except Exception:
                    face_box = None

    # Fallback: Multi-scale & Multi-rotation Haar cascades
    if face_box is None:
        def detect_face_multiscale(gray_img, w_i, h_i):
            cascade_names = [
                "haarcascade_frontalface_default.xml",
                "haarcascade_frontalface_alt2.xml",
                "haarcascade_profileface.xml"
            ]
            cascades = []
            for cf in cascade_names:
                try:
                    cf_path = cf
                    if hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
                        cf_path = os.path.join(cv2.data.haarcascades, cf)
                    if os.path.exists(cf_path):
                        c = cv2.CascadeClassifier(cf_path)
                        if not c.empty():
                            cascades.append(c)
                    elif hasattr(cv2, "CascadeClassifier"):
                        c = cv2.CascadeClassifier(cf)
                        if not c.empty():
                            cascades.append(c)
                except Exception:
                    pass

            if not cascades:
                return None

            for c in cascades:
                try:
                    faces = c.detectMultiScale(
                        gray_img,
                        scaleFactor=1.08,
                        minNeighbors=3,
                        minSize=(int(w_i * 0.12), int(h_i * 0.12))
                    )
                    if len(faces) > 0:
                        return max(faces, key=lambda b: b[2] * b[3])
                except Exception:
                    pass

            center_pt = (w_i // 2, h_i // 2)
            for angle in [15, -15, 25, -25, 35, -35, 45, -45]:
                try:
                    M = cv2.getRotationMatrix2D(center_pt, angle, 1.0)
                    rotated_gray = cv2.warpAffine(gray_img, M, (w_i, h_i), flags=cv2.INTER_LINEAR)
                    for c in cascades:
                        faces = c.detectMultiScale(
                            rotated_gray,
                            scaleFactor=1.08,
                            minNeighbors=3,
                            minSize=(int(w_i * 0.12), int(h_i * 0.12))
                        )
                        if len(faces) > 0:
                            bx, by, bw, bh = max(faces, key=lambda b: b[2] * b[3])
                            box_center_rot = np.array([bx + bw / 2.0, by + bh / 2.0, 1.0])
                            M_inv = cv2.getRotationMatrix2D(center_pt, -angle, 1.0)
                            orig_center = M_inv.dot(box_center_rot)
                            orig_x = int(max(0, orig_center[0] - bw / 2.0))
                            orig_y = int(max(0, orig_center[1] - bh / 2.0))
                            orig_w = int(min(w_i - orig_x, bw))
                            orig_h = int(min(h_i - orig_y, bh))
                            if orig_w > 30 and orig_h > 30:
                                return (orig_x, orig_y, orig_w, orig_h)
                except Exception:
                    pass
            return None

        face_box = detect_face_multiscale(gray_full, w_img, h_img)

    # 3. Robust Skin Contour Segmentation Fallback (only if AI is offline and skin ratio is significant)
    full_skin_mask = get_skin_mask(image)
    skin_pixels_total = np.count_nonzero(full_skin_mask)
    total_img_pixels = max(1, h_img * w_img)
    skin_ratio_full = float(skin_pixels_total) / float(total_img_pixels)

    if face_box is None and skin_ratio_full >= 0.08:
        try:
            upper_mask = full_skin_mask.copy()
            contours, _ = cv2.findContours(upper_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            valid_candidates = []
            for c in contours:
                area = cv2.contourArea(c)
                if area > (h_img * w_img * 0.04):
                    bx, by, bw, bh = cv2.boundingRect(c)
                    aspect = bh / max(1, bw)
                    if 0.6 <= aspect <= 2.2:
                        valid_candidates.append((bx, by, bw, bh, area))
            if valid_candidates:
                valid_candidates.sort(key=lambda x: x[4], reverse=True)
                best_bx, best_by, best_bw, best_bh, _ = valid_candidates[0]
                if best_bh > best_bw * 1.30:
                    best_bh = int(best_bw * 1.30)
                face_box = (best_bx, best_by, best_bw, min(h_img - best_by, best_bh))
        except Exception as ex:
            print(f"Skin contour localization note: {ex}")

    # Strict rejection: If no human face was found by AI, Haar cascades, or verified head contours, REJECT.
    if face_box is None:
        return {
            "success": False,
            "message": "Only human faces are accepted. No human face was detected in the image. Please position your face clearly in good lighting."
        }

    x, y, w, h = face_box
    face_raw = image[y:y + h, x:x + w]
    face_h, face_w = face_raw.shape[:2]

    # Verify human skin presence inside the localized facial frame
    face_skin_mask = get_skin_mask(face_raw)
    skin_ratio = float(np.count_nonzero(face_skin_mask)) / float(max(1, face_w * face_h))

    if skin_ratio < 0.10:
        return {
            "success": False,
            "message": "Only human faces are accepted. The detected region does not contain sufficient human skin tones."
        }

    # =====================================================
    # COLOR CONSTANCY & ILLUMINATION NORMALIZATION
    # =====================================================
    # Normalize luminance across the face in LAB space to eliminate ambient lighting variance
    face_normalized = apply_gray_world_white_balance(face_raw, face_skin_mask)

    # Save visual crop images for frontend UI display
    face_crop_path = os.path.join(output_dir, "cropped_face.jpg")
    cv2.imwrite(face_crop_path, face_raw)

    # =====================================================
    # PRECISE INNER-MALAR & T-ZONE REGIONS
    # =====================================================
    # Forehead: Central upper region
    fh_y1, fh_y2 = int(face_h * 0.12), int(face_h * 0.30)
    fh_x1, fh_x2 = int(face_w * 0.28), int(face_w * 0.72)

    # Left Malar Cheek
    lc_y1, lc_y2 = int(face_h * 0.42), int(face_h * 0.68)
    lc_x1, lc_x2 = int(face_w * 0.18), int(face_w * 0.42)

    # Right Malar Cheek
    rc_y1, rc_y2 = int(face_h * 0.42), int(face_h * 0.68)
    rc_x1, rc_x2 = int(face_w * 0.58), int(face_w * 0.82)

    forehead = face_normalized[fh_y1:fh_y2, fh_x1:fh_x2]
    left_cheek = face_normalized[lc_y1:lc_y2, lc_x1:lc_x2]
    right_cheek = face_normalized[rc_y1:rc_y2, rc_x1:rc_x2]

    # Save region crops for frontend inspection tabs
    forehead_crop_path = os.path.join(output_dir, "forehead.jpg")
    left_cheek_crop_path = os.path.join(output_dir, "left_cheek.jpg")
    right_cheek_crop_path = os.path.join(output_dir, "right_cheek.jpg")

    cv2.imwrite(forehead_crop_path, face_raw[fh_y1:fh_y2, fh_x1:fh_x2])
    cv2.imwrite(left_cheek_crop_path, face_raw[lc_y1:lc_y2, lc_x1:lc_x2])
    cv2.imwrite(right_cheek_crop_path, face_raw[rc_y1:rc_y2, rc_x1:rc_x2])

    # Extract skin masks for regions
    fh_mask = get_skin_mask(forehead)
    lc_mask = get_skin_mask(left_cheek)
    rc_mask = get_skin_mask(right_cheek)

    # =====================================================
    # 4. ILLUMINATION-INVARIANT BRIGHTNESS & OILINESS
    # =====================================================
    fh_hsv = cv2.cvtColor(forehead, cv2.COLOR_BGR2HSV)
    lc_hsv = cv2.cvtColor(left_cheek, cv2.COLOR_BGR2HSV)
    rc_hsv = cv2.cvtColor(right_cheek, cv2.COLOR_BGR2HSV)

    fh_val = fh_hsv[:, :, 2].astype(np.float32)
    fh_sat = fh_hsv[:, :, 1].astype(np.float32)
    lc_val = lc_hsv[:, :, 2].astype(np.float32)
    rc_val = rc_hsv[:, :, 2].astype(np.float32)

    forehead_brightness = float(np.mean(fh_val[fh_mask > 0])) if np.count_nonzero(fh_mask) > 10 else float(np.mean(fh_val))
    lc_brightness = float(np.mean(lc_val[lc_mask > 0])) if np.count_nonzero(lc_mask) > 10 else float(np.mean(lc_val))
    rc_brightness = float(np.mean(rc_val[rc_mask > 0])) if np.count_nonzero(rc_mask) > 10 else float(np.mean(rc_val))
    cheek_brightness = (lc_brightness + rc_brightness) / 2.0
    brightness_difference = forehead_brightness - cheek_brightness
    forehead_saturation = float(np.mean(fh_sat[fh_mask > 0])) if np.count_nonzero(fh_mask) > 10 else float(np.mean(fh_sat))

    # Specular shine: physical reflection glint (high intensity + low saturation in forehead)
    v_p85 = np.percentile(fh_val, 85)
    specular_pixels = np.count_nonzero((fh_val >= max(195.0, float(v_p85))) & (fh_sat < 65.0))
    shiny_percentage = (specular_pixels / float(max(1, fh_val.size))) * 100.0
    oiliness_score = float(np.clip(shiny_percentage * 2.5, 0.0, 100.0))

    if oiliness_score < 25.0:
        oiliness_level = "Low"
    elif oiliness_score < 55.0:
        oiliness_level = "Moderate"
    else:
        oiliness_level = "High"

    # =====================================================
    # 5. NOISE-RESISTANT TEXTURE & PORE ANALYSIS
    # =====================================================
    def analyze_texture_robust(bgr_region, mask):
        gray = cv2.cvtColor(bgr_region, cv2.COLOR_BGR2GRAY)
        k_pore = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        top_hat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, k_pore)
        black_hat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, k_pore)
        morph_relief = cv2.add(top_hat, black_hat)
        if np.count_nonzero(mask) > 20:
            valid_relief = morph_relief[mask > 0]
        else:
            valid_relief = morph_relief
        return float(np.std(valid_relief) * 3.5)

    left_texture = analyze_texture_robust(left_cheek, lc_mask)
    right_texture = analyze_texture_robust(right_cheek, rc_mask)
    texture_score = float(np.clip((left_texture + right_texture) / 2.0, 0.0, 100.0))

    if texture_score < 20.0:
        texture_level = "Smooth"
    elif texture_score < 50.0:
        texture_level = "Medium Detail"
    else:
        texture_level = "High Detail"

    # =====================================================
    # 6. RELATIVE SKIN REDNESS / ERYTHEMA ANALYSIS
    # =====================================================
    # Measure cheek redness relative to forehead (neutral dermatological reference) in LAB color space
    lab_lc = cv2.cvtColor(left_cheek, cv2.COLOR_BGR2LAB)
    lab_rc = cv2.cvtColor(right_cheek, cv2.COLOR_BGR2LAB)
    lab_fh = cv2.cvtColor(forehead, cv2.COLOR_BGR2LAB)

    ref_a = float(np.median(lab_fh[:, :, 1]))
    cheek_a = (float(np.mean(lab_lc[:, :, 1])) + float(np.mean(lab_rc[:, :, 1]))) / 2.0
    left_redness_delta = max(0.0, float(np.mean(lab_lc[:, :, 1])) - ref_a)
    right_redness_delta = max(0.0, float(np.mean(lab_rc[:, :, 1])) - ref_a)
    avg_redness_delta = max(0.0, cheek_a - ref_a)

    redness_score = float(np.clip(avg_redness_delta * 4.0, 0.0, 100.0))

    if redness_score < 20.0:
        redness_level = "Low"
    elif redness_score < 45.0:
        redness_level = "Moderate"
    else:
        redness_level = "High"

    # =====================================================
    # 7. RELATIVE PIGMENTATION & TONE UNEVENNESS
    # =====================================================
    l_lc = lab_lc[:, :, 0].astype(np.float32)
    l_rc = lab_rc[:, :, 0].astype(np.float32)
    blur_l = cv2.GaussianBlur(l_lc, (15, 15), 0)
    dark_diff_l = np.maximum(0.0, blur_l - l_lc)
    blur_r = cv2.GaussianBlur(l_rc, (15, 15), 0)
    dark_diff_r = np.maximum(0.0, blur_r - l_rc)

    tone_variation = (float(np.std(dark_diff_l)) + float(np.std(dark_diff_r))) / 2.0
    dark_mean = (float(np.mean(dark_diff_l)) + float(np.mean(dark_diff_r))) / 2.0
    pigmentation_score = float(np.clip(tone_variation * 4.0 + dark_mean * 1.5, 0.0, 100.0))
    pigmentation_percentage = min(100.0, dark_mean * 8.0)

    if pigmentation_score < 22.0:
        pigmentation_level = "Low"
    elif pigmentation_score < 48.0:
        pigmentation_level = "Moderate"
    else:
        pigmentation_level = "High"

    # =====================================================
    # 8. DRYNESS ANALYSIS
    # =====================================================
    dryness_score = float(np.clip((texture_score * 0.4) + (max(0.0, 50.0 - oiliness_score) * 0.5), 0.0, 100.0))

    if dryness_score < 25.0:
        dryness_level = "Low"
    elif dryness_score < 50.0:
        dryness_level = "Moderate"
    else:
        dryness_level = "High"

    # =====================================================
    # 9. ROBUST CONTINUOUS SKIN TYPE CLASSIFICATION
    # =====================================================
    if oiliness_score >= 45.0 and dryness_score < 30.0:
        skin_type = "Oily"
    elif dryness_score >= 40.0 and oiliness_score < 25.0:
        skin_type = "Dry"
    elif (oiliness_score >= 30.0 and dryness_score >= 25.0) or (brightness_difference > 15.0 and oiliness_score > 25.0):
        skin_type = "Combination"
    else:
        skin_type = "Normal"

    # =====================================================
    # 10. CONTINUOUS SCIENTIFIC BIOMETRIC HEALTH SCORING
    # =====================================================
    # Deductions are continuously proportional to real measured pixel values
    oil_deduction = max(0.0, (oiliness_score - 20.0) * 0.14) if oiliness_score > 20.0 else 0.0
    dry_deduction = max(0.0, (dryness_score - 25.0) * 0.14) if dryness_score > 25.0 else 0.0
    red_deduction = max(0.0, (redness_score - 15.0) * 0.18) if redness_score > 15.0 else 0.0
    pig_deduction = max(0.0, (pigmentation_score - 15.0) * 0.15) if pigmentation_score > 15.0 else 0.0
    tex_deduction = max(0.0, (texture_score - 20.0) * 0.12) if texture_score > 20.0 else 0.0

    total_deductions = oil_deduction + dry_deduction + red_deduction + pig_deduction + tex_deduction
    overall_score = float(max(50.0, min(98.5, round(100.0 - total_deductions, 1))))

    # Clinical condition assignment
    if clinical_condition and len(clinical_condition.strip()) > 3:
        overall_condition = clinical_condition.strip()
    elif redness_level == "High":
        overall_condition = "Sensitive & Redness Prone"
    elif oiliness_level == "High" and texture_level == "High Detail":
        overall_condition = "Congested Pores & Sebum Excess"
    elif oiliness_level == "High":
        overall_condition = "Excess Sebum & Shine"
    elif dryness_level == "High":
        overall_condition = "Dehydrated Skin Barrier"
    elif pigmentation_level == "High":
        overall_condition = "Uneven Tone & Dark Spots"
    elif skin_type == "Combination":
        overall_condition = "Combination T-Zone"
    else:
        overall_condition = "Healthy & Balanced"

    # =====================================================
    # 12. GENERATE DERMATOLOGICAL SKINCARE PLAN
    # =====================================================
    skincare_plan = get_recommendations(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    return {
        "success": True,
        "message": "Skin features analyzed successfully.",
        "face_detected": True,
        "engine": engine_used,

        # Crops & File Paths
        "cropped_face": os.path.basename(face_crop_path),
        "forehead": os.path.basename(forehead_crop_path),
        "left_cheek": os.path.basename(left_cheek_crop_path),
        "right_cheek": os.path.basename(right_cheek_crop_path),
        "face_crop_full_path": face_crop_path,
        "forehead_crop_full_path": forehead_crop_path,
        "left_cheek_crop_full_path": left_cheek_crop_path,
        "right_cheek_crop_full_path": right_cheek_crop_path,

        # Key Headline Metrics
        "skin_type": skin_type,
        "overall_score": overall_score,
        "overall_condition": overall_condition,

        # Illumination & Sebum
        "forehead_brightness": round(float(forehead_brightness), 2),
        "cheek_brightness": round(float(cheek_brightness), 2),
        "brightness_difference": round(float(brightness_difference), 2),
        "forehead_saturation": round(float(forehead_saturation), 2),
        "shiny_percentage": round(float(shiny_percentage), 2),
        "oiliness_score": round(float(oiliness_score), 2),
        "oiliness_level": oiliness_level,

        # Texture & Micro-Relief
        "left_texture": round(float(left_texture), 2),
        "right_texture": round(float(right_texture), 2),
        "texture_score": round(float(texture_score), 2),
        "texture_level": texture_level,

        # Hydration / Dryness
        "dryness_score": round(float(dryness_score), 2),
        "dryness_level": dryness_level,

        # Erythema / Redness
        "left_redness": round(float(left_redness_delta), 2),
        "right_redness": round(float(right_redness_delta), 2),
        "redness_score": round(float(redness_score), 2),
        "redness_level": redness_level,

        # Hyperpigmentation & Evenness
        "pigmentation_percentage": round(float(pigmentation_percentage), 2),
        "tone_variation": round(float(tone_variation), 2),
        "pigmentation_score": round(float(pigmentation_score), 2),
        "pigmentation_level": pigmentation_level,

        # Tailored Routines & Clinical Advice
        "recommendations": skincare_plan.get("recommendations", []),
        "recommended_ingredients": skincare_plan.get("recommended_ingredients", []),
        "product_recommendations": skincare_plan.get("product_recommendations", []),
        "things_to_avoid": skincare_plan.get("things_to_avoid", []),
        "morning_routine": skincare_plan.get("morning_routine", []),
        "night_routine": skincare_plan.get("night_routine", []),
        "possible_causes": skincare_plan.get("possible_causes", []),
        "lifestyle_suggestions": skincare_plan.get("lifestyle_suggestions", [])
    }
