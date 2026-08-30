import os
import uuid
import base64
from functools import wraps
from datetime import datetime
from dotenv import load_dotenv
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
    redirect,
    url_for,
    flash,
    g,
    send_from_directory,
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

from models.skin_analysis import analyze_skin_image
from db import (
    init_db,
    close_db,
    get_user_by_email,
    get_user_by_id,
    create_user,
    update_user_profile,
    update_last_login,
    get_user_full_profile,
    save_skin_scan,
    get_scan_by_id,
    get_latest_user_scan,
    get_user_scans,
    get_user_dashboard_stats,
    get_user_notifications,
    mark_notifications_as_read,
    add_feedback,
    get_all_feedback,
    get_admin_dashboard_data,
)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "sk_skin_analysis_ai_secret_key_2026_9837a28")


@app.teardown_appcontext
def teardown_db(exception=None):
    close_db(exception)


# Setup base upload directories (using /tmp on Vercel)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if os.environ.get("VERCEL"):
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")

SCANS_DIR = os.path.join(UPLOAD_DIR, "scans")
CROPS_DIR = os.path.join(UPLOAD_DIR, "crops")

os.makedirs(SCANS_DIR, exist_ok=True)
os.makedirs(CROPS_DIR, exist_ok=True)

# Initialize database schema and default seeds on startup
try:
    init_db()
    print("Database initialized successfully.")
except Exception as e:
    print(f"Database initialization note: {e}")


@app.route("/static/uploads/<path:filename>")
def serve_uploads(filename):
    if os.environ.get("VERCEL"):
        return send_from_directory("/tmp/uploads", filename)
    return send_from_directory(os.path.join(BASE_DIR, "static", "uploads"), filename)


# ====================================================================
# CONTEXT PROCESSOR & AUTH HELPERS
# ====================================================================

@app.context_processor
def inject_user_context():
    """Make user info and unread notification count globally accessible in templates."""
    user = None
    unread_notifications = 0
    if "user_id" in session:
        user = get_user_by_id(session["user_id"])
        if user:
            notifications = get_user_notifications(session["user_id"])
            unread_notifications = sum(1 for n in notifications if not n.get("is_read"))
    return {
        "current_user": user,
        "is_authenticated": user is not None,
        "unread_notifications_count": unread_notifications,
    }


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please sign in to access this page.", "warning")
            return redirect(url_for("login", next=request.url))
        return f(*args, **kwargs)
    return decorated_function


# ====================================================================
# HOME
# ====================================================================

@app.route("/")
def index():
    return render_template("index.html")


