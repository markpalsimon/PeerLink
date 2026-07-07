-- PeerLink PostgreSQL Seed Data — JHS/SHS Secondary Education Edition
-- Seeds the subjects metadata table and the admin account.
-- Students register themselves through the app.

-- =============================================
-- JHS SUBJECTS
-- =============================================
INSERT INTO subjects (name, level) VALUES
  ('Mathematics',                         'JHS'),
  ('Science',                             'JHS'),
  ('English',                             'JHS'),
  ('Filipino',                            'JHS'),
  ('Araling Panlipunan',                  'JHS'),
  ('Technology and Livelihood Education', 'JHS'),
  ('MAPEH',                               'JHS'),
  ('Edukasyon sa Pagpapakatao (EsP)',      'JHS')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SHS SUBJECTS
-- =============================================
INSERT INTO subjects (name, level) VALUES
  ('Oral Communication',                'SHS'),
  ('Reading and Writing',               'SHS'),
  ('Komunikasyon at Pananaliksik',       'SHS'),
  ('General Mathematics',               'SHS'),
  ('Statistics and Probability',        'SHS'),
  ('Earth and Life Science',            'SHS'),
  ('Personal Development',              'SHS'),
  ('Media and Information Literacy',    'SHS'),
  ('Pre-Calculus',                      'SHS'),
  ('Basic Calculus',                    'SHS'),
  ('General Physics 1',                 'SHS'),
  ('General Chemistry 1',               'SHS'),
  ('Empowerment Technologies',          'SHS'),
  ('Introduction to World Religions',   'SHS'),
  ('Creative Writing',                  'SHS'),
  ('21st Century Literature',           'SHS'),
  ('Contemporary Arts from the Regions','SHS'),
  ('Physical Education and Health',     'SHS')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ADMIN USER
-- Credentials:
--   Login (email):  admin@peerlink.edu.ph
--   Password:       PeerLink@Admin2026
-- Hash below = bcrypt("PeerLink@Admin2026", salt rounds=10)
-- =============================================
INSERT INTO users (
  id, student_lrn, name, email, password_hash,
  school_name, education_level, grade_level, section,
  avatar, bio,
  subjects_need_help, subjects_can_help, study_schedule,
  is_admin
) VALUES (
  'admin',
  'admin',
  'System Administrator',
  'admin@peerlink.edu.ph',
  '$2b$10$4UOjasVIB8XMS.u5dg9vDuj9qkEKf1gi8yRCewiYudGYA7cYB1pPK',
  'PeerLink Administration',
  NULL,
  NULL,
  'Administration',
  '🛡️',
  'PeerLink System Administrator. Manages users, connections, and platform settings.',
  '[]',
  '[]',
  '{}',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INITIAL SYSTEM LOG
-- =============================================
INSERT INTO logs (type, message) VALUES
  ('system', 'PeerLink JHS/SHS database initialized. Admin account ready.'),
  ('system', 'Matching engine ready. Waiting for student registrations.')
ON CONFLICT DO NOTHING;
