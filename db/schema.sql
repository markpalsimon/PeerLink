-- PeerLink PostgreSQL Schema
-- Run this first to create the database tables

-- Create the database (run this separately as superuser if needed):
-- CREATE DATABASE peerlink_db;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(50) PRIMARY KEY,
  student_id    VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  program       VARCHAR(20) NOT NULL DEFAULT 'BSIT',
  year_section  VARCHAR(30) NOT NULL DEFAULT '',
  avatar        VARCHAR(10) DEFAULT '👤',
  bio           TEXT DEFAULT '',
  birthday      VARCHAR(50) DEFAULT '',
  address       VARCHAR(255) DEFAULT '',
  contact_info  VARCHAR(50) DEFAULT '',
  courses       JSONB NOT NULL DEFAULT '[]',
  skills        JSONB NOT NULL DEFAULT '{"have": [], "want": []}',
  schedule      JSONB NOT NULL DEFAULT '{}',
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  last_active   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  id         VARCHAR(100) PRIMARY KEY,  -- e.g., "student_1_student_2"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  room_id     VARCHAR(100) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id   VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  text        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- =============================================
-- SKILLS TABLE
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
  message    TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MEETINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS meetings (
  id           SERIAL PRIMARY KEY,
  host_id      VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id     VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic        VARCHAR(150) NOT NULL,
  meeting_date VARCHAR(30) NOT NULL,
  start_time   VARCHAR(20) NOT NULL,
  end_time     VARCHAR(20) NOT NULL,
  meeting_type VARCHAR(30) NOT NULL,
  notes        TEXT DEFAULT '',
  status       VARCHAR(20) DEFAULT 'pending',
  is_public    BOOLEAN DEFAULT FALSE,
  max_participants INTEGER DEFAULT 2,
  approved_participants JSONB DEFAULT '[]',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_connections_sender   ON connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_room        ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at     ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_logs_created_at      ON logs(created_at DESC);
