-- PeerLink PostgreSQL Schema — JHS/SHS Secondary Education Edition
-- Run this first to create the database tables.
-- Version: JHS/SHS (post-migration)

-- Create the database (run separately as superuser if needed):
-- CREATE DATABASE peerlink_db;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(50)  PRIMARY KEY,
  student_lrn       VARCHAR(12)  UNIQUE NOT NULL,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(100) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) DEFAULT NULL,
  school_name       VARCHAR(255) NOT NULL DEFAULT '',
  education_level   VARCHAR(10)  CHECK(education_level IN ('JHS','SHS')),
  grade_level       VARCHAR(20)  CHECK(grade_level IN ('Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12')),
  section           VARCHAR(100) DEFAULT '',
  track             VARCHAR(50)  DEFAULT NULL,
  strand            VARCHAR(50)  DEFAULT NULL,
  avatar            TEXT         DEFAULT '👤',
  bio               TEXT         DEFAULT '',
  birthday          VARCHAR(50)  DEFAULT '',
  address           VARCHAR(255) DEFAULT '',
  contact_info      VARCHAR(50)  DEFAULT '',
  subjects_need_help JSONB       NOT NULL DEFAULT '[]',
  subjects_can_help  JSONB       NOT NULL DEFAULT '[]',
  study_schedule    JSONB        NOT NULL DEFAULT '{}',
  is_admin          BOOLEAN      NOT NULL DEFAULT FALSE,
  is_banned         BOOLEAN      NOT NULL DEFAULT FALSE,
  is_email_verified BOOLEAN      DEFAULT FALSE,
  last_active       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- SHS students must always have track and strand set
  CONSTRAINT chk_shs_track_strand CHECK (
    education_level = 'JHS' OR
    education_level IS NULL OR
    (track IS NOT NULL AND strand IS NOT NULL)
  )
);

-- =============================================
-- CONNECTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS connections (
  id          SERIAL PRIMARY KEY,
  sender_id   VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- =============================================
-- CHAT ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id         VARCHAR(100) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  room_id     VARCHAR(100) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id   VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  text        TEXT         NOT NULL,
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  sent_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBJECTS TABLE (JHS/SHS Metadata)
-- Primary metadata table for secondary education subjects.
-- =============================================
CREATE TABLE IF NOT EXISTS subjects (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL,
  level VARCHAR(10)  NOT NULL DEFAULT 'Both'
        CHECK(level IN ('JHS', 'SHS', 'Both'))
);

-- =============================================
-- COURSES TABLE (Legacy — kept for compatibility)
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- =============================================
-- SKILLS TABLE (Legacy — kept for compatibility)
-- =============================================
CREATE TABLE IF NOT EXISTS skills (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- =============================================
-- ADMIN LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS logs (
  id         SERIAL PRIMARY KEY,
  type       VARCHAR(30) NOT NULL DEFAULT 'system',
  message    TEXT        NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- OTP STORE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS otp_store (
  email         VARCHAR(255) PRIMARY KEY,
  code          VARCHAR(10)  NOT NULL,
  expires_at    BIGINT       NOT NULL,
  user_data     TEXT         DEFAULT NULL,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);


-- =============================================
-- MEETINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS meetings (
  id                    SERIAL PRIMARY KEY,
  host_id               VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id              VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic                 VARCHAR(150) NOT NULL,
  meeting_date          VARCHAR(30)  NOT NULL,
  start_time            VARCHAR(20)  NOT NULL,
  end_time              VARCHAR(20)  NOT NULL,
  meeting_type          VARCHAR(30)  NOT NULL,
  notes                 TEXT         DEFAULT '',
  status                VARCHAR(20)  DEFAULT 'pending',
  is_public             BOOLEAN      DEFAULT FALSE,
  max_participants      INTEGER      DEFAULT 2,
  approved_participants JSONB        DEFAULT '[]',
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_connections_sender    ON connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver  ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_room         ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at      ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_logs_created_at       ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_education_level ON users(education_level);
CREATE INDEX IF NOT EXISTS idx_users_grade_level     ON users(grade_level);
