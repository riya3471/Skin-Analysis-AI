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
            "note": "Balances sebum & minimizes pores. Budget-friendly.",
            "image_url": "/static/products/the_ordinary_niacinamide_10_zinc_1.jpg",
            "buy_url": "https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html",
        },
        {
            "product": "10% Niacinamide Booster",
            "brand": "Paula's Choice",
            "category": "Serum",
            "note": "Concentrated formula for oil control and brightening.",
            "image_url": "/static/products/paulas_choice_10_niacinamide_booster.jpg",
            "buy_url": "https://www.paulaschoice.com/10-niacinamide-booster/798.html",
        },
    ],
    "Salicylic Acid": [
        {
            "product": "BHA Liquid Exfoliant 2%",
            "brand": "Paula's Choice",
            "category": "Exfoliant",
            "note": "Gold-standard BHA for unclogging pores.",
            "image_url": "/static/products/paulas_choice_bha_liquid_exfoliant_2.jpg",
            "buy_url": "https://www.paulaschoice.com/skin-perfecting-2-percent-bha-liquid-exfoliant/201.html",
        },
        {
            "product": "Salicylic Acid Cleanser",
            "brand": "CeraVe",
            "category": "Cleanser",
            "note": "Gentle daily SA cleanser with ceramides.",
            "image_url": "/static/products/cerave_salicylic_acid_cleanser.jpg",
            "buy_url": "https://www.cerave.com/skincare/cleansers/renewing-sa-cleanser",
        },
    ],
    "Hyaluronic Acid": [
        {
            "product": "Hyaluronic Acid 2% + B5",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "Multi-weight HA for deep and surface hydration.",
            "image_url": "/static/products/the_ordinary_hyaluronic_acid_2_b5.jpg",
            "buy_url": "https://theordinary.com/en-us/hyaluronic-acid-2-b5-serum-100398.html",
        },
        {
            "product": "Hydra Power Essence",
            "brand": "COSRX",
            "category": "Essence",
            "note": "Lightweight hydrating essence with HA.",
            "image_url": "/static/products/cosrx_hydra_power_essence.jpg",
            "buy_url": "https://www.cosrx.com/products/hyaluronic-acid-hydra-power-essence",
        },
    ],
    "Ceramides": [
        {
            "product": "Moisturizing Cream",
            "brand": "CeraVe",
            "category": "Moisturizer",
            "note": "Dermatologist-recommended with 3 essential ceramides.",
            "image_url": "/static/products/cerave_moisturizing_cream.jpg",
            "buy_url": "https://www.cerave.com/skincare/moisturizers/moisturizing-cream",
        },
        {
            "product": "Ceramide Ato Concentrate Cream",
            "brand": "Illiyoon",
            "category": "Moisturizer",
            "note": "K-beauty barrier repair cream for sensitive skin.",
            "image_url": "/static/products/illiyoon_ceramide_ato_concentrate_cream.jpg",
            "buy_url": "https://www.amazon.com/s?k=Illiyoon+Ceramide+Ato+Concentrate+Cream",
        },
    ],
    "Ceramide Barrier Cream": [
        {
            "product": "Moisturizing Cream",
            "brand": "CeraVe",
            "category": "Moisturizer",
            "note": "MVE technology delivers ceramides over 24 hours.",
            "image_url": "/static/products/cerave_moisturizing_cream.jpg",
            "buy_url": "https://www.cerave.com/skincare/moisturizers/moisturizing-cream",
        },
    ],
    "Vitamin C": [
        {
            "product": "C E Ferulic Serum",
            "brand": "SkinCeuticals",
            "category": "Serum",
            "note": "Clinical-grade 15% L-Ascorbic Acid with antioxidant synergy.",
            "image_url": "/static/products/skinceuticals_c_e_ferulic_serum.jpg",
            "buy_url": "https://www.skinceuticals.com/skincare/vitamin-c-serums/c-e-ferulic-with-15-l-ascorbic-acid/S24.html",
        },
        {
            "product": "Vitamin C Suspension 23% + HA Spheres 2%",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "High-potency vitamin C at an affordable price.",
            "image_url": "/static/products/the_ordinary_vitamin_c_suspension_23.jpg",
            "buy_url": "https://theordinary.com/en-us/vitamin-c-suspension-23-ha-spheres-2-vitamin-c-100451.html",
        },
        {
            "product": "10% Vitamin C Serum",
            "brand": "Minimalist",
            "category": "Serum",
            "note": "Ethyl Ascorbic Acid for stable brightening.",
            "image_url": "/static/products/minimalist_10_vitamin_c_serum.jpg",
            "buy_url": "https://beminimalist.co/products/vitamin-c-serum-10",
        },
    ],
    "SPF 50 Sunscreen": [
        {
            "product": "Anthelios UVMune 400 SPF 50+",
            "brand": "La Roche-Posay",
            "category": "Sunscreen",
            "note": "Superior broad-spectrum protection, lightweight finish.",
            "image_url": "/static/products/la_roche_posay_anthelios_uvmune_400.jpg",
            "buy_url": "https://www.laroche-posay.us/our-products/sun/face-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-antheliosfaceandbodysunscreen.html",
        },
        {
            "product": "Relief Sun Rice + Probiotics SPF 50+",
            "brand": "Beauty of Joseon",
            "category": "Sunscreen",
            "note": "K-beauty cult-favorite. Moisturizing with no white cast.",
            "image_url": "/static/products/beauty_of_joseon_relief_sun_spf_50.jpg",
            "buy_url": "https://beautyofjoseon.com/products/relief-sun-rice-probiotics-set",
        },
        {
            "product": "UV Aqua Rich Watery Essence SPF 50+",
            "brand": "Bioré",
            "category": "Sunscreen",
            "note": "Ultra-light watery texture, ideal under makeup.",
            "image_url": "/static/products/biore_uv_aqua_rich_watery_essence.jpg",
            "buy_url": "https://www.amazon.com/s?k=Biore+UV+Aqua+Rich+Watery+Essence+SPF50",
        },
    ],
    "Centella Asiatica": [
        {
            "product": "Madagascar Centella Ampoule",
            "brand": "SKIN1004",
            "category": "Ampoule",
            "note": "Pure centella extract for calming and recovery.",
            "image_url": "/static/products/the_ordinary_hyaluronic_acid_2_b5.jpg",
            "buy_url": "https://www.amazon.com/s?k=SKIN1004+Madagascar+Centella+Ampoule",
        },
        {
            "product": "Centella Unscented Serum",
            "brand": "PURITO",
            "category": "Serum",
            "note": "Fragrance-free calming serum for sensitive skin.",
            "image_url": "/static/products/the_ordinary_niacinamide_10_zinc_1.jpg",
            "buy_url": "https://www.amazon.com/s?k=PURITO+Centella+Unscented+Serum",
        },
    ],
    "Aloe Vera": [
        {
            "product": "92% Aloe Vera Soothing Gel",
            "brand": "Nature Republic",
            "category": "Gel",
            "note": "Multi-purpose soothing & cooling gel.",
            "image_url": "/static/products/cosrx_hydra_power_essence.jpg",
            "buy_url": "https://www.amazon.com/s?k=Nature+Republic+92+Aloe+Vera+Gel",
        },
    ],
    "Lactic Acid": [
        {
            "product": "Lactic Acid 10% + HA",
            "brand": "The Ordinary",
            "category": "Exfoliant",
            "note": "Gentle AHA for smoother, more radiant skin texture.",
            "image_url": "/static/products/the_ordinary_hyaluronic_acid_2_b5.jpg",
            "buy_url": "https://theordinary.com/en-us/lactic-acid-10-ha-2-exfoliator-100427.html",
        },
    ],
    "BHA Exfoliant": [
        {
            "product": "BHA Blackhead Power Liquid",
            "brand": "COSRX",
            "category": "Exfoliant",
            "note": "Betaine salicylate formula for gentle pore clearing.",
            "image_url": "/static/products/paulas_choice_bha_liquid_exfoliant_2.jpg",
            "buy_url": "https://www.cosrx.com/products/bha-blackhead-power-liquid",
        },
    ],
    "Niacinamide + Vitamin C": [
        {
            "product": "Niacinamide 10% + Zinc 1%",
            "brand": "The Ordinary",
            "category": "Serum",
            "note": "Use in the evening; pair with Vitamin C in the morning.",
            "image_url": "/static/products/the_ordinary_niacinamide_10_zinc_1.jpg",
            "buy_url": "https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html",
        },
    ],
}


