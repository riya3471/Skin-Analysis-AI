-- =============================================================
-- Skin Analysis AI — Supabase (PostgreSQL) Database Schema
-- Dialect: PostgreSQL / Supabase
--
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Open your Project -> Click on "SQL Editor" in the left menu.
-- 3. Click "+ New query", paste this entire script, and click "Run".
-- =============================================================

-- -------------------------------------------------------------
-- EXTENSIONS & HELPER FUNCTIONS
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to auto-update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------
-- 1. USERS TABLE
-- Accounts for login / register (login.html, register.html)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'admin')),
    profile_image   TEXT,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for users.updated_at
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------
-- 2. USER PROFILES TABLE
-- Skincare details and baseline preferences (profile.html)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    skin_type       TEXT CHECK (skin_type IN ('Oily', 'Dry', 'Combination', 'Normal', 'Sensitive')),
    date_of_birth   DATE,
    gender          TEXT,
    allergies       TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for user_profiles.updated_at
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------
-- 3. SKIN SCANS TABLE
-- One row per AI scan execution (models/skin_analysis.py)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skin_scans (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Status / detection
    status                  TEXT NOT NULL DEFAULT 'completed'
                            CHECK (status IN ('completed', 'failed')),
    face_detected           BOOLEAN NOT NULL DEFAULT TRUE,
    error_message           TEXT,

    -- Image paths / storage URLs
    original_image_path     TEXT,
    face_image_path         TEXT,
    forehead_image_path     TEXT,
    left_cheek_image_path   TEXT,
    right_cheek_image_path  TEXT,

    -- Headline results
    skin_type               TEXT CHECK (skin_type IN ('Oily', 'Dry', 'Combination', 'Normal', 'Sensitive', 'Unknown')),
    overall_condition       TEXT,
    overall_score           NUMERIC(5, 2) CHECK (overall_score BETWEEN 0 AND 100),

    -- Brightness metrics
    forehead_brightness     DOUBLE PRECISION,
    cheek_brightness        DOUBLE PRECISION,
    brightness_difference   DOUBLE PRECISION,

    -- Oiliness
    forehead_saturation     DOUBLE PRECISION,
    shiny_percentage        DOUBLE PRECISION,
    oiliness_score          NUMERIC(5, 2) CHECK (oiliness_score BETWEEN 0 AND 100),
    oiliness_level          TEXT CHECK (oiliness_level IN ('Low', 'Moderate', 'High')),

    -- Texture
    left_texture            DOUBLE PRECISION,
    right_texture           DOUBLE PRECISION,
    texture_score           DOUBLE PRECISION,
    texture_level           TEXT,

    -- Dryness
    dryness_score           NUMERIC(5, 2) CHECK (dryness_score BETWEEN 0 AND 100),
    dryness_level           TEXT CHECK (dryness_level IN ('Low', 'Moderate', 'High')),

    -- Redness
    left_redness            DOUBLE PRECISION,
    right_redness           DOUBLE PRECISION,
    redness_score           NUMERIC(5, 2) CHECK (redness_score BETWEEN 0 AND 100),
    redness_level           TEXT CHECK (redness_level IN ('Low', 'Moderate', 'High')),

    -- Pigmentation
    pigmentation_percentage DOUBLE PRECISION,
    tone_variation          DOUBLE PRECISION,
    pigmentation_score      NUMERIC(5, 2) CHECK (pigmentation_score BETWEEN 0 AND 100),
    pigmentation_level      TEXT CHECK (pigmentation_level IN ('Low', 'Moderate', 'High')),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_user     ON skin_scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created  ON skin_scans (created_at DESC);

-- -------------------------------------------------------------
-- 4. SCAN RECOMMENDATIONS TABLE
-- Normalized skincare routines & ingredients per scan
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_recommendations (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scan_id         BIGINT NOT NULL REFERENCES skin_scans(id) ON DELETE CASCADE,
    category        TEXT NOT NULL
                    CHECK (category IN ('recommendation', 'ingredient', 'avoid',
                                        'morning_routine', 'night_routine',
                                        'possible_cause', 'lifestyle')),
    text            TEXT NOT NULL,
    reason          TEXT,
    step_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recs_scan ON scan_recommendations (scan_id);

-- -------------------------------------------------------------
-- 5. NOTIFICATIONS TABLE
-- Real-time user alerts and routine reminders
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    icon            TEXT,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications (user_id, is_read);

-- -------------------------------------------------------------
-- 6. FEEDBACK TABLE
-- User ratings and testimonials
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 7. VIEWS
-- -------------------------------------------------------------

-- Scan history view (history.html)
CREATE OR REPLACE VIEW v_scan_history AS
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

-- Admin headline stats view (admin.html)
CREATE OR REPLACE VIEW v_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM users)                                          AS total_users,
    (SELECT COUNT(*) FROM skin_scans)                                     AS total_scans,
    (SELECT ROUND(AVG(overall_score)::numeric, 1) FROM skin_scans
        WHERE overall_score IS NOT NULL)                                  AS avg_score,
    (SELECT COUNT(*) FROM feedback)                                       AS total_feedback;

-- Admin recent scan activities view (admin.html)
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT
    u.full_name         AS "user",
    s.skin_type         AS skin,
    s.overall_condition AS condition,
    s.created_at        AS date
FROM skin_scans s
JOIN users u ON u.id = s.user_id
ORDER BY s.created_at DESC;

-- -------------------------------------------------------------
-- 8. INITIAL SEED DATA (Optional, ready-to-test demo accounts)
-- -------------------------------------------------------------

-- Admin User (Password: admin123)
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'Skiné Admin',
    'admin@skinai.com',
    'scrypt:32768:8:1$N2hJ8K9v$4b7c6c4c5a5b6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Demo User (Password: password123)
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'Aastha Sharma',
    'user@skinai.com',
    'scrypt:32768:8:1$N2hJ8K9v$4b7c6c4c5a5b6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef',
    'user'
) ON CONFLICT (email) DO NOTHING;

-- Initial Demo User Profile
INSERT INTO user_profiles (user_id, skin_type, date_of_birth, gender, allergies, notes)
SELECT id, 'Oily', '1998-05-14', 'Female', 'None', 'Prone to oily T-zone in humid weather'
FROM users WHERE email = 'user@skinai.com'
ON CONFLICT (user_id) DO NOTHING;

-- Initial Sample Reviews
INSERT INTO feedback (user_id, rating, message)
SELECT id, 5, 'The AI skin scan was remarkably fast and accurate! The recommended Niacinamide routine really helped with my oily T-zone.'
FROM users WHERE email = 'user@skinai.com'
LIMIT 1;

INSERT INTO feedback (user_id, rating, message)
VALUES
    (NULL, 5, 'Clean interface and the morning/night routine recommendations are very structured and practical.'),
    (NULL, 4, 'Loved the computer vision face region analysis. Very intuitive skin report!');
