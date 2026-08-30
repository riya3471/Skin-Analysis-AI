import os
import sqlite3
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "skin_analysis.db")


def is_postgres():
    """Check if PostgreSQL/Supabase database URL is configured."""
    url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    return bool(url and (url.startswith("postgres://") or url.startswith("postgresql://")))


def get_db_url():
    """Normalize postgresql URI for psycopg2."""
    url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def get_db_path():
    if os.environ.get("VERCEL"):
        return "/tmp/skin_analysis.db"
    db_env = os.environ.get("DATABASE_PATH", "skin_analysis.db")
    if not os.path.isabs(db_env):
        return os.path.join(BASE_DIR, db_env)
    return db_env


try:
    from flask import g, has_request_context
except ImportError:
    g = None
    has_request_context = lambda: False


def create_raw_connection():
    """Create a new raw connection to PostgreSQL or SQLite."""
    if is_postgres():
        if psycopg2 is None:
            raise RuntimeError("psycopg2-binary is required for PostgreSQL connections.")
        url = get_db_url()
        return psycopg2.connect(url, cursor_factory=RealDictCursor, sslmode="require")
    else:
        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn


def get_db_connection():
    """Get a database connection, reusing the open connection within the current Flask request context if available."""
    if has_request_context() and g is not None:
        if not hasattr(g, "_db_conn") or g._db_conn is None:
            g._db_conn = create_raw_connection()
        else:
            # Verify connection is still alive (especially for Postgres)
            if is_postgres():
                try:
                    if getattr(g._db_conn, "closed", 0) != 0:
                        g._db_conn = create_raw_connection()
                except Exception:
                    g._db_conn = create_raw_connection()
        return g._db_conn
    return create_raw_connection()


def close_db(e=None):
    """Close the request-scoped database connection at the end of the request."""
    if g is not None:
        conn = getattr(g, "_db_conn", None)
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass
            g._db_conn = None


def adapt_sql(sql):
    """Convert SQLite ? placeholders to PostgreSQL %s if using Postgres."""
    if is_postgres():
        return sql.replace("?", "%s")
    return sql


def execute_query(sql, params=(), fetch_one=False, fetch_all=False):
    """Unified query executor supporting both PostgreSQL and SQLite."""
    conn = get_db_connection()
    is_scoped = has_request_context()
    try:
        adapted = adapt_sql(sql)
        cursor = conn.cursor()
        cursor.execute(adapted, params)
        if fetch_one:
            row = cursor.fetchone()
            return dict(row) if row else None
        elif fetch_all:
            rows = cursor.fetchall()
            return [dict(r) for r in rows] if rows else []
        else:
            conn.commit()
            return None
    finally:
        if not is_scoped:
            try:
                conn.close()
            except Exception:
                pass


def execute_insert(sql, params=(), returning="id"):
    """Unified insert executor that returns the new primary key."""
    conn = get_db_connection()
    is_scoped = has_request_context()
    try:
        cursor = conn.cursor()
        if is_postgres():
            adapted = adapt_sql(sql).strip().rstrip(";")
            if returning and f"RETURNING {returning}" not in adapted.upper():
                adapted += f" RETURNING {returning};"
            cursor.execute(adapted, params)
            conn.commit()
            if returning:
                row = cursor.fetchone()
                return row[returning] if row else None
            return None
        else:
            cursor.execute(sql, params)
            conn.commit()
            return cursor.lastrowid
    finally:
        if not is_scoped:
            try:
                conn.close()
            except Exception:
                pass


def execute_many(sql, seq_of_params):
    """Unified executemany for batch insertions."""
    if not seq_of_params:
        return
    conn = get_db_connection()
    is_scoped = has_request_context()
    try:
        cursor = conn.cursor()
        adapted = adapt_sql(sql)
        cursor.executemany(adapted, seq_of_params)
        conn.commit()
    finally:
        if not is_scoped:
            try:
                conn.close()
            except Exception:
                pass