def lookup_catalog_entries(ingredient_raw):
    """
    Resilient lookup that matches raw ingredient strings (e.g., 'Niacinamide (5%)',
    'Broad-Spectrum SPF 50', 'Hyaluronic Acid - Hydrating') to catalog entries.
    """
    if not ingredient_raw:
        return []
    
    # 1. Direct exact match
    if ingredient_raw in PRODUCT_CATALOG:
        return PRODUCT_CATALOG[ingredient_raw]

    norm = str(ingredient_raw).lower()

    # 2. Key-phrase normalized matching
    if "niacinamide" in norm and "vitamin c" in norm:
        return PRODUCT_CATALOG.get("Niacinamide + Vitamin C", [])
    elif "niacinamide" in norm or "vitamin b3" in norm:
        return PRODUCT_CATALOG.get("Niacinamide", [])
    elif "salicylic" in norm or "bha" in norm:
        return PRODUCT_CATALOG.get("Salicylic Acid", [])
    elif "hyaluronic" in norm or "hydra" in norm:
        return PRODUCT_CATALOG.get("Hyaluronic Acid", [])
    elif "ceramide" in norm:
        return PRODUCT_CATALOG.get("Ceramides", [])
    elif "sunscreen" in norm or "spf" in norm or "uv" in norm:
        return PRODUCT_CATALOG.get("SPF 50 Sunscreen", [])
    elif "vitamin c" in norm or "ascorbic" in norm:
        return PRODUCT_CATALOG.get("Vitamin C", [])
    elif "centella" in norm or "cica" in norm:
        return PRODUCT_CATALOG.get("Centella Asiatica", [])
    elif "aloe" in norm:
        return PRODUCT_CATALOG.get("Aloe Vera", [])
    elif "lactic" in norm or "aha" in norm:
        return PRODUCT_CATALOG.get("Lactic Acid", [])

    # 3. Partial keyword matching against catalog keys
    for cat_key, entries in PRODUCT_CATALOG.items():
        if cat_key.lower() in norm or norm in cat_key.lower():
            return entries

    return []


