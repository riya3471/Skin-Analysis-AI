import cv2
import os
import numpy as np
from models.recommendations import get_recommendations

def analyze_skin_image(image_path, output_dir=None):

    # =====================================================
    # 1. LOAD IMAGE
    # =====================================================

    if not os.path.exists(image_path):
        return {
            "success": False,
            "message": "Image not found."
        }

    image = cv2.imread(image_path)

    if image is None:
        return {
            "success": False,
            "message": "Unable to read image."
        }

    # Prepare output directory for crops
    if output_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_dir = os.path.join(base_dir, "static", "uploads", "crops")
    os.makedirs(output_dir, exist_ok=True)

    # =====================================================
    # 2. IMAGE QUALITY & DARKNESS/BLANK VALIDATION
    # =====================================================

    h_img, w_img = image.shape[:2]
    if h_img < 50 or w_img < 50:
        return {
            "success": False,
            "message": "Image resolution is too low for skin analysis."
        }

    gray_full = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean_brightness = float(np.mean(gray_full))
    std_contrast = float(np.std(gray_full))

    # Check if camera is covered or image is too dark (e.g., covered with finger/black)
    if mean_brightness < 28:
        return {
            "success": False,
            "message": "Image is too dark or the camera is covered. Please ensure good lighting and uncover the lens."
        }

    # Check if image is overexposed or solid color/blank
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
    # 3. FACE DETECTION & VALIDATION
    # =====================================================

    face_box = None

    # Tier 1: Try Haar CascadeClassifier if supported by OpenCV build
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
                # Pick the largest detected face box
                face_box = max(faces, key=lambda b: b[2] * b[3])
        except Exception:
            pass

    # Tier 2: Skin tone & morphological saliency detection
    if face_box is None:
        try:
            ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
            skin_mask = cv2.inRange(ycrcb, np.array([0, 133, 77], dtype=np.uint8), np.array([255, 173, 127], dtype=np.uint8))
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
                bx, by, bw, bh, _ = valid_candidates[0]
                face_box = (bx, by, bw, bh)
        except Exception:
            pass

    # If no face detected, reject scan
    if face_box is None:
        return {
            "success": False,
            "message": "No face detected in the frame. Please look directly at the camera with your face clearly centered."
        }

    x, y, w, h = face_box
    face = image[y:y + h, x:x + w]

    # Verify skin tone presence inside the cropped face
    face_ycrcb = cv2.cvtColor(face, cv2.COLOR_BGR2YCrCb)
    face_skin_mask = cv2.inRange(face_ycrcb, np.array([0, 133, 77], dtype=np.uint8), np.array([255, 173, 127], dtype=np.uint8))
    skin_pixel_ratio = float(np.count_nonzero(face_skin_mask)) / float(max(1, w * h))

    if skin_pixel_ratio < 0.15:
        return {
            "success": False,
            "message": "No skin tones detected in the face frame. Please ensure your face is clearly visible."
        }

    face_crop_path = os.path.join(output_dir, "cropped_face.jpg")
    cv2.imwrite(face_crop_path, face)

    height, width = face.shape[:2]

    # =====================================================
    # 3. EXTRACT FACE REGIONS
    # =====================================================

    forehead = face[
        0:int(height * 0.30),
        int(width * 0.25):int(width * 0.75)
    ]

    left_cheek = face[
        int(height * 0.35):int(height * 0.75),
        0:int(width * 0.40)
    ]

    right_cheek = face[
        int(height * 0.35):int(height * 0.75),
        int(width * 0.60):width
    ]

    forehead_crop_path = os.path.join(output_dir, "forehead.jpg")
    left_cheek_crop_path = os.path.join(output_dir, "left_cheek.jpg")
    right_cheek_crop_path = os.path.join(output_dir, "right_cheek.jpg")

    cv2.imwrite(forehead_crop_path, forehead)
    cv2.imwrite(left_cheek_crop_path, left_cheek)
    cv2.imwrite(right_cheek_crop_path, right_cheek)

    # =====================================================
    # 4. HSV CONVERSION
    # =====================================================

    forehead_hsv = cv2.cvtColor(
        forehead,
        cv2.COLOR_BGR2HSV
    )

    left_cheek_hsv = cv2.cvtColor(
        left_cheek,
        cv2.COLOR_BGR2HSV
    )

    right_cheek_hsv = cv2.cvtColor(
        right_cheek,
        cv2.COLOR_BGR2HSV
    )

    # =====================================================
    # 5. BRIGHTNESS
    # =====================================================

    forehead_brightness = np.mean(
        forehead_hsv[:, :, 2]
    )

    left_cheek_brightness = np.mean(
        left_cheek_hsv[:, :, 2]
    )

    right_cheek_brightness = np.mean(
        right_cheek_hsv[:, :, 2]
    )

    cheek_brightness = (
        left_cheek_brightness +
        right_cheek_brightness
    ) / 2

    brightness_difference = (
        forehead_brightness -
        cheek_brightness
    )

        # =====================================================
    # 6. OILINESS / SHINE - IMPROVED
    # =====================================================

    forehead_saturation = np.mean(
        forehead_hsv[:, :, 1]
    )

    saturation = forehead_hsv[:, :, 1].astype(
        np.float32
    )

    brightness = forehead_hsv[:, :, 2].astype(
        np.float32
    )

    # -----------------------------------------------------
    # Detect strong specular highlights
    # -----------------------------------------------------
    # Oily shine generally appears as locally bright
    # areas with relatively low colour saturation.

    brightness_threshold = max(
        210,
        np.percentile(brightness, 80)
    )

    shiny_mask = (
        (brightness >= brightness_threshold) &
        (saturation < 65)
    )

    shiny_pixels = np.count_nonzero(
        shiny_mask
    )

    total_pixels = shiny_mask.size

    shiny_percentage = (
        shiny_pixels /
        total_pixels
    ) * 100


    # -----------------------------------------------------
    # BRIGHTNESS DIFFERENCE
    # -----------------------------------------------------

    # Forehead being brighter than cheeks can support
    # the shine estimate, but lighting can also cause it.
    # Therefore its influence is limited.

    brightness_component = max(
        0,
        min(30, brightness_difference)
    )


    # -----------------------------------------------------
    # OILINESS SCORE
    # -----------------------------------------------------

    # Give more importance to localized shiny pixels
    # and less importance to general brightness.

    oiliness_score = (
        shiny_percentage * 1.5 +
        brightness_component * 0.5
    )

    oiliness_score = max(
        0,
        min(100, oiliness_score)
    )


    # -----------------------------------------------------
    # OILINESS CLASSIFICATION
    # -----------------------------------------------------
    if oiliness_score < 10:
        oiliness_level = "Low"

    elif oiliness_score < 22:
        oiliness_level = "Moderate"

    else:
        oiliness_level = "High"
    
    # =====================================================
    # 7. TEXTURE ANALYSIS
    # =====================================================

    left_cheek_gray = cv2.cvtColor(
        left_cheek,
        cv2.COLOR_BGR2GRAY
    )

    right_cheek_gray = cv2.cvtColor(
        right_cheek,
        cv2.COLOR_BGR2GRAY
    )

    left_blurred = cv2.GaussianBlur(
        left_cheek_gray,
        (3, 3),
        0
    )

    right_blurred = cv2.GaussianBlur(
        right_cheek_gray,
        (3, 3),
        0
    )

    left_laplacian = cv2.Laplacian(
        left_blurred,
        cv2.CV_64F
    )

    right_laplacian = cv2.Laplacian(
        right_blurred,
        cv2.CV_64F
    )

    left_texture = left_laplacian.var()
    right_texture = right_laplacian.var()

    texture_score = (
        left_texture +
        right_texture
    ) / 2

    if texture_score < 120:
        texture_level = "Low Detail"

    elif texture_score < 260:
        texture_level = "Medium Detail"

    else:
        texture_level = "High Detail"

    # =====================================================
    # 8. DRYNESS ANALYSIS
    # =====================================================

    texture_component = min(
        100,
        texture_score
    )

    low_shine_component = max(
        0,
        100 - (shiny_percentage * 10)
    )

    dryness_score = (
        texture_component * 0.5 +
        low_shine_component * 0.5
    )

    dryness_score = max(
        0,
        min(100, dryness_score)
    )

    if dryness_score <40:
        dryness_level = "Low"

    elif dryness_score < 70:
        dryness_level = "Moderate"

    else:
        dryness_level = "High"

        # =====================================================
    # 9. REDNESS ANALYSIS - IMPROVED
    # =====================================================

    def calculate_redness(region):

        # Convert BGR image to LAB colour space.
        # LAB 'a' channel represents the green-red axis.
        lab = cv2.cvtColor(
            region,
            cv2.COLOR_BGR2LAB
        )

        a_channel = lab[:, :, 1].astype(
            np.float32
        )

        # OpenCV LAB neutral value is around 128.
        # Values above 128 indicate increasing redness.
        red_excess = a_channel - 128

        # Ignore negative values.
        red_excess = np.maximum(
            red_excess,
            0
        )

        # Average red tendency of the cheek.
        average_redness = np.mean(
            red_excess
        )

        # Percentage of pixels showing stronger redness.
        red_mask = red_excess > 12

        red_pixel_percentage = (
            np.count_nonzero(red_mask)
            / red_mask.size
        ) * 100

        return (
            average_redness,
            red_pixel_percentage
        )


    (
        left_redness,
        left_red_percentage
    ) = calculate_redness(
        left_cheek
    )

    (
        right_redness,
        right_red_percentage
    ) = calculate_redness(
        right_cheek
    )


    # Average both cheeks
    redness_raw = (
        left_redness +
        right_redness
    ) / 2


    redness_percentage = (
        left_red_percentage +
        right_red_percentage
    ) / 2


    # =====================================================
    # REDNESS SCORE
    # =====================================================

    # Combine:
    # 1. Strength of redness
    # 2. Percentage of visibly red pixels

    redness_score = (
        redness_raw * 2.5 +
        redness_percentage * 0.2
    )


    redness_score = max(
        0,
        min(100, redness_score)
    )


    # =====================================================
    # REDNESS CLASSIFICATION
    # =====================================================

    if redness_score < 20:

        redness_level = "Low"

    elif redness_score < 40:

        redness_level = "Moderate"

    else:

        redness_level = "High"

    # =====================================================
    # 10. PIGMENTATION / UNEVEN TONE ANALYSIS
    # =====================================================

    def calculate_pigmentation(region):

        # Convert cheek to LAB colour space
        lab = cv2.cvtColor(
            region,
            cv2.COLOR_BGR2LAB
        )

        # L channel = lightness
        lightness = lab[:, :, 0].astype(
            np.float32
        )

        # Calculate local average brightness
        local_average = cv2.GaussianBlur(
            lightness,
            (21, 21),
            0
        )

        # Find areas darker than surrounding skin
        darker_difference = (
            local_average -
            lightness
        )

        # Ignore very small differences
        dark_mask = (
            darker_difference > 12
        )

        dark_pixels = np.count_nonzero(
            dark_mask
        )

        total_pixels = dark_mask.size

        dark_percentage = (
            dark_pixels /
            total_pixels
        ) * 100

        # Measure unevenness of skin tone
        tone_variation = np.std(
            darker_difference
        )

        return (
            dark_percentage,
            tone_variation
        )


    (
        left_dark_percentage,
        left_tone_variation
    ) = calculate_pigmentation(
        left_cheek
    )

    (
        right_dark_percentage,
        right_tone_variation
    ) = calculate_pigmentation(
        right_cheek
    )

    pigmentation_percentage = (
        left_dark_percentage +
        right_dark_percentage
    ) / 2

    tone_variation = (
        left_tone_variation +
        right_tone_variation
    ) / 2

    pigmentation_score = (
        pigmentation_percentage * 2 +
        tone_variation * 1
    )

    pigmentation_score = max(
        0,
        min(100, pigmentation_score)
    )

    if pigmentation_score < 30:
        pigmentation_level = "Low"

    elif pigmentation_score < 60:
        pigmentation_level = "Moderate"

    else:
        pigmentation_level = "High"

    # ==========================================
    # 12. SKIN TYPE CLASSIFICATION
    # ==========================================

    if (
        oiliness_level == "High"
        and dryness_level == "Low"
    ):
        skin_type = "Oily"

    elif (
        dryness_level == "High"
        and oiliness_level == "Low"
    ):
        skin_type = "Dry"

    elif (
        oiliness_level in ["Moderate", "High"]
        and dryness_level in ["Moderate", "High"]
    ):
        skin_type = "Combination"

    else:
        skin_type = "Normal"
    

    
    # =====================================================
    # 13. GENERATE SKINCARE PLAN
    # =====================================================

    skincare_plan = get_recommendations(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    # =====================================================
    # 11. PRINT RESULTS
    # =====================================================

    print(
        "Forehead brightness:",
        round(forehead_brightness, 2)
    )

    print(
        "Average cheek brightness:",
        round(cheek_brightness, 2)
    )

    print(
        "Brightness difference:",
        round(brightness_difference, 2)
    )

    print(
        "Forehead saturation:",
        round(forehead_saturation, 2)
    )

    print(
        "Shiny pixels:",
        round(shiny_percentage, 2),
        "%"
    )

    print(
        "Oiliness indicator:",
        round(oiliness_score, 2)
    )

    print(
        "Oiliness level:",
        oiliness_level
    )

    print("-------------------------")

    print(
        "Left cheek texture:",
        round(left_texture, 2)
    )

    print(
        "Right cheek texture:",
        round(right_texture, 2)
    )

    print(
        "Texture score:",
        round(texture_score, 2)
    )

    print(
        "Texture level:",
        texture_level
    )

    print("-------------------------")

    print(
        "Dryness score:",
        round(dryness_score, 2)
    )

    print(
        "Dryness level:",
        dryness_level
    )

    print("-------------------------")

    print(
        "Left cheek redness:",
        round(left_redness, 2)
    )

    print(
        "Right cheek redness:",
        round(right_redness, 2)
    )

    print(
        "Redness score:",
        round(redness_score, 2)
    )

    print(
        "Redness level:",
        redness_level
    )

    print("-------------------------")

    print(
        "Pigmentation darker-area percentage:",
        round(pigmentation_percentage, 2),
        "%"
    )

    print(
        "Tone variation:",
        round(tone_variation, 2)
    )

    print(
        "Pigmentation score:",
        round(pigmentation_score, 2)
    )

    print(
        "Redness pixel percentage:",
        round(redness_percentage, 2),
        "%"
    )

    print(
        "Pigmentation level:",
        pigmentation_level
    )

    print("-------------------------")

    print(
        "Skin Type:",
        skin_type
    )

    # =====================================================
    # 12. CALCULATE OVERALL HEALTH SCORE & CONDITION
    # =====================================================

    deductions = 0.0
    if oiliness_level == "High":
        deductions += 10.0
    elif oiliness_level == "Moderate":
        deductions += 4.0

    if dryness_level == "High":
        deductions += 12.0
    elif dryness_level == "Moderate":
        deductions += 5.0

    if redness_level == "High":
        deductions += 15.0
    elif redness_level == "Moderate":
        deductions += 6.0

    if pigmentation_level == "High":
        deductions += 12.0
    elif pigmentation_level == "Moderate":
        deductions += 5.0

    if texture_level == "High Detail":
        deductions += 8.0
    elif texture_level == "Medium Detail":
        deductions += 3.0

    overall_score = max(52.0, min(98.5, round(100.0 - deductions, 1)))

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
    # 13. RETURN RESULTS
    # =====================================================

    return {
        "success": True,
        "message": "Skin features analyzed successfully.",
        "face_detected": True,

        # Images
        "cropped_face": os.path.basename(face_crop_path),
        "forehead": os.path.basename(forehead_crop_path),
        "left_cheek": os.path.basename(left_cheek_crop_path),
        "right_cheek": os.path.basename(right_cheek_crop_path),
        "face_crop_full_path": face_crop_path,
        "forehead_crop_full_path": forehead_crop_path,
        "left_cheek_crop_full_path": left_cheek_crop_path,
        "right_cheek_crop_full_path": right_cheek_crop_path,

        # Headline
        "skin_type": skin_type,
        "overall_score": overall_score,
        "overall_condition": overall_condition,

        # Brightness
        "forehead_brightness": round(float(forehead_brightness), 2),
        "cheek_brightness": round(float(cheek_brightness), 2),
        "brightness_difference": round(float(brightness_difference), 2),

        # Oiliness
        "forehead_saturation": round(float(forehead_saturation), 2),
        "shiny_percentage": round(float(shiny_percentage), 2),
        "oiliness_score": round(float(oiliness_score), 2),
        "oiliness_level": oiliness_level,

        # Texture
        "left_texture": round(float(left_texture), 2),
        "right_texture": round(float(right_texture), 2),
        "texture_score": round(float(texture_score), 2),
        "texture_level": texture_level,

        # Dryness
        "dryness_score": round(float(dryness_score), 2),
        "dryness_level": dryness_level,

        # Redness
        "left_redness": round(float(left_redness), 2),
        "right_redness": round(float(right_redness), 2),
        "redness_score": round(float(redness_score), 2),
        "redness_level": redness_level,

        # Pigmentation
        "pigmentation_percentage": round(float(pigmentation_percentage), 2),
        "tone_variation": round(float(tone_variation), 2),
        "pigmentation_score": round(float(pigmentation_score), 2),
        "pigmentation_level": pigmentation_level,

        # Recommendations & Routines
        "recommendations": skincare_plan.get("recommendations", []),
        "recommended_ingredients": skincare_plan.get("recommended_ingredients", []),
        "things_to_avoid": skincare_plan.get("things_to_avoid", []),
        "morning_routine": skincare_plan.get("morning_routine", []),
        "night_routine": skincare_plan.get("night_routine", []),
        "possible_causes": skincare_plan.get("possible_causes", []),
        "lifestyle_suggestions": skincare_plan.get("lifestyle_suggestions", [])
    }