def parse_datetime_to_ist(val):
    """Convert any UTC datetime or string timestamp to local IST string."""
    if not val:
        return None
    if isinstance(val, datetime):
        dt_utc = val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    else:
        try:
            dt_utc = datetime.strptime(str(val).split(".")[0], "%Y-%m-%d %H:%M:%S")
            dt_utc = dt_utc.replace(tzinfo=timezone.utc)
        except Exception:
            return str(val)
    dt_local = dt_utc.astimezone(timezone(timedelta(hours=5, minutes=30)))  # IST (UTC+5:30)
    return dt_local


def init_db(schema_file=None):
    """Initialize database tables and views from schema file and seed data."""
    if is_postgres():
        # Tables on Supabase are created using supabase_schema.sql.
        # Ensure initial seed data exists if table is empty.
        try:
            seed_initial_data()
        except Exception as e:
            print(f"Supabase init check note: {e}")
        return

    # SQLite fallback
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
    user_count_row = execute_query("SELECT COUNT(*) AS count FROM users", fetch_one=True)
    user_count = user_count_row["count"] if user_count_row else 0

    if user_count == 0:
        admin_hash = generate_password_hash("admin123")
        admin_id = execute_insert(
            """
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES (?, ?, ?, 'admin')
            """,
            ("Skiné Admin", "admin@skinai.com", admin_hash),
        )

        user_hash = generate_password_hash("password123")
        demo_user_id = execute_insert(
            """
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES (?, ?, ?, 'user')
            """,
            ("Aastha Sharma", "user@skinai.com", user_hash),
        )

        # Profiles
        execute_query(
            "INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes) VALUES (?, 'Oily', '1998-05-14', 'Female', 'None', 'Prone to oily T-zone in humid weather')",
            (demo_user_id,),
        )
        execute_query(
            "INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes) VALUES (?, 'Normal', '1995-10-20', 'Female', 'Fragrance', 'System administrator')",
            (admin_id,),
        )

        # Demo Scan
        demo_scan_id = execute_insert(
            """
            INSERT INTO skin_scans (
                user_id, status, face_detected,
                skin_type, overall_condition, overall_score,
                forehead_brightness, cheek_brightness, brightness_difference,
                forehead_saturation, shiny_percentage, oiliness_score, oiliness_level,
                left_texture, right_texture, texture_score, texture_level,
                dryness_score, dryness_level,
                left_redness, right_redness, redness_score, redness_level,
                pigmentation_percentage, tone_variation, pigmentation_score, pigmentation_level
            ) VALUES (
                ?, 'completed', ?,
                'Oily', 'Mild Acne & Excess Sebum', 88.5,
                158.2, 142.6, 15.6,
                72.4, 18.5, 28.5, 'High',
                145.2, 150.8, 148.0, 'Medium Detail',
                22.0, 'Low',
                18.2, 19.5, 18.8, 'Low',
                12.4, 14.2, 24.8, 'Low'
            )
            """,
            (demo_user_id, True),
        )

        # Demo Recommendations
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
        execute_many(
            "INSERT INTO scan_recommendations (scan_id, category, text, reason, step_order) VALUES (?, ?, ?, ?, ?)",
            [(demo_scan_id, cat, text, reason, step) for cat, text, reason, step in demo_recs],
        )

        # Demo Notifications
        notifications = [
            (demo_user_id, "fa-solid fa-camera", "Skin Analysis Completed", "Your latest skin analysis report (Oily Skin, 88.5% health score) is ready.", False),
            (demo_user_id, "fa-solid fa-sun", "Sunscreen Reminder", "Remember to apply broad-spectrum SPF 50 sunscreen before going outdoors.", False),
            (demo_user_id, "fa-solid fa-droplet", "Hydration Tip", "Drink plenty of water today to keep your skin hydrated and balanced.", True)
        ]
        execute_many(
            "INSERT INTO notifications (user_id, icon, title, message, is_read) VALUES (?, ?, ?, ?, ?)",
            notifications,
        )

        # Demo Feedback
        feedbacks = [
            (demo_user_id, 5, "The AI skin scan was remarkably fast and accurate! The recommended Niacinamide routine really helped with my oily T-zone."),
            (None, 5, "Clean interface and the morning/night routine recommendations are very structured and practical."),
            (None, 4, "Loved the computer vision face region analysis. Very intuitive skin report!")
        ]
        execute_many(
            "INSERT INTO feedback (user_id, rating, message) VALUES (?, ?, ?)",
            feedbacks,
        )