def get_product_recommendations(recommended_ingredients=None):
    """
    Given the list of recommended ingredient dicts or strings,
    returns a list of product recommendations arranged and grouped by active ingredient.
    """
    products = []
    seen_products = set()

    if recommended_ingredients:
        for item in recommended_ingredients:
            ingredient_name = item.get("ingredient", "") if isinstance(item, dict) else str(item)
            catalog_entries = lookup_catalog_entries(ingredient_name)

            for entry in catalog_entries:
                product_key = f"{entry['brand']}_{entry['product']}"
                if product_key not in seen_products:
                    seen_products.add(product_key)
                    category = entry.get("category", "Serum")
                    products.append({
                        "ingredient": ingredient_name,
                        "product": entry["product"],
                        "brand": entry["brand"],
                        "category": category,
                        "note": entry["note"],
                        "image_url": entry.get("image_url", ""),
                        "buy_url": entry.get("buy_url", ""),
                    })

    # Guaranteed baseline fallback if ingredients list was empty or produced no matches
    if not products:
        baseline_ingredients = ["Niacinamide", "Vitamin C", "Hyaluronic Acid", "Ceramides", "SPF 50 Sunscreen"]
        for ing in baseline_ingredients:
            for entry in PRODUCT_CATALOG.get(ing, []):
                product_key = f"{entry['brand']}_{entry['product']}"
                if product_key not in seen_products:
                    seen_products.add(product_key)
                    category = entry.get("category", "Serum")
                    products.append({
                        "ingredient": ing,
                        "product": entry["product"],
                        "brand": entry["brand"],
                        "category": category,
                        "note": entry["note"],
                        "image_url": entry.get("image_url", ""),
                        "buy_url": entry.get("buy_url", ""),
                    })

    # Sort strictly by ingredient so all products with the same ingredient appear side-by-side
    products.sort(key=lambda p: (p.get("ingredient", ""), p.get("brand", ""), p.get("product", "")))

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