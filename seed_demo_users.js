const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'peerlink_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// =============================================
// DEMO ACCOUNTS — edit these freely
// =============================================
const DEMO_USERS = [
  {
    name:               'Juan Dela Cruz',
    email:              'juan.delacruz@peerlink.edu.ph',
    password:           'Demo@1234',
    student_lrn:        '100000000001',
    school_name:        'Rizal High School',
    education_level:    'JHS',
    grade_level:        'Grade 8',
    section:            'Sampaguita',
    track:              null,
    strand:             null,
    subjects_need_help: ['Mathematics', 'Science'],
    subjects_can_help:  ['English', 'Filipino'],
    study_schedule:     { Monday: [9, 10], Wednesday: [14, 15] },
    bio:                'JHS demo account for testing.',
  },
  {
    name:               'Maria Santos',
    email:              'maria.santos@peerlink.edu.ph',
    password:           'Demo@1234',
    student_lrn:        '100000000002',
    school_name:        'Pasig City Science High School',
    education_level:    'SHS',
    grade_level:        'Grade 11',
    section:            'STEM-A',
    track:              'Academic',
    strand:             'STEM',
    subjects_need_help: ['General Physics 1', 'Pre-Calculus'],
    subjects_can_help:  ['Empowerment Technologies', 'Reading and Writing'],
    study_schedule:     { Tuesday: [10, 11], Thursday: [13, 14] },
    bio:                'SHS demo account for testing.',
  },
];

async function run() {
  console.log('=== Seeding Demo Users ===\n');

  for (const u of DEMO_USERS) {
    const id           = randomUUID();
    const passwordHash = await bcrypt.hash(u.password, 10);

    await pool.query(
      `INSERT INTO users (
         id, student_lrn, name, email, password_hash,
         school_name, education_level, grade_level, section, track, strand,
         subjects_need_help, subjects_can_help, study_schedule,
         bio, is_email_verified, is_admin
       ) VALUES (
         $1,$2,$3,$4,$5,
         $6,$7,$8,$9,$10,$11,
         $12,$13,$14,
         $15, TRUE, FALSE
       )
       ON CONFLICT (email) DO NOTHING`,
      [
        id, u.student_lrn, u.name, u.email, passwordHash,
        u.school_name, u.education_level, u.grade_level,
        u.section, u.track, u.strand,
        JSON.stringify(u.subjects_need_help),
        JSON.stringify(u.subjects_can_help),
        JSON.stringify(u.study_schedule),
        u.bio,
      ]
    );

    console.log('✅ Created: ' + u.name + ' (' + u.education_level + ')');
    console.log('   Email   : ' + u.email);
    console.log('   Password: ' + u.password);
    console.log('   LRN     : ' + u.student_lrn);
    console.log('');
  }

  // Confirm what's in the DB
  const rows = await pool.query(
    'SELECT name, email, education_level, grade_level, school_name FROM users WHERE is_admin = false ORDER BY created_at'
  );
  console.log('=== Current Non-Admin Users ===');
  rows.rows.forEach(r => {
    console.log('  - ' + r.name + ' | ' + r.email + ' | ' + r.education_level + ' ' + r.grade_level + ' | ' + r.school_name);
  });

  await pool.end();
  console.log('\nDone!');
}

run().catch(e => {
  console.error('Error:', e.message);
  pool.end();
});
