"""
Direct Supabase Storage REST API Uploader
Creates bucket 'product-images' if needed, then uploads all images from static/products/.
"""

import os
import glob
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://poilovpcmuoqrxjeicnf.supabase.co").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "product-images"
STATIC_PRODUCTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "products")


def ensure_bucket():
    print(f"[1/2] Ensuring public storage bucket '{BUCKET_NAME}' exists on Supabase...")
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
    }
    payload = json.dumps({
        "id": BUCKET_NAME,
        "name": BUCKET_NAME,
        "public": True,
        "file_size_limit": 52428800,  # 50MB
        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/avif"]
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"  [SUCCESS] Bucket '{BUCKET_NAME}' created as public!")
    except urllib.error.HTTPError as e:
        if e.code in (400, 409):
            print(f"  [INFO] Bucket '{BUCKET_NAME}' already exists and is ready.")
        else:
            print(f"  [WARNING] Bucket creation response: {e.code} - {e.reason}")
    except Exception as e:
        print(f"  [WARNING] Could not check bucket creation: {e}")


def upload_images():
    print(f"\n[2/2] Uploading product images from '{STATIC_PRODUCTS_DIR}' to '{BUCKET_NAME}'...")
    images = glob.glob(os.path.join(STATIC_PRODUCTS_DIR, "*.*"))
    if not images:
        print("  [ERROR] No images found in static/products/ directory.")
        return

    uploaded = 0
    for img_path in images:
        filename = os.path.basename(img_path)
        content_type = "image/png" if filename.lower().endswith(".png") else "image/jpeg"
        
        url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{urllib.parse.quote(filename)}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": content_type,
            "x-upsert": "true",
        }

        with open(img_path, "rb") as f:
            file_bytes = f.read()

        req = urllib.request.Request(url, data=file_bytes, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                public_cdn_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
                print(f"  [UPLOADED] {filename} -> {public_cdn_url}")
                uploaded += 1
        except Exception as e:
            print(f"  [ERROR] Failed uploading {filename}: {e}")

    print(f"\n[COMPLETE] Successfully uploaded {uploaded}/{len(images)} product images to Supabase Storage!")


if __name__ == "__main__":
    if not SUPABASE_KEY:
        print("[ERROR] SUPABASE_KEY is missing from .env")
    else:
        ensure_bucket()
        upload_images()
