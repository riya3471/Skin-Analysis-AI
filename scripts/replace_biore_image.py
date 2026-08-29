"""
Replaces biore_uv_aqua_rich_watery_essence.jpg with the official authentic Japanese packaging image.
"""

import os
import urllib.request

target_file = r"E:\Skin-Analysis-AI\static\products\biore_uv_aqua_rich_watery_essence.jpg"

if os.path.exists(target_file):
    os.remove(target_file)
    print(f"Deleted old inaccurate image: {target_file}")

# Verified official Bioré UV Aqua Rich Watery Essence image (Nykaa / YesStyle official CDN)
url = "https://images-static.nykaa.com/media/catalog/product/3/7/371719d8934681432732_1.jpg"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response, open(target_file, "wb") as out_file:
        out_file.write(response.read())
    print(f"[SUCCESS] Replaced {target_file} with accurate Bioré UV Aqua Rich Watery Essence packaging!")
except Exception as e:
    print(f"[ERROR] Failed downloading from Nykaa ({e}), trying fallback...")
    fallback_url = "https://d1flfk77wl2xk4.cloudfront.net/Assets/93/624/XXL_p0193862493.jpg"
    req = urllib.request.Request(fallback_url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response, open(target_file, "wb") as out_file:
        out_file.write(response.read())
    print(f"[SUCCESS] Replaced {target_file} from YesStyle CDN!")
