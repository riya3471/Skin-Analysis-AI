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
    Applies Gray-World color constancy to eliminate ambient color casts
    (e.g., warm tungsten lighting or blue daylight casts) using skin or whole frame.
    """
    img_float = bgr_image.astype(np.float32)
    if skin_mask is not None and np.count_nonzero(skin_mask) > 100:
        b_mean = np.mean(img_float[:, :, 0][skin_mask > 0])
        g_mean = np.mean(img_float[:, :, 1][skin_mask > 0])
        r_mean = np.mean(img_float[:, :, 2][skin_mask > 0])
    else:
        b_mean = np.mean(img_float[:, :, 0])
        g_mean = np.mean(img_float[:, :, 1])
        r_mean = np.mean(img_float[:, :, 2])

    gray_target = (b_mean + g_mean + r_mean) / 3.0
    if b_mean < 1e-3 or g_mean < 1e-3 or r_mean < 1e-3:
        return bgr_image

    kb = gray_target / b_mean
    kg = gray_target / g_mean
    kr = gray_target / r_mean

    # Dampen extreme scaling factors to avoid over-amplification
    kb = np.clip(kb, 0.65, 1.45)
    kg = np.clip(kg, 0.65, 1.45)
    kr = np.clip(kr, 0.65, 1.45)

    img_float[:, :, 0] = np.clip(img_float[:, :, 0] * kb, 0, 255)
    img_float[:, :, 1] = np.clip(img_float[:, :, 1] * kg, 0, 255)
    img_float[:, :, 2] = np.clip(img_float[:, :, 2] * kr, 0, 255)

    return img_float.astype(np.uint8)


def get_skin_mask(bgr_image):
    """
    Extracts a robust skin mask combining YCrCb and HSV color spaces.
    Discards hair, background, eyes, nostrils, and clothing.
    """
    ycrcb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2YCrCb)
    mask_ycrcb = cv2.inRange(
        ycrcb,
        np.array([0, 133, 77], dtype=np.uint8),
        np.array([255, 175, 128], dtype=np.uint8)
    )

    hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
    mask_hsv = cv2.inRange(
        hsv,
        np.array([0, 20, 40], dtype=np.uint8),
        np.array([28, 240, 255], dtype=np.uint8)
    )

    combined = cv2.bitwise_and(mask_ycrcb, mask_hsv)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    combined = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel, iterations=1)
    combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=1)
    return combined


# =====================================================================
# 2. GEMINI MULTIMODAL VISION HELPER (OPTIONAL HYBRID ENGINE)
# =====================================================================

def analyze_with_gemini_vision(image_path):
    """
    Uses Google Gemini Vision API via direct REST endpoint if GEMINI_API_KEY is configured.
    Provides context-aware dermatological biomarker assessment.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        with open(image_path, "rb") as img_file:
            base64_data = base64.b64encode(img_file.read()).decode("utf-8")

        prompt = (
            "You are an expert dermatological AI. Carefully inspect this front-facing facial skin portrait. "
            "Analyze the skin type and biomarkers, compensating for ambient room lighting, shadows, and camera noise. "
            "Return strictly a JSON object with this exact structure (no markdown fences, just JSON):\n"
            "{\n"
            '  "skin_type": "Oily" | "Dry" | "Combination" | "Normal",\n'
            '  "oiliness_score": <number 0-100>,\n'
            '  "oiliness_level": "Low" | "Moderate" | "High",\n'
            '  "dryness_score": <number 0-100>,\n'
            '  "dryness_level": "Low" | "Moderate" | "High",\n'
            '  "texture_score": <number 0-100>,\n'
            '  "texture_level": "Smooth" | "Medium Detail" | "High Detail",\n'
            '  "redness_score": <number 0-100>,\n'
            '  "redness_level": "Low" | "Moderate" | "High",\n'
            '  "pigmentation_score": <number 0-100>,\n'
            '  "pigmentation_level": "Low" | "Moderate" | "High",\n'
            '  "overall_condition": "<Short 3-5 word clinical description>",\n'
            '  "overall_score": <number 50-100>\n'
            "}"
        )

        models_to_try = [
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-flash-latest"
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
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
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
                    # Strip any markdown code fences if model returned them
                    if candidate_text.startswith("```"):
                        candidate_text = candidate_text.split("\n", 1)[1]
                        if candidate_text.endswith("```"):
                            candidate_text = candidate_text.rsplit("```", 1)[0]
                        candidate_text = candidate_text.strip()
                    gemini_data = json.loads(candidate_text)
                    print(f"Skin Analysis AI: Successfully received multimodal assessment from {model_name}.")
                    return gemini_data
            except urllib.error.HTTPError as he:
                print(f"Gemini API model {model_name} HTTP {he.code}: {he.reason}")
                continue
            except Exception as ex:
                print(f"Gemini API model {model_name} attempt note: {ex}")
                continue

        return None

    except Exception as e:
        print(f"Gemini Vision API Note: {e}. Gracefully continuing with enhanced CV pipeline.")
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
    # FACE DETECTION & BOUNDING BOX REFINEMENT
    # =====================================================
    face_box = None

    if hasattr(cv2, "CascadeClassifier"):
        try:
            cascade_file = "haarcascade_frontalface_default.xml"
            if hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
                cascade_file = os.path.join(cv2.data.haarcascades, cascade_file)
            face_cascade = cv2.CascadeClassifier(cascade_file)
            faces = face_cascade.detectMultiScale(
                gray_full,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(int(w_img * 0.15), int(h_img * 0.15))
            )
            if len(faces) > 0:
                face_box = max(faces, key=lambda b: b[2] * b[3])
        except Exception:
            pass

    if face_box is None:
        try:
            ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
            skin_mask = cv2.inRange(
                ycrcb,
                np.array([0, 133, 77], dtype=np.uint8),
                np.array([255, 173, 127], dtype=np.uint8)
            )
            contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            valid_candidates = []
            for c in contours:
                area = cv2.contourArea(c)
                if area > (h_img * w_img * 0.06):
                    bx, by, bw, bh = cv2.boundingRect(c)
                    aspect = bh / max(1, bw)
                    if 0.6 <= aspect <= 1.9:
                        valid_candidates.append((bx, by, bw, bh, area))
            if valid_candidates:
                valid_candidates.sort(key=lambda x: x[4], reverse=True)
                face_box = valid_candidates[0][:4]
        except Exception:
            pass

    if face_box is None:
        return {
            "success": False,
            "message": "No face detected in the frame. Please look directly at the camera with your face clearly centered."
        }

    x, y, w, h = face_box
    face_raw = image[y:y + h, x:x + w]
    face_h, face_w = face_raw.shape[:2]

    # Verify skin tone presence
    face_skin_mask = get_skin_mask(face_raw)
    skin_ratio = float(np.count_nonzero(face_skin_mask)) / float(max(1, face_w * face_h))
    if skin_ratio < 0.12:
        return {
            "success": False,
            "message": "No skin tones detected in the face frame. Please ensure your face is clearly visible."
        }

    # =====================================================
    # COLOR CONSTANCY & ILLUMINATION NORMALIZATION
    # =====================================================
    # Normalize color temperature across the face to eliminate room lighting cast
    face_normalized = apply_gray_world_white_balance(face_raw, face_skin_mask)

    # Save visual crop images for frontend UI display
    face_crop_path = os.path.join(output_dir, "cropped_face.jpg")
    cv2.imwrite(face_crop_path, face_raw)

    # =====================================================
    # PRECISE INNER-MALAR & T-ZONE REGIONS (Avoids Hair & Edges)
    # =====================================================
    # Forehead: Central upper region (avoids hairline and eyebrows)
    fh_y1, fh_y2 = int(face_h * 0.10), int(face_h * 0.28)
    fh_x1, fh_x2 = int(face_w * 0.28), int(face_w * 0.72)

    # Left Malar Cheek (avoids hair, ears, nose, and eyes)
    lc_y1, lc_y2 = int(face_h * 0.44), int(face_h * 0.70)
    lc_x1, lc_x2 = int(face_w * 0.16), int(face_w * 0.40)

    # Right Malar Cheek (avoids hair, ears, nose, and eyes)
    rc_y1, rc_y2 = int(face_h * 0.44), int(face_h * 0.70)
    rc_x1, rc_x2 = int(face_w * 0.60), int(face_w * 0.84)

    # Neutral Baseline Region (lower mid-face / chin boundary)
    base_y1, base_y2 = int(face_h * 0.74), int(face_h * 0.88)
    base_x1, base_x2 = int(face_w * 0.35), int(face_w * 0.65)

    forehead = face_normalized[fh_y1:fh_y2, fh_x1:fh_x2]
    left_cheek = face_normalized[lc_y1:lc_y2, lc_x1:lc_x2]
    right_cheek = face_normalized[rc_y1:rc_y2, rc_x1:rc_x2]
    baseline_region = face_normalized[base_y1:base_y2, base_x1:base_x2]

    # Save region crops for frontend inspection tabs
    forehead_crop_path = os.path.join(output_dir, "forehead.jpg")
    left_cheek_crop_path = os.path.join(output_dir, "left_cheek.jpg")
    right_cheek_crop_path = os.path.join(output_dir, "right_cheek.jpg")

    cv2.imwrite(forehead_crop_path, face_raw[fh_y1:fh_y2, fh_x1:fh_x2])
    cv2.imwrite(left_cheek_crop_path, face_raw[lc_y1:lc_y2, lc_x1:lc_x2])
    cv2.imwrite(right_cheek_crop_path, face_raw[rc_y1:rc_y2, rc_x1:rc_x2])

    # Extract skin masks for each region
    fh_mask = get_skin_mask(forehead)
    lc_mask = get_skin_mask(left_cheek)
    rc_mask = get_skin_mask(right_cheek)
    base_mask = get_skin_mask(baseline_region)

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

    # Specular shine detection: Localized high-intensity with desaturation relative to region mean
    p85_bright = np.percentile(fh_val[fh_mask > 0] if np.count_nonzero(fh_mask) > 10 else fh_val, 85)
    specular_thresh = max(195.0, float(p85_bright))
    shiny_mask = (fh_val >= specular_thresh) & (fh_sat < 70.0)
    if np.count_nonzero(fh_mask) > 10:
        shiny_mask = shiny_mask & (fh_mask > 0)
        shiny_pixels = np.count_nonzero(shiny_mask)
        total_valid = np.count_nonzero(fh_mask)
    else:
        shiny_pixels = np.count_nonzero(shiny_mask)
        total_valid = max(1, shiny_mask.size)

    shiny_percentage = (shiny_pixels / float(total_valid)) * 100.0

    # Calibrated continuous oiliness score (0-100)
    oiliness_raw = (shiny_percentage * 3.2) + max(0.0, brightness_difference * 0.4)
    oiliness_score = float(np.clip(oiliness_raw, 0.0, 100.0))

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
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(6, 6))
        enhanced = clahe.apply(gray)

        # Morphological Top-Hat and Black-Hat to isolate pores/micro-relief without camera noise
        kernel_pore = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        top_hat = cv2.morphologyEx(enhanced, cv2.MORPH_TOPHAT, kernel_pore)
        black_hat = cv2.morphologyEx(enhanced, cv2.MORPH_BLACKHAT, kernel_pore)
        morph_relief = cv2.add(top_hat, black_hat)

        if np.count_nonzero(mask) > 20:
            valid_relief = morph_relief[mask > 0]
            texture_metric = float(np.std(valid_relief) * 2.8 + np.mean(valid_relief) * 1.5)
        else:
            texture_metric = float(np.std(morph_relief) * 2.8 + np.mean(morph_relief) * 1.5)
        return texture_metric

    left_texture = analyze_texture_robust(left_cheek, lc_mask)
    right_texture = analyze_texture_robust(right_cheek, rc_mask)
    texture_score_raw = (left_texture + right_texture) / 2.0
    texture_score = float(np.clip(texture_score_raw * 2.2, 0.0, 100.0))

    if texture_score < 30.0:
        texture_level = "Smooth"
    elif texture_score < 60.0:
        texture_level = "Medium Detail"
    else:
        texture_level = "High Detail"

    # =====================================================
    # 6. RELATIVE SKIN REDNESS / ERYTHEMA ANALYSIS
    # =====================================================
    # Convert to LAB. The 'a' channel measures green (-128) to red (+127).
    # Measure cheek redness relative to user's individual baseline skin tone.
    def get_lab_skin_stats(bgr_region, mask):
        lab = cv2.cvtColor(bgr_region, cv2.COLOR_BGR2LAB)
        l_chan = lab[:, :, 0].astype(np.float32)
        a_chan = lab[:, :, 1].astype(np.float32)
        if np.count_nonzero(mask) > 20:
            valid_l = l_chan[mask > 0]
            valid_a = a_chan[mask > 0]
        else:
            valid_l = l_chan.flatten()
            valid_a = a_chan.flatten()
        return np.mean(valid_l), np.mean(valid_a), np.std(valid_l), np.std(valid_a)

    base_l, base_a, _, _ = get_lab_skin_stats(baseline_region, base_mask)
    lc_l, lc_a, lc_l_std, _ = get_lab_skin_stats(left_cheek, lc_mask)
    rc_l, rc_a, rc_l_std, _ = get_lab_skin_stats(right_cheek, rc_mask)

    # Relative delta a* (cheek erythema relative to baseline)
    left_redness_delta = max(0.0, float(lc_a - base_a))
    right_redness_delta = max(0.0, float(rc_a - base_a))
    avg_redness_delta = (left_redness_delta + right_redness_delta) / 2.0

    # Red pixel percentage where a* exceeds baseline + 6.0
    lab_lc = cv2.cvtColor(left_cheek, cv2.COLOR_BGR2LAB)[:, :, 1].astype(np.float32)
    lab_rc = cv2.cvtColor(right_cheek, cv2.COLOR_BGR2LAB)[:, :, 1].astype(np.float32)
    lc_red_mask = (lab_lc > (base_a + 5.0)) & (lc_mask > 0 if np.count_nonzero(lc_mask) > 10 else True)
    rc_red_mask = (lab_rc > (base_a + 5.0)) & (rc_mask > 0 if np.count_nonzero(rc_mask) > 10 else True)

    red_ratio_l = (np.count_nonzero(lc_red_mask) / float(max(1, np.count_nonzero(lc_mask)))) * 100.0
    red_ratio_r = (np.count_nonzero(rc_red_mask) / float(max(1, np.count_nonzero(rc_mask)))) * 100.0
    redness_percentage = (red_ratio_l + red_ratio_r) / 2.0

    redness_score = float(np.clip((avg_redness_delta * 7.5) + (redness_percentage * 0.45), 0.0, 100.0))

    if redness_score < 28.0:
        redness_level = "Low"
    elif redness_score < 58.0:
        redness_level = "Moderate"
    else:
        redness_level = "High"

    # =====================================================
    # 7. RELATIVE PIGMENTATION & TONE UNEVENNESS
    # =====================================================
    # Local dark spots: areas significantly darker than local average lightness L*
    def calculate_pigmentation_robust(bgr_region, mask):
        lab = cv2.cvtColor(bgr_region, cv2.COLOR_BGR2LAB)
        lightness = lab[:, :, 0].astype(np.float32)
        local_avg = cv2.GaussianBlur(lightness, (15, 15), 0)
        darker_diff = np.maximum(0.0, local_avg - lightness)

        # Threshold for true hyperpigmented macules
        dark_mask = (darker_diff > 8.0)
        if np.count_nonzero(mask) > 20:
            dark_mask = dark_mask & (mask > 0)
            dark_pct = (np.count_nonzero(dark_mask) / float(np.count_nonzero(mask))) * 100.0
            tone_var = float(np.std(darker_diff[mask > 0]))
        else:
            dark_pct = (np.count_nonzero(dark_mask) / float(max(1, dark_mask.size))) * 100.0
            tone_var = float(np.std(darker_diff))
        return dark_pct, tone_var

    left_dark_pct, left_tone_var = calculate_pigmentation_robust(left_cheek, lc_mask)
    right_dark_pct, right_tone_var = calculate_pigmentation_robust(right_cheek, rc_mask)

    pigmentation_percentage = (left_dark_pct + right_dark_pct) / 2.0
    tone_variation = (left_tone_var + right_tone_var) / 2.0
    pigmentation_score = float(np.clip((pigmentation_percentage * 2.4) + (tone_variation * 4.5), 0.0, 100.0))

    if pigmentation_score < 28.0:
        pigmentation_level = "Low"
    elif pigmentation_score < 58.0:
        pigmentation_level = "Moderate"
    else:
        pigmentation_level = "High"

    # =====================================================
    # 8. DRYNESS ANALYSIS
    # =====================================================
    # Dryness correlates with lack of hydration/shine in cheeks combined with micro-flaking relief
    cheek_shine_deficit = max(0.0, 100.0 - (oiliness_score * 1.6))
    dryness_score = float(np.clip((texture_score * 0.4) + (cheek_shine_deficit * 0.35), 0.0, 100.0))

    if dryness_score < 30.0:
        dryness_level = "Low"
    elif dryness_score < 60.0:
        dryness_level = "Moderate"
    else:
        dryness_level = "High"

    # =====================================================
    # 9. ROBUST CONTINUOUS SKIN TYPE CLASSIFICATION
    # =====================================================
    if oiliness_score >= 50.0 and dryness_score < 35.0:
        skin_type = "Oily"
    elif dryness_score >= 50.0 and oiliness_score < 35.0:
        skin_type = "Dry"
    elif (oiliness_score >= 35.0 and dryness_score >= 35.0) or (brightness_difference > 18.0 and oiliness_score > 30.0):
        skin_type = "Combination"
    else:
        skin_type = "Normal"

    # =====================================================
    # 10. OVERALL HEALTH SCORE & CLINICAL CONDITION
    # =====================================================
    deductions = 0.0
    if oiliness_level == "High":
        deductions += 9.0
    elif oiliness_level == "Moderate":
        deductions += 3.5

    if dryness_level == "High":
        deductions += 10.0
    elif dryness_level == "Moderate":
        deductions += 4.0

    if redness_level == "High":
        deductions += 12.0
    elif redness_level == "Moderate":
        deductions += 5.0

    if pigmentation_level == "High":
        deductions += 10.0
    elif pigmentation_level == "Moderate":
        deductions += 4.5

    if texture_level == "High Detail":
        deductions += 7.0
    elif texture_level == "Medium Detail":
        deductions += 2.5

    overall_score = float(max(55.0, min(98.5, round(100.0 - deductions, 1))))

    if redness_level == "High":
        overall_condition = "Sensitive & Redness Prone"
    elif oiliness_level == "High" and texture_level == "High Detail":
        overall_condition = "Mild Acne & Congested Pores"
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
    # 11. CHECK GEMINI MULTIMODAL VISION HYBRID ENHANCEMENT
    # =====================================================
    gemini_result = analyze_with_gemini_vision(image_path)
    if gemini_result:
        try:
            # Safely incorporate Gemini insights with high stability
            if "skin_type" in gemini_result and gemini_result["skin_type"] in ["Oily", "Dry", "Combination", "Normal"]:
                skin_type = gemini_result["skin_type"]
            if "overall_condition" in gemini_result and gemini_result["overall_condition"]:
                overall_condition = gemini_result["overall_condition"]
            if "overall_score" in gemini_result and isinstance(gemini_result["overall_score"], (int, float)):
                overall_score = float(round(gemini_result["overall_score"], 1))
            if "oiliness_level" in gemini_result:
                oiliness_level = gemini_result["oiliness_level"]
            if "dryness_level" in gemini_result:
                dryness_level = gemini_result["dryness_level"]
            if "redness_level" in gemini_result:
                redness_level = gemini_result["redness_level"]
            if "pigmentation_level" in gemini_result:
                pigmentation_level = gemini_result["pigmentation_level"]
            if "texture_level" in gemini_result:
                texture_level = gemini_result["texture_level"]
        except Exception as e:
            print(f"Gemini consensus parsing note: {e}")

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