# ====================================================================
# USER & PROFILE HELPERS
# ====================================================================

def get_user_by_email(email):
    return execute_query(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        (email.strip(),),
        fetch_one=True,
    )


def get_user_by_id(user_id):
    return execute_query(
        "SELECT * FROM users WHERE id = ?",
        (user_id,),
        fetch_one=True,
    )


def create_user(full_name, email, password_hash, role="user"):
    user_id = execute_insert(
        """
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
        """,
        (full_name.strip(), email.strip().lower(), password_hash, role),
    )

    # Automatically create default profile entry
    execute_query(
        """
        INSERT INTO user_profiles (user_id, skin_type)
        VALUES (?, 'Normal')
        """,
        (user_id,),
    )

    # Create welcome notification
    execute_query(
        """
        INSERT INTO notifications (user_id, icon, title, message)
        VALUES (?, 'fa-solid fa-sparkles', 'Welcome to Skiné!', 'Start your first AI skin scan to receive personalized recommendations.')
        """,
        (user_id,),
    )

    return user_id


def update_last_login(user_id):
    execute_query(
        "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
        (user_id,),
    )


def get_user_full_profile(user_id):
    return execute_query(
        """
        SELECT u.id, u.full_name, u.email, u.role, u.profile_image, u.created_at, u.last_login_at,
               p.skin_type, p.date_of_birth, p.gender, p.allergies, p.notes
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = ?
        """,
        (user_id,),
        fetch_one=True,
    )


def update_user_profile(user_id, full_name, skin_type=None, date_of_birth=None, gender=None, allergies=None, notes=None):
    execute_query("UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (full_name, user_id))
    existing = execute_query("SELECT id FROM user_profiles WHERE user_id = ?", (user_id,), fetch_one=True)
    if existing:
        execute_query(
            """
            UPDATE user_profiles
            SET skin_type = ?, date_of_birth = ?, gender = ?, allergies = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (skin_type, date_of_birth, gender, allergies, notes, user_id),
        )
    else:
        execute_query(
            """
            INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, skin_type, date_of_birth, gender, allergies, notes),
        )


# ====================================================================
# SKIN SCAN HELPERS
# ====================================================================

