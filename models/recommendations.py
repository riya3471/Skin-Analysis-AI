def get_recommendations(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    recommendations = []

    # =====================================================
    # 1. BASIC SKIN TYPE RECOMMENDATIONS
    # =====================================================

    if skin_type == "Oily":

        recommendations.append(
            "Use a gentle foaming cleanser to remove excess oil."
        )

        recommendations.append(
            "Choose a lightweight, oil-free and non-comedogenic moisturizer."
        )

    elif skin_type == "Dry":

        recommendations.append(
            "Use a gentle hydrating cleanser that does not strip natural oils."
        )

        recommendations.append(
            "Use a rich moisturizer to help maintain skin hydration."
        )

    elif skin_type == "Combination":

        recommendations.append(
            "Use a gentle cleanser suitable for combination skin."
        )

        recommendations.append(
            "Use a lightweight moisturizer and focus hydration on drier areas."
        )

    elif skin_type == "Normal":

        recommendations.append(
            "Maintain a simple and balanced skincare routine."
        )

        recommendations.append(
            "Use a gentle cleanser and moisturizer regularly."
        )

    # =====================================================
    # 2. OILINESS RECOMMENDATIONS
    # =====================================================

    if oiliness_level == "High":

        recommendations.append(
            "Avoid heavy or greasy skincare products."
        )

        recommendations.append(
            "Choose non-comedogenic products that are less likely to clog pores."
        )

    elif oiliness_level == "Moderate":

        recommendations.append(
            "Use lightweight skincare products to help maintain balanced oil levels."
        )

    # =====================================================
    # 3. DRYNESS RECOMMENDATIONS
    # =====================================================

    if dryness_level == "High":

        recommendations.append(
            "Use a hydrating moisturizer with ingredients such as ceramides or hyaluronic acid."
        )

        recommendations.append(
            "Avoid harsh cleansers and excessive face washing."
        )

    elif dryness_level == "Moderate":

        recommendations.append(
            "Maintain regular moisturization to support skin hydration."
        )

    # =====================================================
    # 4. TEXTURE RECOMMENDATIONS
    # =====================================================

    if texture_level == "High Detail":

        recommendations.append(
            "Avoid harsh physical scrubs and use gentle skincare products."
        )

        recommendations.append(
            "Keep the skin moisturized to support a smoother appearance."
        )

    elif texture_level == "Medium Detail":

        recommendations.append(
            "Maintain regular cleansing and moisturization for balanced skin texture."
        )

    # =====================================================
    # 5. REDNESS RECOMMENDATIONS
    # =====================================================

    if redness_level == "High":

        recommendations.append(
            "Use gentle, fragrance-free skincare products."
        )

        recommendations.append(
            "Avoid harsh exfoliation while visible redness is high."
        )

    elif redness_level == "Moderate":

        recommendations.append(
            "Use soothing and gentle skincare products to support the skin barrier."
        )

    # =====================================================
    # 6. PIGMENTATION RECOMMENDATIONS
    # =====================================================

    if pigmentation_level == "High":

        recommendations.append(
            "Use broad-spectrum sunscreen daily to help prevent further uneven pigmentation."
        )

        recommendations.append(
            "Consider gentle skincare ingredients that support a more even-looking skin tone."
        )

    elif pigmentation_level == "Moderate":

        recommendations.append(
            "Use sunscreen regularly and maintain a consistent skincare routine."
        )

    

    # =====================================================
    # 8. GENERAL RECOMMENDATION
    # =====================================================

    recommendations.append(
        "Use broad-spectrum SPF 30 or higher sunscreen during daytime."
    )

    return recommendations