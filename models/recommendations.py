def get_ingredients(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    ingredients = []

    # -----------------------------
    # OILINESS
    # -----------------------------

    if oiliness_level == "High":

        ingredients.append({
            "ingredient": "Niacinamide",
            "reason": "Controls excess oil production."
        })

        ingredients.append({
            "ingredient": "Salicylic Acid",
            "reason": "Helps unclog pores."
        })

    elif oiliness_level == "Moderate":

        ingredients.append({
            "ingredient": "Niacinamide",
            "reason": "Helps balance oil production."
        })

    # -----------------------------
    # DRYNESS
    # -----------------------------

    if dryness_level == "High":

        ingredients.append({
            "ingredient": "Ceramides",
            "reason": "Repairs and strengthens the skin barrier."
        })

        ingredients.append({
            "ingredient": "Hyaluronic Acid",
            "reason": "Provides deep hydration."
        })

    elif dryness_level == "Moderate":

        ingredients.append({
            "ingredient": "Hyaluronic Acid",
            "reason": "Maintains skin hydration."
        })

    # -----------------------------
    # PIGMENTATION
    # -----------------------------

    if pigmentation_level == "High":

        ingredients.append({
            "ingredient": "Vitamin C",
            "reason": "Helps reduce pigmentation and brighten skin."
        })

        ingredients.append({
            "ingredient": "SPF 50 Sunscreen",
            "reason": "Protects against UV damage."
        })

    elif pigmentation_level == "Moderate":

        ingredients.append({
            "ingredient": "Vitamin C",
            "reason": "Supports an even skin tone."
        })

    # -----------------------------
    # REDNESS
    # -----------------------------

    if redness_level == "High":

        ingredients.append({
            "ingredient": "Centella Asiatica",
            "reason": "Helps calm irritated skin."
        })

        ingredients.append({
            "ingredient": "Aloe Vera",
            "reason": "Provides soothing effects."
        })

    # -----------------------------
    # TEXTURE
    # -----------------------------

    if texture_level == "High Detail":

        ingredients.append({
            "ingredient": "Lactic Acid",
            "reason": "Improves uneven skin texture."
        })

    # -----------------------------
    # COMBINATION RULES
    # -----------------------------

    if oiliness_level == "High" and pigmentation_level == "High":

        ingredients.append({
            "ingredient": "Niacinamide + Vitamin C",
            "reason": "Controls oil while improving pigmentation."
        })

    if dryness_level == "High" and redness_level == "High":

        ingredients.append({
            "ingredient": "Ceramide Barrier Cream",
            "reason": "Repairs the skin barrier and reduces redness."
        })

    if oiliness_level == "High" and texture_level == "High Detail":

        ingredients.append({
            "ingredient": "BHA Exfoliant",
            "reason": "Helps clean pores and smooth skin texture."
        })

    # -----------------------------
    # BASELINE ESSENTIALS
    # Ensure every user gets core protective actives
    # -----------------------------

    existing_names = {item["ingredient"] for item in ingredients}

    if "Vitamin C" not in existing_names:
        ingredients.append({
            "ingredient": "Vitamin C",
            "reason": "Provides daily antioxidant protection and boosts radiance."
        })

    if "Hyaluronic Acid" not in existing_names:
        ingredients.append({
            "ingredient": "Hyaluronic Acid",
            "reason": "Lightweight humectant that locks in moisture without greasiness."
        })

    if "Ceramides" not in existing_names:
        ingredients.append({
            "ingredient": "Ceramides",
            "reason": "Reinforces the skin's natural lipid barrier against environmental stress."
        })

    if "SPF 50 Sunscreen" not in existing_names:
        ingredients.append({
            "ingredient": "SPF 50 Sunscreen",
            "reason": "Broad-spectrum UV defense to prevent premature aging and dark spots."
        })

    if "Niacinamide" not in existing_names:
        ingredients.append({
            "ingredient": "Niacinamide",
            "reason": "Improves skin texture, minimizes pores, and supports barrier function."
        })

    # -----------------------------
    # REMOVE DUPLICATES
    # -----------------------------

    unique = {}

    for item in ingredients:
        unique[item["ingredient"]] = item

    return list(unique.values())


# =====================================================================
# PRODUCT & BRAND CATALOG
# Maps each active ingredient to recommended products with brand names
# =====================================================================

PRODUCT_CATALOG = {
    "Niacinamide": [
        {
            "product": "Niacinamide 10% + Zinc 1%",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "Balances sebum & minimizes pores. Budget-friendly."
        },
        {
            "product": "10% Niacinamide Booster",
            "brand": "Paula's Choice",
            "category": "Serum",
            "note": "Concentrated formula for oil control and brightening."
        },
    ],
    "Salicylic Acid": [
        {
            "product": "BHA Liquid Exfoliant 2%",
            "brand": "Paula's Choice",
            "category": "Exfoliant",
            "note": "Gold-standard BHA for unclogging pores."
        },
        {
            "product": "Salicylic Acid Cleanser",
            "brand": "CeraVe",
            "category": "Cleanser",
            "note": "Gentle daily SA cleanser with ceramides."
        },
    ],
    "Hyaluronic Acid": [
        {
            "product": "Hyaluronic Acid 2% + B5",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "Multi-weight HA for deep and surface hydration."
        },
        {
            "product": "Hydra Power Essence",
            "brand": "COSRX",
            "category": "Essence",
            "note": "Lightweight hydrating essence with HA."
        },
    ],
    "Ceramides": [
        {
            "product": "Moisturizing Cream",
            "brand": "CeraVe",
            "category": "Moisturizer",
            "note": "Dermatologist-recommended with 3 essential ceramides."
        },
        {
            "product": "Ceramide Ato Concentrate Cream",
            "brand": "Illiyoon",
            "category": "Moisturizer",
            "note": "K-beauty barrier repair cream for sensitive skin."
        },
    ],
    "Ceramide Barrier Cream": [
        {
            "product": "Moisturizing Cream",
            "brand": "CeraVe",
            "category": "Moisturizer",
            "note": "MVE technology delivers ceramides over 24 hours."
        },
    ],
    "Vitamin C": [
        {
            "product": "C E Ferulic Serum",
            "brand": "SkinCeuticals",
            "category": "Serum",
            "note": "Clinical-grade 15% L-Ascorbic Acid with antioxidant synergy."
        },
        {
            "product": "Vitamin C Suspension 23% + HA Spheres 2%",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "High-potency vitamin C at an affordable price."
        },
        {
            "product": "10% Vitamin C Serum",
            "brand": "Minimalist",
            "category": "Serum",
            "note": "Ethyl Ascorbic Acid for stable brightening."
        },
    ],
    "SPF 50 Sunscreen": [
        {
            "product": "Anthelios UVMune 400 SPF 50+",
            "brand": "La Roche-Posay",
            "category": "Sunscreen",
            "note": "Superior broad-spectrum protection, lightweight finish."
        },
        {
            "product": "Relief Sun Rice + Probiotics SPF 50+",
            "brand": "Beauty of Joseon",
            "category": "Sunscreen",
            "note": "K-beauty cult-favorite. Moisturizing with no white cast."
        },
        {
            "product": "UV Aqua Rich Watery Essence SPF 50+",
            "brand": "Bioré",
            "category": "Sunscreen",
            "note": "Ultra-light watery texture, ideal under makeup."
        },
    ],
    "Centella Asiatica": [
        {
            "product": "Madagascar Centella Ampoule",
            "brand": "SKIN1004",
            "category": "Ampoule",
            "note": "Pure centella extract for calming and recovery."
        },
        {
            "product": "Centella Unscented Serum",
            "brand": "PURITO",
            "category": "Serum",
            "note": "Fragrance-free calming serum for sensitive skin."
        },
    ],
    "Aloe Vera": [
        {
            "product": "92% Aloe Vera Soothing Gel",
            "brand": "Nature Republic",
            "category": "Gel",
            "note": "Multi-purpose soothing & cooling gel."
        },
    ],
    "Lactic Acid": [
        {
            "product": "Lactic Acid 10% + HA",
            "brand": "The Ordinary",
            "category": "Exfoliant",
            "note": "Gentle AHA for smoother, more radiant skin texture."
        },
    ],
    "BHA Exfoliant": [
        {
            "product": "BHA Blackhead Power Liquid",
            "brand": "COSRX",
            "category": "Exfoliant",
            "note": "Betaine salicylate formula for gentle pore clearing."
        },
    ],
    "Niacinamide + Vitamin C": [
        {
            "product": "Niacinamide 10% + Zinc 1%",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "Use in the evening; pair with Vitamin C in the morning."
        },
    ],
}


def get_product_recommendations(recommended_ingredients):
    """
    Given the list of recommended ingredient dicts,
    returns a list of product recommendations with brand info.
    """
    products = []
    seen_products = set()

    for item in recommended_ingredients:
        ingredient_name = item.get("ingredient", "")
        catalog_entries = PRODUCT_CATALOG.get(ingredient_name, [])

        for entry in catalog_entries:
            product_key = f"{entry['brand']}_{entry['product']}"
            if product_key not in seen_products:
                seen_products.add(product_key)
                products.append({
                    "ingredient": ingredient_name,
                    "product": entry["product"],
                    "brand": entry["brand"],
                    "category": entry["category"],
                    "note": entry["note"],
                })

    return products


def get_things_to_avoid(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    avoid = []

    # Oiliness
    if oiliness_level == "High":
        avoid.extend([
            "Avoid heavy oil-based creams.",
            "Avoid touching your face frequently.",
            "Avoid sleeping with makeup."
        ])

    # Dryness
    if dryness_level == "High":
        avoid.extend([
            "Avoid hot water while washing your face.",
            "Avoid alcohol-based skincare products.",
            "Avoid over-cleansing."
        ])

    # Redness
    if redness_level == "High":
        avoid.extend([
            "Avoid harsh scrubs.",
            "Avoid fragrance-based skincare.",
            "Avoid excessive sun exposure."
        ])

    # Pigmentation
    if pigmentation_level == "High":
        avoid.extend([
            "Do not skip sunscreen.",
            "Avoid prolonged sun exposure.",
            "Avoid picking acne marks."
        ])

    # Texture
    if texture_level == "High Detail":
        avoid.extend([
            "Avoid excessive exfoliation.",
            "Avoid using harsh physical scrubs."
        ])

    # Remove duplicates
    avoid = list(dict.fromkeys(avoid))

    if not avoid:
        avoid.append("No major precautions required. Continue a healthy skincare routine.")

    return avoid

def get_morning_routine(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    routine = []

    # ----------------------------
    # STEP 1 : CLEANSER
    # ----------------------------

    if oiliness_level == "High":
        routine.append(
            "Wash your face with a Salicylic Acid Face Cleanser."
        )

    elif dryness_level == "High":
        routine.append(
            "Wash your face with a Hydrating Cleanser."
        )

    else:
        routine.append(
            "Wash your face with a Gentle Cleanser."
        )

    # ----------------------------
    # STEP 2 : SERUMS
    # ----------------------------

    if pigmentation_level == "High":
        routine.append(
            "Apply Vitamin C Serum."
        )

    if oiliness_level == "High":
        routine.append(
            "Apply Niacinamide Serum."
        )

    if redness_level == "High":
        routine.append(
            "Apply Centella Asiatica Serum."
        )

    # ----------------------------
    # STEP 3 : MOISTURIZER
    # ----------------------------

    if dryness_level == "High":

        routine.append(
            "Apply Ceramide Moisturizer."
        )

    elif oiliness_level == "High":

        routine.append(
            "Apply Oil-Free Gel Moisturizer."
        )

    else:

        routine.append(
            "Apply Lightweight Moisturizer."
        )

    # ----------------------------
    # STEP 4 : EXTRA CARE
    # ----------------------------

    if texture_level == "High Detail":

        routine.append(
            "Use a gentle exfoliating toner 2 times a week."
        )

    # ----------------------------
    # STEP 5 : SUNSCREEN
    # ----------------------------

    if pigmentation_level == "High":

        routine.append(
            "Apply SPF 50 Sunscreen and reapply every 2-3 hours."
        )

    else:

        routine.append(
            "Apply SPF 30+ Sunscreen."
        )

    return routine

def get_night_routine(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    routine = []

    # ---------------------------------
    # STEP 1 : CLEANSER
    # ---------------------------------

    if oiliness_level == "High":

        routine.append(
            "Wash your face with a Salicylic Acid Face Cleanser."
        )

    elif dryness_level == "High":

        routine.append(
            "Wash your face with a Hydrating Cleanser."
        )

    else:

        routine.append(
            "Wash your face with a Gentle Cleanser."
        )

    # ---------------------------------
    # STEP 2 : TREATMENT
    # ---------------------------------

    if oiliness_level == "High":

        routine.append(
            "Apply Niacinamide Serum."
        )

    if pigmentation_level == "High":

        routine.append(
            "Apply Vitamin C Brightening Serum."
        )

    if redness_level == "High":

        routine.append(
            "Apply Centella Asiatica Serum."
        )

    if dryness_level == "High":

        routine.append(
            "Apply Hyaluronic Acid Serum."
        )

    # ---------------------------------
    # STEP 3 : SPECIAL CARE
    # ---------------------------------

    if texture_level == "High Detail":

        routine.append(
            "Use a gentle AHA/BHA exfoliant 1-2 times per week."
        )

    # ---------------------------------
    # STEP 4 : MOISTURIZER
    # ---------------------------------

    if dryness_level == "High":

        routine.append(
            "Apply Ceramide Barrier Repair Cream."
        )

    elif oiliness_level == "High":

        routine.append(
            "Apply Oil-Free Gel Moisturizer."
        )

    else:

        routine.append(
            "Apply Lightweight Night Moisturizer."
        )

    # ---------------------------------
    # STEP 5 : EXTRA COMBINATIONS
    # ---------------------------------

    if oiliness_level == "High" and pigmentation_level == "High":

        routine.append(
            "Avoid sleeping with makeup to prevent clogged pores and pigmentation."
        )

    if dryness_level == "High" and redness_level == "High":

        routine.append(
            "Apply a soothing sleeping mask twice a week."
        )

    # ---------------------------------
    # REMOVE DUPLICATES
    # ---------------------------------

    routine = list(dict.fromkeys(routine))

    return routine

def get_possible_causes(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    causes = []

    # ----------------------------------
    # OILINESS
    # ----------------------------------

    if oiliness_level == "High":

        causes.extend([
            "Overactive sebaceous (oil) glands.",
            "Hot and humid weather.",
            "Hormonal fluctuations.",
            "Using heavy or pore-clogging skincare products."
        ])

    elif oiliness_level == "Moderate":

        causes.append(
            "Natural combination skin with moderate oil production."
        )

    # ----------------------------------
    # DRYNESS
    # ----------------------------------

    if dryness_level == "High":

        causes.extend([
            "Dehydrated skin.",
            "Cold or dry environmental conditions.",
            "Frequent washing with harsh cleansers.",
            "Lack of skin hydration."
        ])

    elif dryness_level == "Moderate":

        causes.append(
            "Mild dehydration caused by environmental factors."
        )

    # ----------------------------------
    # REDNESS
    # ----------------------------------

    if redness_level == "High":

        causes.extend([
            "Sensitive skin.",
            "Sun exposure.",
            "Skin irritation from cosmetic products.",
            "Environmental pollution."
        ])

    elif redness_level == "Moderate":

        causes.append(
            "Temporary skin sensitivity."
        )

    # ----------------------------------
    # PIGMENTATION
    # ----------------------------------

    if pigmentation_level == "High":

        causes.extend([
            "Excessive UV exposure.",
            "Post-inflammatory pigmentation.",
            "Uneven melanin distribution."
        ])

    elif pigmentation_level == "Moderate":

        causes.append(
            "Mild uneven skin tone."
        )

    # ----------------------------------
    # TEXTURE
    # ----------------------------------

    if texture_level == "High Detail":

        causes.extend([
            "Dead skin cell build-up.",
            "Clogged pores.",
            "Irregular exfoliation."
        ])

    elif texture_level == "Medium Detail":

        causes.append(
            "Minor uneven skin texture."
        )

    # ----------------------------------
    # COMBINATION CONDITIONS
    # ----------------------------------

    if oiliness_level == "High" and pigmentation_level == "High":

        causes.append(
            "Excess oil together with prolonged UV exposure may worsen pigmentation."
        )

    if dryness_level == "High" and redness_level == "High":

        causes.append(
            "A weakened skin barrier may contribute to both dryness and redness."
        )

    if oiliness_level == "High" and texture_level == "High Detail":

        causes.append(
            "Oil accumulation may lead to clogged pores and rough skin texture."
        )

    # ----------------------------------
    # REMOVE DUPLICATES
    # ----------------------------------

    causes = list(dict.fromkeys(causes))

    # ----------------------------------
    # DEFAULT
    # ----------------------------------

    if not causes:

        causes.append(
            "No major skin concerns detected in the current analysis."
        )

    return causes


def get_lifestyle(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    lifestyle = []

    # ----------------------------------
    # OILINESS
    # ----------------------------------

    if oiliness_level == "High":

        lifestyle.extend([
            "Wash your face twice daily using a gentle cleanser.",
            "Avoid oily and fried foods.",
            "Avoid touching your face frequently."
        ])

    elif oiliness_level == "Moderate":

        lifestyle.append(
            "Maintain a regular cleansing routine."
        )

    # ----------------------------------
    # DRYNESS
    # ----------------------------------

    if dryness_level == "High":

        lifestyle.extend([
            "Drink at least 2.5–3 litres of water daily.",
            "Avoid very hot showers.",
            "Apply moisturizer immediately after washing your face."
        ])

    elif dryness_level == "Moderate":

        lifestyle.append(
            "Keep your skin hydrated throughout the day."
        )

    # ----------------------------------
    # PIGMENTATION
    # ----------------------------------

    if pigmentation_level == "High":

        lifestyle.extend([
            "Use sunscreen every day, even when indoors near windows.",
            "Wear a cap or umbrella during prolonged sun exposure.",
            "Reapply sunscreen every 2-3 hours when outdoors."
        ])

    elif pigmentation_level == "Moderate":

        lifestyle.append(
            "Avoid unnecessary direct sun exposure."
        )

    # ----------------------------------
    # REDNESS
    # ----------------------------------

    if redness_level == "High":

        lifestyle.extend([
            "Avoid spicy food if it triggers skin irritation.",
            "Reduce exposure to excessive heat.",
            "Use fragrance-free skincare products."
        ])

    elif redness_level == "Moderate":

        lifestyle.append(
            "Protect your skin from harsh environmental conditions."
        )

    # ----------------------------------
    # TEXTURE
    # ----------------------------------

    if texture_level == "High Detail":

        lifestyle.extend([
            "Exfoliate only once or twice a week.",
            "Follow a consistent skincare routine for smoother skin."
        ])

    elif texture_level == "Medium Detail":

        lifestyle.append(
            "Cleanse your skin regularly to maintain smooth texture."
        )

    # ----------------------------------
    # GENERAL
    # ----------------------------------

    lifestyle.extend([
        "Sleep for 7-8 hours every night.",
        "Manage stress through regular relaxation or exercise."
    ])

    # ----------------------------------
    # REMOVE DUPLICATES
    # ----------------------------------

    lifestyle = list(dict.fromkeys(lifestyle))

    return lifestyle

def get_recommendations(
    skin_type,
    oiliness_level,
    dryness_level,
    texture_level,
    redness_level,
    pigmentation_level
):

    # -----------------------------------
    # Helper Functions
    # -----------------------------------

    recommended_ingredients = get_ingredients(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    things_to_avoid = get_things_to_avoid(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    morning_routine = get_morning_routine(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    night_routine = get_night_routine(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    possible_causes = get_possible_causes(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    lifestyle_suggestions = get_lifestyle(
        skin_type,
        oiliness_level,
        dryness_level,
        texture_level,
        redness_level,
        pigmentation_level
    )

    recommendations = []

    # -----------------------------------
    # PERSONALIZED RULES
    # -----------------------------------

    # High Oil

    if oiliness_level == "High":

        recommendations.extend([
            "Control excess oil using lightweight skincare products.",
            "Cleanse your face twice daily.",
            "Choose non-comedogenic products."
        ])

    # High Dryness

    if dryness_level == "High":

        recommendations.extend([
            "Restore moisture using hydrating products.",
            "Avoid harsh face cleansers.",
            "Moisturize immediately after washing your face."
        ])

    # High Pigmentation

    if pigmentation_level == "High":

        recommendations.extend([
            "Use sunscreen every day.",
            "Use brightening ingredients consistently.",
            "Reduce unnecessary sun exposure."
        ])

    # High Redness

    if redness_level == "High":

        recommendations.extend([
            "Avoid harsh exfoliation.",
            "Use fragrance-free skincare.",
            "Focus on repairing the skin barrier."
        ])

    # Texture

    if texture_level == "High Detail":

        recommendations.extend([
            "Use gentle exfoliation once or twice weekly.",
            "Maintain a regular skincare routine."
        ])

    # -----------------------------------
    # COMBINATION RULES
    # -----------------------------------

    if oiliness_level == "High" and pigmentation_level == "High":

        recommendations.append(
            "Focus on oil control while protecting your skin from UV damage."
        )

    if dryness_level == "High" and redness_level == "High":

        recommendations.append(
            "Repair the skin barrier before introducing active ingredients."
        )

    if oiliness_level == "High" and texture_level == "High Detail":

        recommendations.append(
            "Regular pore cleansing may help improve uneven texture."
        )

    if pigmentation_level == "High" and redness_level == "High":

        recommendations.append(
            "Choose calming products together with daily sun protection."
        )

    if (
        oiliness_level == "High"
        and pigmentation_level == "High"
        and texture_level == "High Detail"
    ):

        recommendations.append(
            "Maintain a simple but consistent skincare routine to gradually improve multiple concerns."
        )

    # -----------------------------------
    # GENERAL
    # -----------------------------------

    recommendations.append(
        "Monitor your skin regularly and compare future scans for improvement."
    )

    recommendations = list(dict.fromkeys(recommendations))

    # Build product/brand recommendations from the ingredient list
    product_recs = get_product_recommendations(recommended_ingredients)

    return {

        "recommendations": recommendations,

        "recommended_ingredients": recommended_ingredients,

        "product_recommendations": product_recs,

        "things_to_avoid": things_to_avoid,

        "morning_routine": morning_routine,

        "night_routine": night_routine,

        "possible_causes": possible_causes,

        "lifestyle_suggestions": lifestyle_suggestions

    }