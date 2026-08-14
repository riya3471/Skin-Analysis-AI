import os
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "skin_analysis.db")


def get_db_path():
    if os.environ.get("VERCEL"):
        return "/tmp/skin_analysis.db"
    db_env = os.environ.get("DATABASE_PATH", "skin_analysis.db")
    if not os.path.isabs(db_env):
        return os.path.join(BASE_DIR, db_env)
    return db_env


def get_db_connection():
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(schema_file=None):
    """Initialize database tables and views from schema.sql and seed sample data if empty."""
    if schema_file is None:
        schema_file = os.path.join(BASE_DIR, "schema.sql")

    if not os.path.exists(schema_file):
        raise FileNotFoundError(f"Schema file not found at {schema_file}")

    with open(schema_file, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = get_db_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()

    seed_initial_data()


def seed_initial_data():
    """Seed default demo accounts, sample feedback, and notifications if database is empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Check if users already exist
        cursor.execute("SELECT COUNT(*) AS count FROM users")
        user_count = cursor.fetchone()["count"]

        if user_count == 0:
            # Seed Admin User
            admin_hash = generate_password_hash("admin123")
            cursor.execute(
                """
                INSERT INTO users (full_name, email, password_hash, role, created_at, updated_at)
                VALUES (?, ?, ?, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
                ("Skiné Admin", "admin@skinai.com", admin_hash),
            )
            admin_id = cursor.lastrowid

            # Seed Standard Demo User
            user_hash = generate_password_hash("password123")
            cursor.execute(
                """
                INSERT INTO users (full_name, email, password_hash, role, created_at, updated_at)
                VALUES (?, ?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
                ("Aastha Sharma", "user@skinai.com", user_hash),
            )
            demo_user_id = cursor.lastrowid

            # Seed Profile for Demo User
            cursor.execute(
                """
                INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes)
                VALUES (?, 'Oily', '1998-05-14', 'Female', 'None', 'Prone to oily T-zone in humid weather')
            """,
                (demo_user_id,),
            )

            # Seed Profile for Admin User
            cursor.execute(
                """
                INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes)
                VALUES (?, 'Normal', '1995-10-20', 'Female', 'Fragrance', 'System administrator')
            """,
                (admin_id,),
            )

            # Seed Demo Scans for Demo User
            cursor.execute(
                """
                INSERT INTO skin_scans (
                    user_id, status, face_detected,
                    skin_type, overall_condition, overall_score,
                    forehead_brightness, cheek_brightness, brightness_difference,
                    forehead_saturation, shiny_percentage, oiliness_score, oiliness_level,
                    left_texture, right_texture, texture_score, texture_level,
                    dryness_score, dryness_level,
                    left_redness, right_redness, redness_score, redness_level,
                    pigmentation_percentage, tone_variation, pigmentation_score, pigmentation_level,
                    created_at
                ) VALUES (
                    ?, 'completed', 1,
                    'Oily', 'Mild Acne & Excess Sebum', 88.5,
                    158.2, 142.6, 15.6,
                    72.4, 18.5, 28.5, 'High',
                    145.2, 150.8, 148.0, 'Medium Detail',
                    22.0, 'Low',
                    18.2, 19.5, 18.8, 'Low',
                    12.4, 14.2, 24.8, 'Low',
                    CURRENT_TIMESTAMP
                )
            """,
                (demo_user_id,),
            )
            demo_scan_id = cursor.lastrowid

            # Seed Scan Recommendations for Demo Scan
            demo_recs = [
                ("recommendation", "Use a lightweight salicylic acid or gentle foaming cleanser daily.", None, 1),
                ("recommendation", "Incorporate Niacinamide serum in your morning routine to balance sebum.", None, 2),
                ("recommendation", "Always protect with broad-spectrum SPF 50 sunscreen.", None, 3),
                ("ingredient", "Niacinamide", "Regulates excess sebum production and minimizes appearance of pores.", 1),
                ("ingredient", "Salicylic Acid", "Gently exfoliates dead cells and unclogs congested pores.", 2),
                ("ingredient", "Hyaluronic Acid", "Provides lightweight hydration without adding surface oiliness.", 3),
                ("avoid", "Heavy oil-based comedogenic creams and coconut oil formulations.", None, 1),
                ("avoid", "Over-cleansing or harsh alcohol-based astringents that strip natural moisture.", None, 2),
                ("morning_routine", "Cleanse face with gentle gel cleanser", None, 1),
                ("morning_routine", "Apply 2-3 drops of 10% Niacinamide Serum", None, 2),
                ("morning_routine", "Apply lightweight oil-free gel moisturizer", None, 3),
                ("morning_routine", "Finish with matte finish SPF 50 Sunscreen", None, 4),
                ("night_routine", "Double cleanse to remove sunscreen & daily pollution", None, 1),
                ("night_routine", "Apply Salicylic Acid BHA treatment (2-3 times/week)", None, 2),
                ("night_routine", "Seal with lightweight barrier repairing moisturizer", None, 3),
                ("possible_cause", "Overactive sebaceous glands responding to hormonal or climate triggers.", None, 1),
                ("possible_cause", "Humidity and warm environmental conditions increasing sebum secretion.", None, 2),
                ("lifestyle", "Drink at least 2.5L of water daily to maintain skin hydration balance.", None, 1),
                ("lifestyle", "Change pillowcases weekly to prevent bacterial transfer to facial skin.", None, 2)
            ]
            cursor.executemany(
                """
                INSERT INTO scan_recommendations (scan_id, category, text, reason, step_order)
                VALUES (?, ?, ?, ?, ?)
            """,
                [(demo_scan_id, cat, text, reason, step) for cat, text, reason, step in demo_recs],
            )

            # Seed Initial Notifications for Demo User
            notifications = [
                (demo_user_id, "fa-solid fa-camera", "Skin Analysis Completed", "Your latest skin analysis report (Oily Skin, 88.5% health score) is ready.", 0),
                (demo_user_id, "fa-solid fa-sun", "Sunscreen Reminder", "Remember to apply broad-spectrum SPF 50 sunscreen before going outdoors.", 0),
                (demo_user_id, "fa-solid fa-droplet", "Hydration Tip", "Drink plenty of water today to keep your skin hydrated and balanced.", 1)
            ]
            cursor.executemany(
                """
                INSERT INTO notifications (user_id, icon, title, message, is_read)
                VALUES (?, ?, ?, ?, ?)
            """,
                notifications,
            )

            # Seed Initial Feedback
            feedbacks = [
                (demo_user_id, 5, "The AI skin scan was remarkably fast and accurate! The recommended Niacinamide routine really helped with my oily T-zone."),
                (None, 5, "Clean interface and the morning/night routine recommendations are very structured and practical."),
                (None, 4, "Loved the computer vision face region analysis. Very intuitive skin report!")
            ]
            cursor.executemany(
                """
                INSERT INTO feedback (user_id, rating, message)
                VALUES (?, ?, ?)
            """,
                feedbacks,
            )

            conn.commit()
    finally:
        conn.close()


# ====================================================================
# USER & PROFILE HELPERS
# ====================================================================

def get_user_by_email(email):
    conn = get_db_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),)).fetchone()
        return dict(user) if user else None
    finally:
        conn.close()


def get_user_by_id(user_id):
    conn = get_db_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(user) if user else None
    finally:
        conn.close()


def create_user(full_name, email, password_hash, role="user"):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """,
            (full_name.strip(), email.strip().lower(), password_hash, role),
        )
        user_id = cursor.lastrowid

        # Automatically create profile entry
        cursor.execute(
            """
            INSERT INTO user_profiles (user_id, skin_type)
            VALUES (?, 'Normal')
        """,
            (user_id,),
        )

        # Create welcome notification
        cursor.execute(
            """
            INSERT INTO notifications (user_id, icon, title, message)
            VALUES (?, 'fa-solid fa-sparkles', 'Welcome to Skiné!', 'Start your first AI skin scan to receive personalized recommendations.')
        """,
            (user_id,),
        )

        conn.commit()
        return user_id
    finally:
        conn.close()


