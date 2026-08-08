from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import base64
import cv2
import numpy as np

app = Flask(__name__)
app.secret_key = "skin_analysis_ai"

# ---------------- HOME ----------------
@app.route("/")
def index():
    return render_template("index.html")


# ---------------- LOGIN ----------------
@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        session["user_email"] = request.form.get("email")

        return redirect(url_for("scanner"))

    return render_template("login.html")


# ---------------- REGISTER ----------------
@app.route("/register")
def register():
    return render_template("register.html")


# ---------------- DASHBOARD ----------------
@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

# ---------------- PROFILE ----------------

@app.route("/profile")
def profile():

    user = {

        "name": "Aastha",

        "email": "user@skinai.com",

        "skin_type": "Oily",

        "score": "92%",

        "last_scan": "22 July 2026"

    }

    return render_template("profile.html", user=user)

# ---------------- NOTIFICATIONS ----------------

@app.route("/notifications")
def notifications():

    notifications = [

        {
            "icon": "fa-solid fa-camera",
            "title": "Skin Analysis Completed",
            "message": "Your latest skin scan report is ready.",
            "time": "Today"
        },

        {
            "icon": "fa-solid fa-sun",
            "title": "Sunscreen Reminder",
            "message": "Don't forget to apply SPF 50 sunscreen.",
            "time": "2 hours ago"
        },

        {
            "icon": "fa-solid fa-droplet",
            "title": "Hydration Tip",
            "message": "Drink enough water to maintain healthy skin.",
            "time": "Yesterday"
        }

    ]


    return render_template(
        "notifications.html",
        notifications=notifications
    )

# ---------------- FEEDBACK ----------------

@app.route("/feedback")
def feedback():

    feedbacks = [

        {
            "name": "Aarav",
            "rating": "⭐⭐⭐⭐⭐",
            "message": "AI skin analysis was very helpful."
        },

        {
            "name": "User",
            "rating": "⭐⭐⭐⭐",
            "message": "Recommendations were useful."
        }

    ]


    return render_template(
        "feedback.html",
        feedbacks=feedbacks
    )
# ---------------- ADMIN DASHBOARD ----------------

@app.route("/admin")
def admin():

    stats = {

        "users": 250,

        "scans": 890,

        "score": "91%",

        "feedback": 120

    }


    activities = [

        {
            "user":"Aastha",
            "skin":"Oily",
            "condition":"Mild Acne",
            "date":"22 July 2026"
        },

        {
            "user":"Rahul",
            "skin":"Dry",
            "condition":"Healthy",
            "date":"21 July 2026"
        },

        {
            "user":"Priya",
            "skin":"Combination",
            "condition":"Dark Spots",
            "date":"20 July 2026"
        }

    ]


    return render_template(
        "admin.html",
        stats=stats,
        activities=activities
    )

# ---------------- SCANNER ----------------
@app.route("/scanner")
def scanner():
    return render_template("scanner.html")

# ---------------- ANALYZE ----------------

@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    image_data = data["image"]

    # Remove base64 header
    image_data = image_data.split(",")[1]

    # Decode image
    image_bytes = base64.b64decode(image_data)

    np_array = np.frombuffer(image_bytes, np.uint8)

    frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)


    print("Image received:", frame.shape)


    # Temporary Rule Based Result

    result = {

        "skin_type": "Oily",

        "oiliness": "High",

        "dryness": "Low",

        "texture": "Smooth",

        "redness": "Low",

        "blemishes": "Mild"

    }

    session["analysis_result"] = result
    return jsonify(result)

# ---------------- RESULT ----------------

@app.route("/result")
def result():

    result = session.get("analysis_result")


    if result is None:

        result = {

            "skin_type":"Unknown",

            "oiliness":"-",

            "dryness":"-",

            "texture":"-",

            "redness":"-",

            "blemishes":"-",

            "recommendation":[

                "Start a skin scan first"

            ]

        }


    result["recommendation"] = [

        "Use Gentle Face Wash",

        "Apply Niacinamide Serum",

        "Use SPF 50 Sunscreen",

        "Drink Plenty of Water"

    ]


    return render_template("result.html", result=result)
# ---------------- HISTORY ----------------
@app.route("/history")
def history():

    history = [
        {
            "date": "22 July 2026",
            "skin": "Oily",
            "condition": "Mild Acne"
        },
        {
            "date": "20 July 2026",
            "skin": "Combination",
            "condition": "Healthy"
        }
    ]

    return render_template("history.html", history=history)


# ---------------- START ----------------
if __name__ == "__main__":
    app.run(debug=True)