def save_skin_scan(user_id, scan_data, image_paths=None):
    """Save an AI scan result and its recommendations into database."""
    if image_paths is None:
        image_paths = {}

    skin_type = scan_data.get("skin_type", "Unknown")
    overall_condition = scan_data.get("overall_condition", "Analyzed")
    overall_score = scan_data.get("overall_score", 85.0)

    scan_id = execute_insert(
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
            bool(scan_data.get("face_detected", True)),
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
        execute_many(
            "INSERT INTO scan_recommendations (scan_id, category, text, reason, step_order) VALUES (?, ?, ?, ?, ?)",
            recs_to_insert,
        )

    # Update user's baseline skin type in profile
    execute_query(
        "UPDATE user_profiles SET skin_type = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
        (skin_type, user_id),
    )

    # Add notification for the user
    execute_query(
        "INSERT INTO notifications (user_id, icon, title, message) VALUES (?, 'fa-solid fa-camera', 'Skin Analysis Completed', ?)",
        (user_id, f"Your skin analysis ({skin_type} skin, score: {round(overall_score, 1)}%) is ready."),
    )

    return scan_id


def get_scan_by_id(scan_id, user_id=None):
    """Retrieve full scan details along with structured recommendations."""
    query = "SELECT * FROM skin_scans WHERE id = ?"
    params = [scan_id]
    if user_id is not None:
        query += " AND user_id = ?"
        params.append(user_id)

    scan = execute_query(query, params, fetch_one=True)
    if not scan:
        return None

    # Fetch associated recommendations
    rec_rows = execute_query(
        """
        SELECT category, text, reason, step_order
        FROM scan_recommendations
        WHERE scan_id = ?
        ORDER BY category, step_order ASC
        """,
        (scan_id,),
        fetch_all=True,
    )

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

    try:
        from models.recommendations import get_product_recommendations
        scan["product_recommendations"] = get_product_recommendations(recommended_ingredients)
    except Exception:
        scan["product_recommendations"] = []

    # Format scan date to local IST
    dt_local = parse_datetime_to_ist(scan.get("created_at"))
    if isinstance(dt_local, datetime):
        scan["formatted_date"] = dt_local.strftime("%d %b %Y, %I:%M %p")
        scan["display_date"] = dt_local.strftime("%d %b %Y")
    else:
        scan["formatted_date"] = str(scan.get("created_at", ""))
        scan["display_date"] = str(scan.get("created_at", ""))

    return scan


def get_latest_user_scan(user_id):
    """Retrieve the most recent completed scan for a user."""
    row = execute_query(
        """
        SELECT id FROM skin_scans
        WHERE user_id = ? AND status = 'completed'
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (user_id,),
        fetch_one=True,
    )
    if row:
        return get_scan_by_id(row["id"], user_id=user_id)
    return None


def get_user_scans(user_id, limit=50):
    """Get scan history list for a user."""
    rows = execute_query(
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
        fetch_all=True,
    )

    scans = []
    for d in rows:
        dt_local = parse_datetime_to_ist(d.get("created_at"))
        if isinstance(dt_local, datetime):
            d["display_date"] = dt_local.strftime("%d %b %Y")
            d["display_time"] = dt_local.strftime("%I:%M %p")
        else:
            d["display_date"] = str(d.get("created_at", ""))
            d["display_time"] = ""
        scans.append(d)
    return scans


def get_user_dashboard_stats(user_id):
    """Fetch aggregated statistics for user dashboard."""
    total_row = execute_query("SELECT COUNT(*) AS c FROM skin_scans WHERE user_id = ?", (user_id,), fetch_one=True)
    total_scans = total_row["c"] if total_row else 0

    avg_score_row = execute_query(
        "SELECT ROUND(AVG(overall_score)::numeric, 1) AS avg_s FROM skin_scans WHERE user_id = ? AND overall_score IS NOT NULL"
        if is_postgres() else
        "SELECT ROUND(AVG(overall_score), 1) AS avg_s FROM skin_scans WHERE user_id = ? AND overall_score IS NOT NULL",
        (user_id,),
        fetch_one=True,
    )
    avg_score = avg_score_row["avg_s"] if avg_score_row and avg_score_row["avg_s"] is not None else None
    latest_scan = get_latest_user_scan(user_id)

    return {
        "total_scans": total_scans,
        "avg_score": avg_score,
        "latest_scan": latest_scan,
    }


# ====================================================================
# NOTIFICATIONS HELPERS
# ====================================================================

def get_user_notifications(user_id, limit=30):
    rows = execute_query(
        """
        SELECT id, user_id, icon, title, message, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (user_id, limit),
        fetch_all=True,
    )

    results = []
    now_utc = datetime.now(timezone.utc)
    for d in rows:
        val = d.get("created_at")
        if isinstance(val, datetime):
            dt_utc = val if val.tzinfo else val.replace(tzinfo=timezone.utc)
        else:
            try:
                dt_utc = datetime.strptime(str(val).split(".")[0], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            except Exception:
                dt_utc = now_utc

        diff = now_utc - dt_utc
        if diff.days == 0:
            if diff.seconds < 60:
                d["time_ago"] = "Just now"
            elif diff.seconds < 3600:
                d["time_ago"] = f"{diff.seconds // 60} mins ago"
            else:
                d["time_ago"] = f"{diff.seconds // 3600} hours ago"
        elif diff.days == 1:
            d["time_ago"] = "Yesterday"
        else:
            dt_local = dt_utc.astimezone(timezone(timedelta(hours=5, minutes=30)))
            d["time_ago"] = dt_local.strftime("%d %b %Y")
        results.append(d)
    return results


def mark_notifications_as_read(user_id):
    execute_query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?" if is_postgres() else "UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))


