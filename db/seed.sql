-- PeerLink PostgreSQL Seed Data
-- Only seeds the Admin account, courses, and skills.
-- Students register themselves through the app.

-- =============================================
-- COURSES
-- =============================================
INSERT INTO courses (name) VALUES
  ('Web Development 2 (SPA)'),
  ('Software Engineering 1'),
  ('Database Management Systems 2'),
  ('Information Assurance & Security'),
  ('Mobile Computing & Android Dev'),
  ('Technopreneurship & Ethics'),
  ('Quantitative Methods with Modeling'),
  ('Discrete Mathematics'),
  ('Computer Networks & Cisco 2'),
  ('Data Structures & Algorithms')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SKILLS
-- =============================================
INSERT INTO skills (name) VALUES
  ('HTML / CSS Styling'),
  ('JavaScript & Web Tech'),
  ('React / Frontend Frameworks'),
  ('Node.js Backend / API Design'),
  ('SQL & Database Querying'),
  ('Python & Machine Learning'),
  ('Git & Collaborative Work'),
  ('UI/UX Design in Figma'),
  ('Technical Writing & Thesis Editing'),
  ('Public Speaking & Presentation'),
  ('Java & Android Application Dev')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ADMIN USER
-- Credentials:
--   Username (Student ID field): admin
--   Password:                    PeerLink@Admin2026
-- Hash below = bcrypt("PeerLink@Admin2026", salt rounds=10)
-- =============================================
INSERT INTO users (id, student_id, name, email, password_hash, program, year_section, avatar, bio, courses, skills, schedule, is_admin)
VALUES (
  'admin',
  'admin',
  'System Administrator',
  'admin@peerlink.edu.ph',
  '$2b$10$4UOjasVIB8XMS.u5dg9vDuj9qkEKf1gi8yRCewiYudGYA7cYB1pPK',
  'ADMIN',
  'Administration',
  '🛡️',
  'PeerLink System Administrator. Manages users, connections, and platform settings.',
  '[]',
  '{"have": [], "want": []}',
  '{}',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INITIAL SYSTEM LOG
-- =============================================
INSERT INTO logs (type, message) VALUES
  ('system', 'PeerLink database initialized. Admin account created.'),
  ('system', 'Matching engine ready. Waiting for student registrations.');
