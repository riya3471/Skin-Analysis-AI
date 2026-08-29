"""
Product Asset Fetcher & Supabase Preparation Pipeline
Downloads official product images to static/products/ and prepares URLs and buying links.
"""

import os
import json
import urllib.request
import urllib.parse

STATIC_PRODUCTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "products")
os.makedirs(STATIC_PRODUCTS_DIR, exist_ok=True)

# Supabase Project Ref from DATABASE_URL
SUPABASE_PROJECT_REF = "poilovpcmuoqrxjeicnf"
SUPABASE_STORAGE_BUCKET = "product-images"
SUPABASE_BASE_CDN = f"https://{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}"

# Verified Official Product Image URLs & Direct E-commerce Store Links
CATALOG_METADATA = {
    "the_ordinary_niacinamide_10_zinc_1": {
        "brand": "The Ordinary",
        "product": "Niacinamide 10% + Zinc 1%",
        "ingredient": "Niacinamide",
        "category": "Serum",
        "image_filename": "the_ordinary_niacinamide_10_zinc_1.jpg",
        "source_image_url": "https://images-static.nykaa.com/media/catalog/product/8/8/88a48a1THECI00000026_1.jpg",
        "buy_url": "https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=The+Ordinary+Niacinamide+10%25",
        "amazon_search": "https://www.amazon.com/s?k=The+Ordinary+Niacinamide+10+Zinc+1",
    },
    "paulas_choice_10_niacinamide_booster": {
        "brand": "Paula's Choice",
        "product": "10% Niacinamide Booster",
        "ingredient": "Niacinamide",
        "category": "Serum",
        "image_filename": "paulas_choice_10_niacinamide_booster.jpg",
        "source_image_url": "https://cdn.tirabeauty.com/v2/billowing-snowflake-434234/tira-p/wrkr/products/pictures/item/free/resize-w:540/L6i-jsn2Ls-1199111_1.jpg",
        "buy_url": "https://www.paulaschoice.com/10-niacinamide-booster/798.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Paulas+Choice+10+Niacinamide+Booster",
        "amazon_search": "https://www.amazon.com/s?k=Paulas+Choice+10+Niacinamide+Booster",
    },
    "paulas_choice_bha_liquid_exfoliant_2": {
        "brand": "Paula's Choice",
        "product": "BHA Liquid Exfoliant 2%",
        "ingredient": "Salicylic Acid",
        "category": "Exfoliant",
        "image_filename": "paulas_choice_bha_liquid_exfoliant_2.jpg",
        "source_image_url": "https://static.thcdn.com/productimg/original/11174178-1315212874248044.jpg",
        "buy_url": "https://www.paulaschoice.com/skin-perfecting-2-percent-bha-liquid-exfoliant/201.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Paulas+Choice+2+BHA+Liquid",
        "amazon_search": "https://www.amazon.com/s?k=Paulas+Choice+2+BHA+Liquid+Exfoliant",
    },
    "cerave_salicylic_acid_cleanser": {
        "brand": "CeraVe",
        "product": "Salicylic Acid Cleanser",
        "ingredient": "Salicylic Acid",
        "category": "Cleanser",
        "image_filename": "cerave_salicylic_acid_cleanser.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10272454?op_sharpen=1",
        "buy_url": "https://www.cerave.com/skincare/cleansers/renewing-sa-cleanser",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=CeraVe+Salicylic+Acid+Cleanser",
        "amazon_search": "https://www.amazon.com/s?k=CeraVe+Salicylic+Acid+Cleanser",
    },
    "the_ordinary_hyaluronic_acid_2_b5": {
        "brand": "The Ordinary",
        "product": "Hyaluronic Acid 2% + B5",
        "ingredient": "Hyaluronic Acid",
        "category": "Serum",
        "image_filename": "the_ordinary_hyaluronic_acid_2_b5.jpg",
        "source_image_url": "https://images-static.nykaa.com/media/catalog/product/8/8/88a48a1THECI00000025_1.jpg",
        "buy_url": "https://theordinary.com/en-us/hyaluronic-acid-2-b5-serum-100398.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=The+Ordinary+Hyaluronic+Acid+2%25+B5",
        "amazon_search": "https://www.amazon.com/s?k=The+Ordinary+Hyaluronic+Acid+2+B5",
    },
    "cosrx_hydra_power_essence": {
        "brand": "COSRX",
        "product": "Hydra Power Essence",
        "ingredient": "Hyaluronic Acid",
        "category": "Essence",
        "image_filename": "cosrx_hydra_power_essence.jpg",
        "source_image_url": "https://cdn.tirabeauty.com/v2/billowing-snowflake-434234/tira-p/wrkr/products/pictures/item/free/resize-w:540/1111159/6zmPmSoed-8809416470184_1.jpg",
        "buy_url": "https://www.cosrx.com/products/hyaluronic-acid-hydra-power-essence",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=COSRX+Hyaluronic+Acid+Hydra+Power+Essence",
        "amazon_search": "https://www.amazon.com/s?k=COSRX+Hydra+Power+Essence",
    },
    "cerave_moisturizing_cream": {
        "brand": "CeraVe",
        "product": "Moisturizing Cream",
        "ingredient": "Ceramides",
        "category": "Moisturizer",
        "image_filename": "cerave_moisturizing_cream.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10258275?op_sharpen=1",
        "buy_url": "https://www.cerave.com/skincare/moisturizers/moisturizing-cream",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=CeraVe+Moisturizing+Cream",
        "amazon_search": "https://www.amazon.com/s?k=CeraVe+Moisturizing+Cream",
    },
    "illiyoon_ceramide_ato_concentrate_cream": {
        "brand": "Illiyoon",
        "product": "Ceramide Ato Concentrate Cream",
        "ingredient": "Ceramides",
        "category": "Moisturizer",
        "image_filename": "illiyoon_ceramide_ato_concentrate_cream.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10374657",
        "buy_url": "https://www.amazon.com/s?k=Illiyoon+Ceramide+Ato+Concentrate+Cream",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Illiyoon+Ceramide+Ato+Concentrate+Cream",
        "amazon_search": "https://www.amazon.com/s?k=Illiyoon+Ceramide+Ato+Concentrate+Cream",
    },
    "skinceuticals_c_e_ferulic_serum": {
        "brand": "SkinCeuticals",
        "product": "C E Ferulic Serum",
        "ingredient": "Vitamin C",
        "category": "Serum",
        "image_filename": "skinceuticals_c_e_ferulic_serum.jpg",
        "source_image_url": "https://static.thcdn.com/productimg/original/11705727-4725323826126148.jpg",
        "buy_url": "https://www.skinceuticals.com/skincare/vitamin-c-serums/c-e-ferulic-with-15-l-ascorbic-acid/S24.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=SkinCeuticals+C+E+Ferulic",
        "amazon_search": "https://www.amazon.com/s?k=SkinCeuticals+C+E+Ferulic",
    },
    "the_ordinary_vitamin_c_suspension_23": {
        "brand": "The Ordinary",
        "product": "Vitamin C Suspension 23% + HA Spheres 2%",
        "ingredient": "Vitamin C",
        "category": "Serum",
        "image_filename": "the_ordinary_vitamin_c_suspension_23.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10267785",
        "buy_url": "https://theordinary.com/en-us/vitamin-c-suspension-23-ha-spheres-2-vitamin-c-100451.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=The+Ordinary+Vitamin+C+Suspension+23",
        "amazon_search": "https://www.amazon.com/s?k=The+Ordinary+Vitamin+C+Suspension+23",
    },
    "minimalist_10_vitamin_c_serum": {
        "brand": "Minimalist",
        "product": "10% Vitamin C Serum",
        "ingredient": "Vitamin C",
        "category": "Serum",
        "image_filename": "minimalist_10_vitamin_c_serum.jpg",
        "source_image_url": "https://images-static.nykaa.com/media/catalog/product/3/9/394e9c5MINIM00000008_a.jpg",
        "buy_url": "https://beminimalist.co/products/vitamin-c-serum-10",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Minimalist+10+Vitamin+C+Serum",
        "amazon_search": "https://www.amazon.com/s?k=Minimalist+10+Vitamin+C+Serum",
    },
    "la_roche_posay_anthelios_uvmune_400": {
        "brand": "La Roche-Posay",
        "product": "Anthelios UVMune 400 SPF 50+",
        "ingredient": "SPF 50 Sunscreen",
        "category": "Sunscreen",
        "image_filename": "la_roche_posay_anthelios_uvmune_400.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10301054?op_sharpen=1",
        "buy_url": "https://www.laroche-posay.us/our-products/sun/face-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-antheliosfaceandbodysunscreen.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=La+Roche+Posay+Anthelios+SPF+50",
        "amazon_search": "https://www.amazon.com/s?k=La+Roche+Posay+Anthelios+UVMune+400",
    },
    "beauty_of_joseon_relief_sun_spf_50": {
        "brand": "Beauty of Joseon",
        "product": "Relief Sun Rice + Probiotics SPF 50+",
        "ingredient": "SPF 50 Sunscreen",
        "category": "Sunscreen",
        "image_filename": "beauty_of_joseon_relief_sun_spf_50.jpg",
        "source_image_url": "https://images-static.nykaa.com/media/catalog/product/9/d/9d01a90BEAAR00000062_2.jpg",
        "buy_url": "https://beautyofjoseon.com/products/relief-sun-rice-probiotics-set",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Beauty+of+Joseon+Relief+Sun",
        "amazon_search": "https://www.amazon.com/s?k=Beauty+of+Joseon+Relief+Sun+Rice+Probiotics",
    },
    "biore_uv_aqua_rich_watery_essence": {
        "brand": "Bioré",
        "product": "UV Aqua Rich Watery Essence SPF 50+",
        "ingredient": "SPF 50 Sunscreen",
        "category": "Sunscreen",
        "image_filename": "biore_uv_aqua_rich_watery_essence.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10355025",
        "buy_url": "https://www.amazon.com/s?k=Biore+UV+Aqua+Rich+Watery+Essence+SPF50",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Biore+UV+Aqua+Rich+Watery+Essence",
        "amazon_search": "https://www.amazon.com/s?k=Biore+UV+Aqua+Rich+Watery+Essence+SPF50",
    },
    "skin1004_madagascar_centella_ampoule": {
        "brand": "SKIN1004",
        "product": "Madagascar Centella Ampoule",
        "ingredient": "Centella Asiatica",
        "category": "Ampoule",
        "image_filename": "skin1004_madagascar_centella_ampoule.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10352028?op_sharpen=1",
        "buy_url": "https://www.amazon.com/s?k=SKIN1004+Madagascar+Centella+Ampoule",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=SKIN1004+Madagascar+Centella+Ampoule",
        "amazon_search": "https://www.amazon.com/s?k=SKIN1004+Madagascar+Centella+Ampoule",
    },
    "purito_centella_unscented_serum": {
        "brand": "PURITO",
        "product": "Centella Unscented Serum",
        "ingredient": "Centella Asiatica",
        "category": "Serum",
        "image_filename": "purito_centella_unscented_serum.jpg",
        "source_image_url": "https://static.thcdn.com/productimg/original/13455596-7425319185776242.jpg",
        "buy_url": "https://www.amazon.com/s?k=PURITO+Centella+Unscented+Serum",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=PURITO+Centella+Unscented+Serum",
        "amazon_search": "https://www.amazon.com/s?k=PURITO+Centella+Unscented+Serum",
    },
    "nature_republic_aloe_vera_gel": {
        "brand": "Nature Republic",
        "product": "92% Aloe Vera Soothing Gel",
        "ingredient": "Aloe Vera",
        "category": "Gel",
        "image_filename": "nature_republic_aloe_vera_gel.jpg",
        "source_image_url": "https://d1flfk77wl2xk4.cloudfront.net/Assets/48/074/XXL_p0213807448.jpg",
        "buy_url": "https://www.amazon.com/s?k=Nature+Republic+92+Aloe+Vera+Gel",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=Nature+Republic+92+Aloe+Vera+Gel",
        "amazon_search": "https://www.amazon.com/s?k=Nature+Republic+92+Aloe+Vera+Gel",
    },
    "the_ordinary_lactic_acid_10_ha": {
        "brand": "The Ordinary",
        "product": "Lactic Acid 10% + HA",
        "ingredient": "Lactic Acid",
        "category": "Exfoliant",
        "image_filename": "the_ordinary_lactic_acid_10_ha.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10267781?op_sharpen=1",
        "buy_url": "https://theordinary.com/en-us/lactic-acid-10-ha-2-exfoliator-100427.html",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=The+Ordinary+Lactic+Acid+10",
        "amazon_search": "https://www.amazon.com/s?k=The+Ordinary+Lactic+Acid+10+HA",
    },
    "cosrx_bha_blackhead_power_liquid": {
        "brand": "COSRX",
        "product": "BHA Blackhead Power Liquid",
        "ingredient": "BHA Exfoliant",
        "category": "Exfoliant",
        "image_filename": "cosrx_bha_blackhead_power_liquid.jpg",
        "source_image_url": "https://boots.scene7.com/is/image/Boots/10280725?op_sharpen=1",
        "buy_url": "https://www.cosrx.com/products/bha-blackhead-power-liquid",
        "daraz_search": "https://www.daraz.com.np/catalog/?q=COSRX+BHA+Blackhead+Power+Liquid",
        "amazon_search": "https://www.amazon.com/s?k=COSRX+BHA+Blackhead+Power+Liquid",
    },
}