# ====================================================================
# AUTHENTICATION (LOGIN, REGISTER, LOGOUT)
# ====================================================================

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        is_json = request.is_json
        data = request.get_json() if is_json else request.form

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            if is_json:
                return jsonify({"success": False, "message": "Please enter both email and password."}), 400
            flash("Please enter both email and password.", "danger")
            return render_template("login.html")

        user = get_user_by_email(email)

        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            session["user_name"] = user["full_name"]
            session["user_email"] = user["email"]
            session["user_role"] = user["role"]

            update_last_login(user["id"])

            if is_json:
                return jsonify({
                    "success": True,
                    "message": f"Welcome back, {user['full_name']}!",
                    "user": {
                        "id": user["id"],
                        "full_name": user["full_name"],
                        "email": user["email"],
                        "role": user.get("role", "user"),
                        "skin_type": user.get("skin_type", "Normal")
                    }
                })

            flash(f"Welcome back, {user['full_name']}!", "success")
            next_page = request.args.get("next")
            return redirect(next_page or url_for("dashboard"))
        else:
            if is_json:
                return jsonify({"success": False, "message": "Invalid email or password. Please try again."}), 401
            flash("Invalid email or password. Please try again.", "danger")

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        is_json = request.is_json
        data = request.get_json() if is_json else request.form

        full_name = (data.get("full_name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        confirm_password = data.get("confirm_password") or password

        if not full_name or not email or not password:
            if is_json:
                return jsonify({"success": False, "message": "All fields are required."}), 400
            flash("All fields are required.", "danger")
            return render_template("register.html")

        if password != confirm_password:
            if is_json:
                return jsonify({"success": False, "message": "Passwords do not match."}), 400
            flash("Passwords do not match.", "danger")
            return render_template("register.html")

        if len(password) < 6:
            if is_json:
                return jsonify({"success": False, "message": "Password must be at least 6 characters long."}), 400
            flash("Password must be at least 6 characters long.", "danger")
            return render_template("register.html")

        existing_user = get_user_by_email(email)
        if existing_user:
            if is_json:
                return jsonify({"success": False, "message": "An account with this email already exists."}), 409
            flash("An account with this email already exists. Please login.", "warning")
            return redirect(url_for("login"))

        password_hash = generate_password_hash(password, method="pbkdf2:sha256:50000")
        try:
            user_id = create_user(full_name, email, password_hash)
            session["user_id"] = user_id
            session["user_name"] = full_name
            session["user_email"] = email
            session["user_role"] = "user"

            user_obj = {
                "id": user_id,
                "full_name": full_name,
                "email": email,
                "role": "user",
                "skin_type": "Normal"
            }

            if is_json:
                return jsonify({
                    "success": True,
                    "message": "Account created successfully! Welcome to Skiné.",
                    "user": user_obj
                })

            flash("Account created successfully! Welcome to Skiné.", "success")
            return redirect(url_for("dashboard"))
        except Exception as e:
            if is_json:
                return jsonify({"success": False, "message": f"Registration error: {str(e)}"}), 500
            flash(f"Registration error: {str(e)}", "danger")

    return render_template("register.html")


@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    if request.is_json:
        return jsonify({"success": True, "message": "You have been signed out."})
    flash("You have been signed out.", "info")
    return redirect(url_for("login"))



@app.route("/api/me")
def api_me():
    user_id = session.get("user_id")
    if user_id:
        user = get_user_by_id(user_id)
        if user:
            notifications = get_user_notifications(user_id)
            unread_count = sum(1 for n in notifications if not n.get("is_read"))
            return jsonify({
                "user": {
                    "id": user["id"],
                    "full_name": user["full_name"],
                    "email": user["email"],
                    "role": user.get("role", "user"),
                },
                "unread_count": unread_count,
            })
    return jsonify({"user": None, "unread_count": 0})


# ====================================================================
# DASHBOARD
# ====================================================================

@app.route("/dashboard")
def dashboard():
    user_id = session.get("user_id")

    if user_id:
        stats = get_user_dashboard_stats(user_id)
        latest_scan = stats.get("latest_scan")
        total_scans = stats.get("total_scans", 0)
        scans_list = get_user_scans(user_id) or []
    else:
        latest_scan = None
        total_scans = 0
        scans_list = []

    # Prepare historical chart data in chronological order
    chart_labels = [s.get("display_date", "") for s in reversed(scans_list)]
    chart_scores = [int(s.get("overall_score", 0)) for s in reversed(scans_list)]

    # Determine personalized daily tips based on latest skin type
    if latest_scan and latest_scan.get("skin_type"):
        skin_type = latest_scan.get("skin_type")
    else:
        skin_type = "Not Scanned Yet"
    
    tips = [
        "Wash your face twice daily with a gentle, non-stripping cleanser.",
        "Apply broad-spectrum SPF 50 sunscreen every morning.",
        "Drink at least 2.5L of water daily to maintain skin barrier hydration.",
    ]

    if skin_type == "Oily":
        tips.append("Use Niacinamide or Salicylic Acid to balance sebum production.")
    elif skin_type == "Dry":
        tips.append("Apply a ceramide-rich moisturizer immediately after cleansing.")
    elif skin_type == "Combination":
        tips.append("Use lightweight hydration on T-zone and richer cream on dry cheek areas.")
    else:
        tips.append("Complete your first AI scan to unlock tailored active ingredient advice.")

    return render_template(
        "dashboard.html",
        latest_scan=latest_scan,
        total_scans=total_scans,
        skin_type=skin_type,
        chart_labels=chart_labels,
        chart_scores=chart_scores,
        tips=tips,
    )


# ====================================================================
# PROFILE
# ====================================================================

@app.route("/profile", methods=["GET", "POST"])
def profile():
    user_id = session.get("user_id")

    if not user_id:
        # Fallback view for guest or redirect to login
        demo_user = {
            "full_name": "Aastha Sharma",
            "email": "user@skinai.com",
            "skin_type": "Oily",
            "score": "88.5%",
            "last_scan": "Today",
            "allergies": "None",
            "notes": "Sample demo profile",
            "gender": "Female",
            "date_of_birth": "1998-05-14"
        }
        latest_scan = get_scan_by_id(1)
        return render_template("profile.html", user=demo_user, latest_scan=latest_scan, is_guest=True)

    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        skin_type = request.form.get("skin_type")
        date_of_birth = request.form.get("date_of_birth")
        gender = request.form.get("gender")
        allergies = request.form.get("allergies")
        notes = request.form.get("notes")

        update_user_profile(user_id, full_name, skin_type, date_of_birth, gender, allergies, notes)
        session["user_name"] = full_name
        flash("Profile updated successfully!", "success")
        return redirect(url_for("profile"))

    user_profile = get_user_full_profile(user_id)
    latest_scan = get_latest_user_scan(user_id)

    # Format user score and last scan
    if user_profile:
        user_profile["score"] = f"{latest_scan['overall_score']}%" if latest_scan and latest_scan.get("overall_score") else "N/A"
        user_profile["last_scan"] = latest_scan.get("display_date", "No scans yet") if latest_scan else "No scans yet"
        user_profile["name"] = user_profile.get("full_name")

    return render_template("profile.html", user=user_profile, latest_scan=latest_scan, is_guest=False)


# ====================================================================
# NOTIFICATIONS
# ====================================================================

@app.route("/notifications")
def notifications():
    user_id = session.get("user_id")
    if user_id:
        notif_list = get_user_notifications(user_id)
        mark_notifications_as_read(user_id)
    else:
        notif_list = [
            {
                "icon": "fa-solid fa-camera",
                "title": "Skin Analysis Ready",
                "message": "Welcome to Skiné! Complete your first skin scan to see real-time alerts.",
                "time_ago": "Just now",
            },
            {
                "icon": "fa-solid fa-sun",
                "title": "Sunscreen Reminder",
                "message": "Don't forget to apply SPF 50 sunscreen daily.",
                "time_ago": "2 hours ago",
            },
            {
                "icon": "fa-solid fa-droplet",
                "title": "Hydration Tip",
                "message": "Drink water to maintain skin hydration and elasticity.",
                "time_ago": "Today",
            },
        ]

    return render_template("notifications.html", notifications=notif_list)


# ====================================================================
# FEEDBACK
# ====================================================================

@app.route("/feedback", methods=["GET", "POST"])
def feedback():
    if request.method == "POST":
        rating = request.form.get("rating", 5)
        message = request.form.get("message", "").strip()

        if not message:
            flash("Please enter a feedback message.", "warning")
        else:
            user_id = session.get("user_id")
            add_feedback(user_id, rating, message)
            flash("Thank you for your feedback! Your review has been submitted.", "success")
            return redirect(url_for("feedback"))

    feedbacks = get_all_feedback()
    return render_template("feedback.html", feedbacks=feedbacks)


# ====================================================================
# ADMIN DASHBOARD
# ====================================================================

@app.route("/admin")
def admin():
    stats, activities = get_admin_dashboard_data()
    return render_template("admin.html", stats=stats, activities=activities)


# ====================================================================
# SCANNER & AI ANALYSIS
# ====================================================================

@app.route("/scanner")
def scanner():
    return render_template("scanner.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        scan_uid = uuid.uuid4().hex[:10]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"scan_{timestamp}_{scan_uid}.jpg"
        image_path = os.path.join(SCANS_DIR, image_filename)

        # 1. Handle base64 payload or file upload
        if request.is_json and "image" in request.get_json():
            image_data = request.get_json()["image"]
            if "," in image_data:
                image_data = image_data.split(",")[1]
            image_bytes = base64.b64decode(image_data)
            with open(image_path, "wb") as f:
                f.write(image_bytes)

        elif "image_file" in request.files:
            file = request.files["image_file"]
            if file.filename == "":
                return jsonify({"success": False, "message": "No file selected."}), 400
            file.save(image_path)

        else:
            return jsonify({"success": False, "message": "No image data provided."}), 400

        # 2. Run Computer Vision Skin Analysis
        crops_subfolder = f"crop_{timestamp}_{scan_uid}"
        crop_output_dir = os.path.join(CROPS_DIR, crops_subfolder)
        os.makedirs(crop_output_dir, exist_ok=True)

        result = analyze_skin_image(image_path, output_dir=crop_output_dir)

        if not result.get("success"):
            return jsonify({
                "success": False,
                "message": result.get("message", "Face could not be detected. Please ensure good lighting and look straight at the camera.")
            }), 400

        # Relative paths for web serving and database storage
        image_paths = {
            "original": f"uploads/scans/{image_filename}",
            "face": f"uploads/crops/{crops_subfolder}/{result.get('cropped_face', 'cropped_face.jpg')}",
            "forehead": f"uploads/crops/{crops_subfolder}/{result.get('forehead', 'forehead.jpg')}",
            "left_cheek": f"uploads/crops/{crops_subfolder}/{result.get('left_cheek', 'left_cheek.jpg')}",
            "right_cheek": f"uploads/crops/{crops_subfolder}/{result.get('right_cheek', 'right_cheek.jpg')}",
        }
        result["image_paths"] = image_paths

        # 3. Save to database if user is logged in (or default user)
        user_id = session.get("user_id")
        scan_id = None
        if user_id:
            scan_id = save_skin_scan(user_id, result, image_paths)
            result["scan_id"] = scan_id

        session["analysis_result"] = result

        redirect_url = url_for("result", id=scan_id) if scan_id else url_for("result")
        return jsonify({
            "success": True,
            "message": "Analysis completed successfully.",
            "redirect": redirect_url,
            "result": result
        })

    except Exception as e:
        print(f"Error in /analyze: {e}")
        return jsonify({"success": False, "message": f"Server error during analysis: {str(e)}"}), 500


# ====================================================================
# RESULT
# ====================================================================

@app.route("/result")
def result():
    scan_id = request.args.get("id")
    result_data = None

    if scan_id:
        try:
            result_data = get_scan_by_id(int(scan_id))
        except Exception:
            result_data = None

    if result_data is None:
        result_data = session.get("analysis_result")

    if result_data is None:
        user_id = session.get("user_id")
        if user_id:
            result_data = get_latest_user_scan(user_id)
        if not result_data:
            result_data = get_scan_by_id(1)

    if result_data is None:
        ingredients_sample = [{"ingredient": "Hyaluronic Acid", "reason": "Deep barrier hydration"}, {"ingredient": "Ceramides", "reason": "Barrier protection"}, {"ingredient": "SPF 50 Sunscreen", "reason": "UV Defense"}]
        try:
            from models.recommendations import get_product_recommendations
            fallback_products = get_product_recommendations(ingredients_sample)
        except Exception:
            fallback_products = []

        result_data = {
            "skin_type": "Unknown",
            "overall_score": 85.0,
            "overall_condition": "No Scan Performed",
            "oiliness_level": "Moderate",
            "dryness_level": "Low",
            "texture_level": "Smooth",
            "redness_level": "Low",
            "pigmentation_level": "Low",
            "recommendations": ["Perform a live skin scan to receive tailored skincare steps."],
            "morning_routine": ["Gentle Cleanser", "SPF 50 Sunscreen"],
            "night_routine": ["Double Cleanse", "Moisturizer"],
            "recommended_ingredients": ingredients_sample,
            "product_recommendations": fallback_products,
            "things_to_avoid": ["Harsh scrubbing"],
            "possible_causes": ["Environmental exposure"],
            "lifestyle_suggestions": ["Drink at least 2L of water daily"]
        }

    return render_template("result.html", result=result_data)


# ====================================================================
# HISTORY
# ====================================================================

@app.route("/history")
def history():
    user_id = session.get("user_id")
    if user_id:
        scans = get_user_scans(user_id)
    else:
        # Fallback to demo scans for guest
        demo_scan = get_scan_by_id(1)
        scans = [
            {
                "id": demo_scan["id"] if demo_scan else 1,
                "display_date": demo_scan.get("display_date", "Today") if demo_scan else "Today",
                "skin_type": demo_scan.get("skin_type", "Oily") if demo_scan else "Oily",
                "overall_condition": demo_scan.get("overall_condition", "Healthy") if demo_scan else "Healthy",
                "overall_score": demo_scan.get("overall_score", 88.5) if demo_scan else 88.5,
                "status": "completed",
            }
        ] if demo_scan else []

    return render_template("history.html", history=scans)


# ====================================================================
# START APPLICATION
# ====================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)