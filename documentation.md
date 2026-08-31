# Skiné AI — Complete Technical Documentation & Presentation Guide

> **Project Name:** Skiné AI (Smart Skin Analysis & Skincare Engine)  
> **Repository:** `Skin-Analysis-AI`  
> **Production URL:** `https://skin-analysis-ai-beta.vercel.app`  
> **Language & Tone:** Simple, clear, plain English with rigorous technical backing.

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [High-Level Architecture (The Big Picture)](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Computer Vision & Skin Analysis Pipeline](#4-computer-vision--skin-analysis-pipeline)
5. [Database & Data Storage: Where and How Data is Stored & Fetched](#5-database--data-storage)
6. [Backend API & How Requests Work](#6-backend-api--how-requests-work)
7. [Frontend & User Experience](#7-frontend--user-experience)
8. [The Multimodal AI Chatbot & Nepal E-Commerce Integration](#8-the-multimodal-ai-chatbot)
9. [Security, Privacy, and Rate Limiting](#9-security-privacy-and-rate-limiting)
10. [Judge Presentation & Q&A Cheat Sheet](#10-judge-presentation--qa-cheat-sheet)

---

## 1. Executive Summary

### What is Skiné AI?
Skiné AI is an intelligent, privacy-first web application that acts as a **personal cosmetic dermatology assistant**. It allows users to take a selfie or upload a photo of their face to instantly receive a detailed scientific breakdown of their skin condition (skin type, hydration level, oiliness, surface texture, redness, and dark spots), complete with personalized skincare routines and Nepal-accessible product recommendations.

### Why Was It Built?
1. **Dermatology visits are expensive and inaccessible** for many people.
2. **Skincare products are confusing**: Consumers often waste money buying products with active ingredients that do not suit their skin barrier.
3. **Generic AI chatbots lack visual context**: Standard chatbots cannot see the user's skin. Skiné AI bridges this gap by combining **Computer Vision**, **Dermatological Colorimetry**, and **Multimodal Generative AI**.

---

## 2. High-Level Architecture

Here is how the entire system works in a simple step-by-step lifecycle:

```
[ User Browser / Phone ]
         │
         ▼  (Webcam Capture or Image Upload)
[ React SPA / Flask Frontend ]
         │
         ▼  (HTTP POST /analyze with Base64 Image)
[ Python Flask REST API Backend ]
         │
         ├──► [ Computer Vision Pipeline (OpenCV + Color Space Modeling) ]
         │         ├─ Step 1: Gray-World White Balance (Illumination Correction)
         │         ├─ Step 2: YCrCb + HSV Skin Segmentation
         │         ├─ Step 3: Facial ROI Extraction (Forehead, Cheeks, T-Zone)
         │         └─ Step 4: Metric Calculation (Oiliness, Dryness, Redness, Texture)
         │
         ├──► [ Google Gemini Multimodal AI Engine (Vision & Text Models) ]
         │         └─ Cross-validates metrics and generates clinical advice
         │
         ├──► [ Database Engine (PostgreSQL / Supabase or Local SQLite) ]
         │         └─ Saves scan results, routines, biomarkers, and user history
         │
         ▼
[ Instant Interactive Diagnostic Dashboard + Skiné AI Chatbot ]
```

---

## 3. Technology Stack

| Layer | Technologies Used | Why We Chose It |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, React Router v6, Bootstrap 5, Custom CSS Design System | Blazing fast Single Page Application (SPA), responsive on mobile and desktop, zero lag, earthy modern aesthetic. |
| **Server Fallback** | Python Flask Jinja2 Templates | Ensures the application can run seamlessly in lightweight SSR mode as well as standalone React SPA. |
| **Backend Framework**| Python 3, Flask, Werkzeug Security, Flask-CORS | Python is the gold-standard language for AI and Computer Vision libraries. Flask provides clean, fast REST API endpoints. |
| **Computer Vision** | OpenCV (`cv2`), NumPy | Hardware-accelerated image processing, color constancy algorithms, skin masking, and pixel-level texture analysis. |
| **Generative AI** | Google Gemini 3.5 Flash, Gemini 3.6, Gemini 3.7 | State-of-the-art multimodal vision and language model for fast, clinical-grade personalized skincare consultations. |
| **Database** | PostgreSQL (Supabase) in production / SQLite3 locally | Production uses cloud-hosted Postgres with connection pooling; SQLite provides instant zero-config local development. |
| **Hosting & CI/CD** | Vercel Serverless (`@vercel/python`), GitHub | Automatic continuous deployment on every `git push origin main`, global edge CDN delivery. |

---

## 4. Computer Vision & Skin Analysis Pipeline

*Judges love this section! This is the core engineering innovation of your project.*

When an image is submitted, it goes through a **4-stage Computer Vision pipeline**:

### Step 1: Illumination Normalization (Gray-World Color Constancy)
- **Problem**: Photos taken under yellow room lamps look reddish, while photos taken under blue LED lights look pale.
- **Solution**: We apply the **Gray-World White Balance algorithm**. It computes the mean RGB channels across the facial skin pixels and normalizes them toward neutral gray. This ensures reliable results regardless of the user's room lighting.

### Step 2: Multi-Color Space Skin Segmentation
- **Problem**: Background walls, clothing, eyes, and hair must not interfere with skin measurements.
- **Solution**: We convert the image into two separate color spaces:
  1. **YCrCb**: Separates brightness ($Y$) from chromatic red ($Cr$) and blue ($Cb$).
  2. **HSV**: Separates Hue ($H$), Saturation ($S$), and Value ($V$).
  - We create a bitwise logical mask to isolate only living skin tissue.

### Step 3: Facial Regions of Interest (ROI)
- The algorithm extracts key facial zones:
  - **Forehead & T-Zone**: Evaluated for excess sebum and pore congestion.
  - **Cheeks**: Evaluated for barrier dryness, redness, and fine texture.
  - **Cheekbones / Nose**: Evaluated for hyperpigmentation and UV photo-damage.

### Step 4: Mathematical Biomarker Scoring
1. **Oiliness / Sebum**: Measures high-intensity specular reflection clusters in the Value ($V$) channel.
2. **Dryness / Dehydration**: Analyzes micro-fissures and local pixel gradient standard deviation.
3. **Redness / Erythema**: Calculates the delta between red chromaticity ($Cr$ in YCrCb / $a^*$ in CIELAB) and baseline skin tone.
4. **Surface Texture**: Uses the **Laplacian Operator** and **GLCM (Gray-Level Co-occurrence Matrix)** variance to measure roughness vs smoothness.
5. **Pigmentation**: Detects localized melanin clusters where luminance drops significantly below the surrounding skin tone.

---

## 5. Database & Data Storage

### Where is data stored?
- **In Production (Vercel)**: Data is stored in a cloud **PostgreSQL database hosted on Supabase**.
- **In Local Development**: Data is stored in a local SQLite file named `skin_analysis.db`.

### How does the backend connect?
In `db.py`, the application uses an **adaptive connection layer**:
```python
def is_postgres():
    url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    return bool(url and url.startswith("postgres"))
```
- If a Postgres URL is found in environment variables, it uses `psycopg2` with SSL encryption.
- Otherwise, it falls back to Python's built-in `sqlite3`.

### Database Tables & Schema

#### 1. `users` Table
Stores registered accounts and login credentials.
- `id` (Primary Key, Auto-increment)
- `full_name` (User's display name)
- `email` (Unique email address)
- `password_hash` (PBKDF2 SHA-256 hashed password — *never plain text*)
- `role` (`user` or `admin`)
- `created_at` & `last_login`

#### 2. `scans` Table
Stores the results of every facial scan for trend tracking and history.
- `id` (Primary Key)
- `user_id` (Foreign key linking to `users.id`)
- `skin_type` (e.g. *Oily, Dry, Combination, Normal, Sensitive*)
- `overall_score` (Skin health index from 0 to 100%)
- `oiliness_level`, `dryness_level`, `redness_level`, `texture_level`, `pigmentation_level`
- `morning_routine` & `night_routine` (JSON arrays of routine steps)
- `recommended_ingredients` (JSON array of beneficial active ingredients)
- `things_to_avoid` (JSON array of ingredients that irritate this skin profile)
- `image_path` (Stored scan reference or secure base64 string)
- `created_at` (Timestamp)

#### 3. `feedback` Table
Stores user reviews, ratings (1 to 5 stars), category, and feedback messages.

#### 4. `chat_quotas` Table
Tracks rate limits (up to 350 messages per 24 hours per user account) to protect API resources.

### How is data fetched?
When a user visits `/dashboard` or `/history`:
1. The user's active session is verified via `session["user_id"]` or JWT/Cookie.
2. The database executes:
   ```sql
   SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10;
   ```
3. The latest scan data is parsed into JSON and injected into the dashboard charts, characteristic cards, and the AI chatbot context.

---

## 6. Backend API & How Requests Work

| Method | Route | Purpose | Input / Payload | Output |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/analyze` | Performs Computer Vision scan on face | Image base64 string or file upload | Full JSON scan report (skin type, scores, routines, ingredients) |
| `POST` | `/api/chat` | Skiné AI Chatbot consultation | User message, optional attached image, chat history | AI reply with markdown formatting & Nepal product links |
| `POST` | `/login` | Authenticates user | `email`, `password` | Session cookie + user object |
| `POST` | `/register`| Creates new user profile | `full_name`, `email`, `password` | Account created + auto-login |
| `GET` | `/dashboard`| Retrieves summary metrics | Session ID | Total scans, skin trajectory, latest scan biomarkers |
| `GET` | `/history` | Retrieves scan logs | Session ID | List of all past scans with dates and scores |
| `POST` | `/feedback`| Submits star rating & review | `rating`, `category`, `message` | Feedback saved confirmation |

---

## 7. Frontend & User Experience

1. **Clean SVG Vector Icons**: All emojis have been replaced with crisp 24×24 SVG line art for a medical-grade, clean visual standard.
2. **Adaptive CTA Buttons**:
   - When **logged out**, the home page CTA buttons say *"Let's Start"* and guide users to sign in.
   - When **logged in**, the CTA buttons say *"Start AI Scan"* and take users straight to `/scanner`.
3. **Resizing & Maximizing Chat Panel**:
   - Drag any edge or corner to resize the chat box.
   - Click the Maximize button (`fa-expand`) to enter widescreen consultation mode.
4. **Dynamic Skin Health Score**: Shows a percentage score with color-coded badges and radar charts.

---

## 8. The Multimodal AI Chatbot

### How the Chatbot Thinks
When a user asks a question, the backend automatically injects the user's **facial biomarkers into the Gemini AI system prompt**:
```
User Skin Type: Combination
Health Index: 92%
Sebum Level: High
Hydration: Moderate
Active Ingredients to Recommend: Niacinamide, Salicylic Acid, Ceramides
```
Because the AI already knows the user's skin biomarkers, it gives **personalized clinical answers immediately without asking repetitive questions**.

### 🇳🇵 Nepal E-Commerce Integration
The chatbot is explicitly programmed to suggest products that are **accessible and purchasable in Nepal**:
- Mentions popular Nepal-available brands: *CeraVe, Cetaphil, Minimalist, The Ordinary, Cosrx, La Roche-Posay, The Derma Co, Sebamed, Neutrogena*.
- Generates clickable markdown hyperlinks directly to:
  - **Daraz Nepal**: `[Product Name on Daraz Nepal](https://www.daraz.com.np/catalog/?q=Product+Name)`
  - **Jeevee Health Nepal**: `[Product Name on Jeevee](https://www.jeevee.com/search?q=Product+Name)`

### 🖼️ Multimodal Image Analysis (Upload & Paste)
- Users can click the image icon or press **`Ctrl + V`** to paste a photo of any cosmetic bottle or ingredient label.
- The Gemini AI transcribes the visible ingredients on the bottle, flags comedogenic or irritating ingredients, and confirms whether the product is safe for the user's specific skin type.

---

## 9. Security, Privacy, and Rate Limiting

1. **Password Security**: Passwords are never stored in plain text. They are hashed using **PBKDF2 SHA-256 with 50,000 salt iterations**.
2. **Session Security**: Cookies are configured with `HttpOnly`, `SameSite=Lax`, and secret key encryption.
3. **Photo Privacy**: Photos are processed in memory and encrypted storage. Images are never shared or sold to third parties.
4. **Rate Limiting Protection**: Free usage is protected by a rolling 24-hour quota of **350 messages per account**, preventing API cost overruns.

---

## 10. Judge Presentation & Q&A Cheat Sheet

*Read these bullet points before stepping up to present to the judges!*

### 30-Second Elevator Pitch:
> *"Skiné AI is an AI-powered cosmetic dermatology platform. By combining computer vision color constancy algorithms with Google Gemini multimodal intelligence, Skiné AI analyzes a user's facial skin in seconds to identify skin type, oiliness, hydration, and redness. It provides tailored morning/night routines and interactive chatbot consultations with direct links to products available on Daraz and Jeevee in Nepal."*

---

### Potential Questions Judges Might Ask & How to Answer:

#### Q1: "Is this a medical diagnostic tool or compliant with medical regulations?"
**Answer:**  
> *"Skiné AI is designed for **cosmetic and informational skincare guidance**. We include clear medical disclaimers informing users that persistent dermatological conditions (like cystic acne, melanoma, or severe dermatitis) require a certified dermatologist. Our goal is to democratize everyday skincare formulation literacy."*

#### Q2: "How does your system handle different skin tones and lighting conditions?"
**Answer:**  
> *"We implemented the **Gray-World Color Constancy algorithm**, which neutralizes warm tungsten or cool daylight room lighting before analysis. For skin tones across the Fitzpatrick scale, our algorithm measures redness, pigmentation, and oiliness relative to the individual's baseline skin tone rather than using absolute static thresholds."*

#### Q3: "What happens if the Gemini AI API goes offline or the internet is slow?"
**Answer:**  
> *"The platform is built with a **robust dual-engine architecture**. If the external Gemini API is unreachable, our local Python rule-based formulation engine immediately takes over and generates the full biomarker report and routine recommendations without failing."*

#### Q4: "Where is the user's data stored, and how do you protect their privacy?"
**Answer:**  
> *"User credentials and scan records are stored in an encrypted **PostgreSQL database on Supabase** with SSL. Passwords use PBKDF2 hashing with 50,000 rounds. Uploaded photos are processed securely in temporary memory for feature extraction and are never shared or sold."*

#### Q5: "How is this better than simply asking ChatGPT for skincare advice?"
**Answer:**  
> *"ChatGPT has no eyes and cannot inspect your actual skin. Skiné AI extracts real mathematical pixel biomarkers (sebum reflection, texture roughness, erythema delta), saves your skin trajectory over time in a dashboard, and automatically pairs recommendations with store links for Nepal on Daraz and Jeevee."*

---

### Quick Feature Checklist to Demonstrate Live:
1. **Live Webcam / Selfie Scan**: Show the face capture on `/scanner` and reveal the Health Score & Biomarker Radar.
2. **Dashboard Trajectory**: Show the health score trend, characteristic cards, and daily routine checklist.
3. **Chatbot Multimodal Paste**: Copy a photo of a cleanser or moisturizer bottle, press `Ctrl + V` in the chat, and show the AI analyzing the ingredients.
4. **Clickable Nepal Links**: Ask *"Where can I buy a gentle cleanser in Nepal?"* and show the clickable Daraz Nepal / Jeevee links.
5. **Footer Instagram Link**: Point out the clean SVG Instagram link to `@_skine05`.

---
*Documentation prepared for Skiné AI • All systems tested and operational.*
