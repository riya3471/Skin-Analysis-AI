-- =============================================================
-- Skin Analysis AI — Database Schema
-- Dialect: SQLite (zero-config default for this Flask app)
-- To use MySQL: replace AUTOINCREMENT with AUTO_INCREMENT,
--               INTEGER PRIMARY KEY -> INT PRIMARY KEY AUTO_INCREMENT
-- To use PostgreSQL: replace with GENERATED ALWAYS AS IDENTITY
-- =============================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
-- USERS
-- Accounts for login / register (login.html, register.html)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name       TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin')),
    profile_image   TEXT,                          -- path/URL to avatar
    last_login_at   DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- USER PROFILES
-- Extra per-user skincare details (profile.html)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE,
    skin_type       TEXT                          -- user's baseline skin type
                    CHECK (skin_type IN ('Oily', 'Dry', 'Combination',
                                         'Normal', 'Sensitive')),
    date_of_birth   DATE,
    gender          TEXT,
    allergies       TEXT,                          -- known ingredient allergies
    notes           TEXT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- SKIN SCANS
-- One row per /analyze run (models/skin_analysis.py)
-- Numeric scores = 0–100 model outputs; levels = 'Low'|'Moderate'|'High'
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skin_scans (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                 INTEGER NOT NULL,

    -- Status / detection
    status                  TEXT    NOT NULL DEFAULT 'completed'
                            CHECK (status IN ('completed', 'failed')),
    face_detected           INTEGER NOT NULL DEFAULT 1,  -- boolean 0/1
    error_message           TEXT,                        -- e.g. "No face detected."

    -- Images
    original_image_path     TEXT,                        -- uploaded frame
    face_image_path         TEXT,                        -- cropped_face.jpg
    forehead_image_path     TEXT,                        -- forehead.jpg
    left_cheek_image_path   TEXT,                        -- left_cheek.jpg
    right_cheek_image_path  TEXT,                        -- right_cheek.jpg

    -- Headline result (result.html, history.html, profile score)
    skin_type               TEXT
                            CHECK (skin_type IN ('Oily', 'Dry', 'Combination',
                                                 'Normal', 'Sensitive', 'Unknown')),
    overall_condition       TEXT,                        -- e.g. 'Mild Acne', 'Healthy'
    overall_score           REAL    CHECK (overall_score BETWEEN 0 AND 100),

    -- Brightness metrics
    forehead_brightness     REAL,
    cheek_brightness        REAL,
    brightness_difference   REAL,

    -- Oiliness
    forehead_saturation     REAL,
    shiny_percentage        REAL,
    oiliness_score          REAL    CHECK (oiliness_score BETWEEN 0 AND 100),
    oiliness_level          TEXT    CHECK (oiliness_level IN ('Low', 'Moderate', 'High')),

    -- Texture
    left_texture            REAL,
    right_texture           REAL,
    texture_score           REAL,
    texture_level           TEXT,                        -- e.g. 'Smooth', 'High Detail'

    -- Dryness
    dryness_score           REAL    CHECK (dryness_score BETWEEN 0 AND 100),
    dryness_level           TEXT    CHECK (dryness_level IN ('Low', 'Moderate', 'High')),

    -- Redness
    left_redness            REAL,
    right_redness           REAL,
    redness_score           REAL    CHECK (redness_score BETWEEN 0 AND 100),
    redness_level           TEXT    CHECK (redness_level IN ('Low', 'Moderate', 'High')),

    -- Pigmentation
    pigmentation_percentage REAL,
    tone_variation          REAL,
    pigmentation_score      REAL    CHECK (pigmentation_score BETWEEN 0 AND 100),
    pigmentation_level      TEXT    CHECK (pigmentation_level IN ('Low', 'Moderate', 'High')),

    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- scan date

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scans_user     ON skin_scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created  ON skin_scans (created_at);

-- -------------------------------------------------------------
-- SCAN RECOMMENDATIONS
-- Normalized output of models/recommendations.py — one row per item.
-- category maps to the keys returned by get_recommendations():
--   recommendation       -> recommendations[]
--   ingredient           -> recommended_ingredients[] (uses reason column)
--   avoid                -> things_to_avoid[]
--   morning_routine      -> morning_routine[]
--   night_routine        -> night_routine[]
--   possible_cause       -> possible_causes[]
--   lifestyle            -> lifestyle_suggestions[]
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_recommendations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id         INTEGER NOT NULL,
    category        TEXT    NOT NULL
                    CHECK (category IN ('recommendation', 'ingredient', 'avoid',
                                        'morning_routine', 'night_routine',
                                        'possible_cause', 'lifestyle')),
    text            TEXT    NOT NULL,              -- item or ingredient name
    reason          TEXT,                          -- why (ingredients only)
    step_order      INTEGER NOT NULL DEFAULT 0,    -- ordering within a routine
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES skin_scans (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recs_scan ON scan_recommendations (scan_id);

-- -------------------------------------------------------------
-- NOTIFICATIONS (notifications.html)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    icon            TEXT,                          -- e.g. 'fa-solid fa-camera'
    title           TEXT    NOT NULL,
    message         TEXT    NOT NULL,
    is_read         INTEGER NOT NULL DEFAULT 0,    -- boolean 0/1
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications (user_id, is_read);

-- -------------------------------------------------------------
-- FEEDBACK (feedback.html)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,                       -- NULL = anonymous feedback
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message         TEXT    NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- VIEWS
-- -------------------------------------------------------------

-- History page (history.html): one row per scan, newest first
CREATE VIEW IF NOT EXISTS v_scan_history AS
SELECT
    s.id,
    s.user_id,
    s.created_at        AS scan_date,
    s.skin_type,
    s.overall_condition AS condition,
    s.overall_score
FROM skin_scans s
WHERE s.status = 'completed'
ORDER BY s.created_at DESC;

-- Admin dashboard (admin.html): headline stats in one row
CREATE VIEW IF NOT EXISTS v_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM users)                                  AS total_users,
    (SELECT COUNT(*) FROM skin_scans)                             AS total_scans,
    (SELECT ROUND(AVG(overall_score), 1) FROM skin_scans
        WHERE overall_score IS NOT NULL)                          AS avg_score,
    (SELECT COUNT(*) FROM feedback)                               AS total_feedback;

-- Admin recent activity (admin.html)
CREATE VIEW IF NOT EXISTS v_recent_activity AS
SELECT
    u.full_name         AS "user",
    s.skin_type         AS skin,
    s.overall_condition AS condition,
    s.created_at        AS date
FROM skin_scans s
JOIN users u ON u.id = s.user_id
ORDER BY s.created_at DESC;