# ====================================================================
# FEEDBACK HELPERS
# ====================================================================

def add_feedback(user_id, rating, message):
    return execute_insert(
        "INSERT INTO feedback (user_id, rating, message) VALUES (?, ?, ?)",
        (user_id, int(rating), message.strip()),
    )


def get_all_feedback(limit=20):
    rows = execute_query(
        """
        SELECT f.id, f.rating, f.message, f.created_at,
               COALESCE(u.full_name, 'Anonymous User') AS user_name
        FROM feedback f
        LEFT JOIN users u ON f.user_id = u.id
        ORDER BY f.created_at DESC
        LIMIT ?
        """,
        (limit,),
        fetch_all=True,
    )

    results = []
    for d in rows:
        rating_num = int(d["rating"])
        d["stars"] = "⭐" * rating_num
        results.append(d)
    return results


# ====================================================================
# ADMIN HELPERS
# ====================================================================

def get_admin_dashboard_data():
    stats_row = execute_query("SELECT * FROM v_admin_stats", fetch_one=True)
    stats = {
        "users": stats_row["total_users"] if stats_row else 0,
        "scans": stats_row["total_scans"] if stats_row else 0,
        "score": f"{stats_row['avg_score']}%" if stats_row and stats_row["avg_score"] is not None else "N/A",
        "feedback": stats_row["total_feedback"] if stats_row else 0,
    }

    act_rows = execute_query(
        """
        SELECT u.full_name AS user, s.skin_type AS skin, s.overall_condition AS condition,
               s.overall_score, s.created_at AS date
        FROM skin_scans s
        JOIN users u ON u.id = s.user_id
        ORDER BY s.created_at DESC
        LIMIT 15
        """,
        fetch_all=True,
    )

    activities = []
    for d in act_rows:
        dt_local = parse_datetime_to_ist(d.get("date"))
        if isinstance(dt_local, datetime):
            d["date"] = dt_local.strftime("%d %b %Y, %I:%M %p")
        activities.append(d)

    return stats, activities


# ====================================================================
# CHAT QUOTA & RATE LIMITING HELPERS
# ====================================================================

_chat_table_initialized = False

def ensure_chat_tables():
    """Ensure chat quota logging table exists in PostgreSQL / SQLite."""
    global _chat_table_initialized
    if _chat_table_initialized:
        return
    try:
        if is_postgres():
            execute_query("""
            CREATE TABLE IF NOT EXISTS chat_usage_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_chat_usage_user_time ON chat_usage_logs(user_id, created_at);
            """)
        else:
            execute_query("""
            CREATE TABLE IF NOT EXISTS chat_usage_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_chat_usage_user_time ON chat_usage_logs(user_id, created_at);
            """)
        _chat_table_initialized = True
    except Exception as e:
        print(f"Chat table ensure note: {e}")


def get_user_chat_quota(user_id, limit=350):
    """
    Returns (used_count: int, remaining: int, is_allowed: bool)
    within the rolling 24-hour window.
    """
    ensure_chat_tables()
    try:
        if is_postgres():
            row = execute_query(
                "SELECT COUNT(*) AS cnt FROM chat_usage_logs WHERE user_id = ? AND created_at >= NOW() - INTERVAL '24 hours'",
                (user_id,),
                fetch_one=True
            )
        else:
            row = execute_query(
                "SELECT COUNT(*) AS cnt FROM chat_usage_logs WHERE user_id = ? AND created_at >= datetime('now', '-24 hours')",
                (user_id,),
                fetch_one=True
            )
        count = row["cnt"] if row else 0
        remaining = max(0, limit - count)
        allowed = count < limit
        return count, remaining, allowed
    except Exception as e:
        print(f"Error checking chat quota: {e}")
        return 0, limit, True


def log_user_chat_message(user_id):
    """Record a chat message for the user's 24-hour rate-limiting quota."""
    ensure_chat_tables()
    try:
        execute_insert(
            "INSERT INTO chat_usage_logs (user_id) VALUES (?)",
            (user_id,)
        )
    except Exception as e:
        print(f"Error logging chat message: {e}")