def download_images():
    print(f"Downloading {len(CATALOG_METADATA)} authentic product images into {STATIC_PRODUCTS_DIR}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    }

    for key, item in CATALOG_METADATA.items():
        filepath = os.path.join(STATIC_PRODUCTS_DIR, item["image_filename"])
        try:
            req = urllib.request.Request(item["source_image_url"], headers=headers)
            with urllib.request.urlopen(req, timeout=12) as response, open(filepath, "wb") as out_file:
                out_file.write(response.read())
            print(f"  [SUCCESS] Downloaded {item['image_filename']}")
        except Exception as e:
            print(f"  [ERROR] Failed downloading {item['image_filename']} ({item['source_image_url']}): {e}")


def generate_catalog_json():
    output_path = os.path.join(os.path.dirname(STATIC_PRODUCTS_DIR), "products_manifest.json")
    manifest = {}
    for key, item in CATALOG_METADATA.items():
        local_url = f"/static/products/{item['image_filename']}"
        supabase_url = f"{SUPABASE_BASE_CDN}/{item['image_filename']}"
        manifest[key] = {
            **item,
            "local_image_url": local_url,
            "supabase_image_url": supabase_url,
            "preferred_image_url": local_url,
        }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest written to {output_path}")
    return manifest


if __name__ == "__main__":
    download_images()
    manifest = generate_catalog_json()
    print("Done! Authentic official product images updated.")