def update_last_login(user_id):
    conn = get_db_connection()
    try:
        conn.execute("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()


def get_user_full_profile(user_id):
    conn = get_db_connection()
    try:
        row = conn.execute(
            """
            SELECT u.id, u.full_name, u.email, u.role, u.profile_image, u.created_at, u.last_login_at,
                   p.skin_type, p.date_of_birth, p.gender, p.allergies, p.notes
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
        """,
            (user_id,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def update_user_profile(user_id, full_name, skin_type=None, date_of_birth=None, gender=None, allergies=None, notes=None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (full_name, user_id))
        
        # Check if profile row exists
        existing = cursor.execute("SELECT id FROM user_profiles WHERE user_id = ?", (user_id,)).fetchone()
        if existing:
            cursor.execute(
                """
                UPDATE user_profiles
                SET skin_type = ?, date_of_birth = ?, gender = ?, allergies = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """,
                (skin_type, date_of_birth, gender, allergies, notes, user_id),
            )
        else:
            cursor.execute(
                """
                INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            """,
                (user_id, skin_type, date_of_birth, gender, allergies, notes),
            )

        conn.commit()
    finally:
        conn.close()


# ====================================================================
# SKIN SCAN HELPERS
# ====================================================================

def save_skin_scan(user_id, scan_data, image_paths=None):
    """Save an AI scan result and its recommendations into database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if image_paths is None:
        image_paths = {}

    try:
        skin_type = scan_data.get("skin_type", "Unknown")
        overall_condition = scan_data.get("overall_condition", "Analyzed")
        overall_score = scan_data.get("overall_score", 85.0)

        cursor.execute(
            """
            INSERT INTO skin_scans (
                user_id, status, face_detected, error_message,
                original_image_path, face_image_path, forehead_image_path,
                left_cheek_image_path, right_cheek_image_path,
                skin_type, overall_condition, overall_score,
                forehead_brightness, cheek_brightness, brightness_difference,
                forehead_saturation, shiny_percentage, oiliness_score, oiliness_level,
                left_texture, right_texture, texture_score, texture_level,
                dryness_score, dryness_level,
                left_redness, right_redness, redness_score, redness_level,
                pigmentation_percentage, tone_variation, pigmentation_score, pigmentation_level
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        """,
            (
                user_id,
                "completed" if scan_data.get("success", True) else "failed",
                1 if scan_data.get("face_detected", True) else 0,
                scan_data.get("message") if not scan_data.get("success", True) else None,
                image_paths.get("original"),
                image_paths.get("face"),
                image_paths.get("forehead"),
                image_paths.get("left_cheek"),
                image_paths.get("right_cheek"),
                skin_type,
                overall_condition,
                overall_score,
                scan_data.get("forehead_brightness"),
                scan_data.get("cheek_brightness"),
                scan_data.get("brightness_difference"),
                scan_data.get("forehead_saturation"),
                scan_data.get("shiny_percentage"),
                scan_data.get("oiliness_score"),
                scan_data.get("oiliness_level"),
                scan_data.get("left_texture"),
                scan_data.get("right_texture"),
                scan_data.get("texture_score"),
                scan_data.get("texture_level"),
                scan_data.get("dryness_score"),
                scan_data.get("dryness_level"),
                scan_data.get("left_redness"),
                scan_data.get("right_redness"),
                scan_data.get("redness_score"),
                scan_data.get("redness_level"),
                scan_data.get("pigmentation_percentage"),
                scan_data.get("tone_variation"),
                scan_data.get("pigmentation_score"),
                scan_data.get("pigmentation_level"),
            ),
        )
        scan_id = cursor.lastrowid

        # Insert Recommendations
        recs_to_insert = []
        
        for idx, rec in enumerate(scan_data.get("recommendations", []), 1):
            recs_to_insert.append((scan_id, "recommendation", rec, None, idx))

        for idx, item in enumerate(scan_data.get("recommended_ingredients", []), 1):
            if isinstance(item, dict):
                recs_to_insert.append((scan_id, "ingredient", item.get("ingredient", ""), item.get("reason", ""), idx))
            elif isinstance(item, str):
                recs_to_insert.append((scan_id, "ingredient", item, None, idx))

        for idx, item in enumerate(scan_data.get("things_to_avoid", []), 1):
            recs_to_insert.append((scan_id, "avoid", item, None, idx))

        for idx, step in enumerate(scan_data.get("morning_routine", []), 1):
            recs_to_insert.append((scan_id, "morning_routine", step, None, idx))

        for idx, step in enumerate(scan_data.get("night_routine", []), 1):
            recs_to_insert.append((scan_id, "night_routine", step, None, idx))

        for idx, cause in enumerate(scan_data.get("possible_causes", []), 1):
            recs_to_insert.append((scan_id, "possible_cause", cause, None, idx))

        for idx, life in enumerate(scan_data.get("lifestyle_suggestions", []), 1):
            recs_to_insert.append((scan_id, "lifestyle", life, None, idx))

        if recs_to_insert:
            cursor.executemany(
                """
                INSERT INTO scan_recommendations (scan_id, category, text, reason, step_order)
                VALUES (?, ?, ?, ?, ?)
            """,
                recs_to_insert,
            )

        # Update user's baseline skin type if not set or update profile
        cursor.execute(
            """
            UPDATE user_profiles
            SET skin_type = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """,
            (skin_type, user_id),
        )

        # Add notification for the user
        cursor.execute(
            """
            INSERT INTO notifications (user_id, icon, title, message)
            VALUES (?, 'fa-solid fa-camera', 'Skin Analysis Completed', ?)
        """,
            (user_id, f"Your skin analysis ({skin_type} skin, score: {round(overall_score, 1)}%) is ready."),
        )

        conn.commit()
        return scan_id
    finally:
        conn.close()


def get_scan_by_id(scan_id, user_id=None):
    """Retrieve full scan details along with structured recommendations."""
    conn = get_db_connection()
    try:
        query = "SELECT * FROM skin_scans WHERE id = ?"
        params = [scan_id]
        if user_id is not None:
            query += " AND user_id = ?"
            params.append(user_id)

        scan_row = conn.execute(query, params).fetchone()
        if not scan_row:
            return None

        scan = dict(scan_row)

        # Fetch associated recommendations
        rec_rows = conn.execute(
            """
            SELECT category, text, reason, step_order
            FROM scan_recommendations
            WHERE scan_id = ?
            ORDER BY category, step_order ASC
        """,
            (scan_id,),
        ).fetchall()

        recommendations = []
        recommended_ingredients = []
        things_to_avoid = []
        morning_routine = []
        night_routine = []
        possible_causes = []
        lifestyle_suggestions = []

        for row in rec_rows:
            cat = row["category"]
            txt = row["text"]
            reason = row["reason"]
            if cat == "recommendation":
                recommendations.append(txt)
            elif cat == "ingredient":
                recommended_ingredients.append({"ingredient": txt, "reason": reason or ""})
            elif cat == "avoid":
                things_to_avoid.append(txt)
            elif cat == "morning_routine":
                morning_routine.append(txt)
            elif cat == "night_routine":
                night_routine.append(txt)
            elif cat == "possible_cause":
                possible_causes.append(txt)
            elif cat == "lifestyle":
                lifestyle_suggestions.append(txt)

        scan["recommendations"] = recommendations
        scan["recommended_ingredients"] = recommended_ingredients
        scan["things_to_avoid"] = things_to_avoid
        scan["morning_routine"] = morning_routine
        scan["night_routine"] = night_routine
        scan["possible_causes"] = possible_causes
        scan["lifestyle_suggestions"] = lifestyle_suggestions

        # Format scan date
        if scan.get("created_at"):
            try:
                dt = datetime.strptime(scan["created_at"].split(".")[0], "%Y-%m-%d %H:%M:%S")
                scan["formatted_date"] = dt.strftime("%d %b %Y, %I:%M %p")
                scan["display_date"] = dt.strftime("%d %b %Y")
            except Exception:
                scan["formatted_date"] = scan["created_at"]
                scan["display_date"] = scan["created_at"]

        return scan
    finally:
        conn.close()


def get_latest_user_scan(user_id):
    """Retrieve the most recent completed scan for a user."""
    conn = get_db_connection()
    try:
        row = conn.execute(
            """
            SELECT id FROM skin_scans
            WHERE user_id = ? AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT 1
        """,
            (user_id,),
        ).fetchone()

        if row:
            return get_scan_by_id(row["id"], user_id=user_id)
        return None
    finally:
        conn.close()


def get_user_scans(user_id, limit=50):
    """Get scan history list for a user."""
    conn = get_db_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, user_id, status, skin_type, overall_condition, overall_score,
                   oiliness_level, dryness_level, texture_level, redness_level, pigmentation_level,
                   created_at
            FROM skin_scans
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """,
            (user_id, limit),
        ).fetchall()

        scans = []
        for r in rows:
            d = dict(r)
            try:
                dt = datetime.strptime(d["created_at"].split(".")[0], "%Y-%m-%d %H:%M:%S")
                d["display_date"] = dt.strftime("%d %b %Y")
                d["display_time"] = dt.strftime("%I:%M %p")
            except Exception:
                d["display_date"] = d["created_at"]
                d["display_time"] = ""
            scans.append(d)
        return scans
    finally:
        conn.close()


def get_user_dashboard_stats(user_id):
    """Fetch aggregated statistics for user dashboard."""
    conn = get_db_connection()
    try:
        total_scans = conn.execute("SELECT COUNT(*) AS c FROM skin_scans WHERE user_id = ?", (user_id,)).fetchone()["c"]
        avg_score_row = conn.execute("SELECT ROUND(AVG(overall_score), 1) AS avg_s FROM skin_scans WHERE user_id = ? AND overall_score IS NOT NULL", (user_id,)).fetchone()
        avg_score = avg_score_row["avg_s"] if avg_score_row and avg_score_row["avg_s"] is not None else None

        latest_scan = get_latest_user_scan(user_id)

        return {
            "total_scans": total_scans,
            "avg_score": avg_score,
            "latest_scan": latest_scan,
        }
    finally:
        conn.close()


# ====================================================================
# NOTIFICATIONS HELPERS
# ====================================================================

def get_user_notifications(user_id, limit=30):
    conn = get_db_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, user_id, icon, title, message, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """,
            (user_id, limit),
        ).fetchall()

        results = []
        for r in rows:
            d = dict(r)
            try:
                dt = datetime.strptime(d["created_at"].split(".")[0], "%Y-%m-%d %H:%M:%S")
                now = datetime.now()
                diff = now - dt
                if diff.days == 0:
                    if diff.seconds < 3600:
                        mins = max(1, diff.seconds // 60)
                        d["time_ago"] = f"{mins} mins ago"
                    else:
                        hours = diff.seconds // 3600
                        d["time_ago"] = f"{hours} hours ago"
                elif diff.days == 1:
                    d["time_ago"] = "Yesterday"
                else:
                    d["time_ago"] = dt.strftime("%d %b %Y")
            except Exception:
                d["time_ago"] = d["created_at"]
            results.append(d)
        return results
    finally:
        conn.close()


def mark_notifications_as_read(user_id):
    conn = get_db_connection()
    try:
        conn.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()


# ====================================================================
# FEEDBACK HELPERS
# ====================================================================

def add_feedback(user_id, rating, message):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO feedback (user_id, rating, message)
            VALUES (?, ?, ?)
        """,
            (user_id, int(rating), message.strip()),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def get_all_feedback(limit=20):
    conn = get_db_connection()
    try:
        rows = conn.execute(
            """
            SELECT f.id, f.rating, f.message, f.created_at,
                   COALESCE(u.full_name, 'Anonymous User') AS user_name
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
            LIMIT ?
        """,
            (limit,),
        ).fetchall()

        results = []
        for r in rows:
            d = dict(r)
            rating_num = int(d["rating"])
            d["stars"] = "⭐" * rating_num
            results.append(d)
        return results
    finally:
        conn.close()


# ====================================================================
# ADMIN HELPERS
# ====================================================================

def get_admin_dashboard_data():
    conn = get_db_connection()
    try:
        # 1. Stats
        stats_row = conn.execute("SELECT * FROM v_admin_stats").fetchone()
        stats = {
            "users": stats_row["total_users"] if stats_row else 0,
            "scans": stats_row["total_scans"] if stats_row else 0,
            "score": f"{stats_row['avg_score']}%" if stats_row and stats_row["avg_score"] is not None else "N/A",
            "feedback": stats_row["total_feedback"] if stats_row else 0,
        }

        # 2. Recent activities
        act_rows = conn.execute(
            """
            SELECT u.full_name AS user, s.skin_type AS skin, s.overall_condition AS condition,
                   s.overall_score, s.created_at AS date
            FROM skin_scans s
            JOIN users u ON u.id = s.user_id
            ORDER BY s.created_at DESC
            LIMIT 15
        """
        ).fetchall()

        activities = []
        for r in act_rows:
            d = dict(r)
            try:
                dt = datetime.strptime(d["date"].split(".")[0], "%Y-%m-%d %H:%M:%S")
                d["date"] = dt.strftime("%d %b %Y, %I:%M %p")
            except Exception:
                pass
            activities.append(d)

        return stats, activities
    finally:
        conn.close()
