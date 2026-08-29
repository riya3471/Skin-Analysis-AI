"""
Downloads ONLY the missing/deleted product images into static/products/
Preserves all images kept by the user.
"""

import os
import urllib.request

STATIC_PRODUCTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "products")

MISSING_TARGETS = {
    "the_ordinary_hyaluronic_acid_2_b5.jpg": "https://images-static.nykaa.com/media/catalog/product/8/8/88a48a1THECI00000093_1.jpg",
    "biore_uv_aqua_rich_watery_essence.jpg": "https://boots.scene7.com/is/image/Boots/10355025",
    "cosrx_bha_blackhead_power_liquid.jpg": "https://boots.scene7.com/is/image/Boots/10280725?op_sharpen=1",
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
}

for filename, url in MISSING_TARGETS.items():
    filepath = os.path.join(STATIC_PRODUCTS_DIR, filename)
    if not os.path.exists(filepath):
        try:
            print(f"Downloading missing product image: {filename}...")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response, open(filepath, "wb") as out_file:
                out_file.write(response.read())
            print(f"  [SUCCESS] Downloaded accurate image for {filename}")
        except Exception as e:
            print(f"  [ERROR] Failed downloading {filename}: {e}")
    else:
        print(f"  [EXISTS] {filename} already in folder, skipping.")

print("Finished checking missing images.")
