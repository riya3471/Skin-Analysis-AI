import cv2
import os
import numpy as np


def analyze_skin_image(image_path):

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

    # =====================================================
    # 2. FACE DETECTION
    # =====================================================

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades +
        "haarcascade_frontalface_default.xml"
    )

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5
    )

    if len(faces) == 0:
        return {
        "success": False,
        "message": "No face detected.",
        "face_detected": False
    }

    x, y, w, h = faces[0]

    face = image[
        y:y + h,
        x:x + w
    ]

    cv2.imwrite("cropped_face.jpg", face)

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

    cv2.imwrite("forehead.jpg", forehead)
    cv2.imwrite("left_cheek.jpg", left_cheek)
    cv2.imwrite("right_cheek.jpg", right_cheek)

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

    if oiliness_score < 20:

        oiliness_level = "Low"

    elif oiliness_score < 45:

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

    if texture_score < 30:
        texture_level = "Low Detail"

    elif texture_score < 100:
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
        texture_component * 0.65 +
        low_shine_component * 0.35
    )

    dryness_score = max(
        0,
        min(100, dryness_score)
    )

    if dryness_score < 35:
        dryness_level = "Low"

    elif dryness_score < 65:
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
        redness_raw * 2.0 +
        redness_percentage * 0.5
    )


    redness_score = max(
        0,
        min(100, redness_score)
    )


    # =====================================================
    # REDNESS CLASSIFICATION
    # =====================================================

    if redness_score < 25:

        redness_level = "Low"

    elif redness_score < 50:

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
        pigmentation_percentage * 3 +
        tone_variation * 2
    )

    pigmentation_score = max(
        0,
        min(100, pigmentation_score)
    )

    if pigmentation_score < 25:
        pigmentation_level = "Low"

    elif pigmentation_score < 50:
        pigmentation_level = "Moderate"

    else:
        pigmentation_level = "High"


    

        # =====================================================
    # 12. SKIN TYPE CLASSIFICATION
    # =====================================================

    # Skin type is classified using the oiliness
    # and dryness scores calculated above.

    if (
        oiliness_score >= 50
        and dryness_score < 45
    ):
        skin_type = "Oily"

    elif (
        oiliness_score < 30
        and dryness_score >= 55
    ):
        skin_type = "Dry"

    elif (
        oiliness_score >= 40
        and dryness_score >= 40
    ):
        skin_type = "Combination"

    else:
        skin_type = "Normal"

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
    # 12. RETURN RESULTS
    # =====================================================

    return {
        "success": True,

        "message":
        "Skin features analyzed successfully.",

        "face_detected": True,

        # Images
        "cropped_face":
        "cropped_face.jpg",

        "forehead":
        "forehead.jpg",

        "left_cheek":
        "left_cheek.jpg",

        "right_cheek":
        "right_cheek.jpg",

        # Brightness
        "forehead_brightness":
        round(float(forehead_brightness), 2),

        "cheek_brightness":
        round(float(cheek_brightness), 2),

        "brightness_difference":
        round(float(brightness_difference), 2),

        # Oiliness
        "forehead_saturation":
        round(float(forehead_saturation), 2),

        "shiny_percentage":
        round(float(shiny_percentage), 2),

        "oiliness_score":
        round(float(oiliness_score), 2),

        "oiliness_level":
        oiliness_level,

        # Texture
        "left_texture":
        round(float(left_texture), 2),

        "right_texture":
        round(float(right_texture), 2),

        "texture_score":
        round(float(texture_score), 2),

        "texture_level":
        texture_level,

        # Dryness
        "dryness_score":
        round(float(dryness_score), 2),

        "dryness_level":
        dryness_level,

        # Redness
        "left_redness":
        round(float(left_redness), 2),

        "right_redness":
        round(float(right_redness), 2),

        "redness_score":
        round(float(redness_score), 2),

        "redness_level":
        redness_level,

        # Pigmentation
        "pigmentation_percentage":
        round(float(pigmentation_percentage), 2),

        "tone_variation":
        round(float(tone_variation), 2),

        "pigmentation_score":
        round(float(pigmentation_score), 2),

        "pigmentation_level":
        pigmentation_level,

        # Skin Type
        "skin_type":
        skin_type
    }