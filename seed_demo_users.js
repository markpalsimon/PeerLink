const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
require('dotenv').config();

// Local Pool
const localPool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'peerlink_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Render Pool
const renderPool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

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

async function seedPool(pool, label) {
  console.log(`\n--- Seeding Database: ${label} ---`);
  
  for (const u of DEMO_USERS) {
    const id           = randomUUID();
    const passwordHash = await bcrypt.hash(u.password, 10);

    // Delete existing to allow re-seeding fresh
    await pool.query('DELETE FROM users WHERE email = $1', [u.email]);

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
       )`,
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

    console.log(`✅ Created: ${u.name} (${u.education_level})`);
  }

  // Display user counts
  const countRes = await pool.query('SELECT COUNT(*) FROM users WHERE is_admin = false');
  console.log(`📊 Non-admin user count in ${label}: ${countRes.rows[0].count}`);
}

async function run() {
  console.log('🚀 Seeding JHS and SHS Demo accounts...');
  
  // Seed local
  try {
    await seedPool(localPool, 'Local PostgreSQL');
  } catch(err) {
    console.error('Local database seeding error:', err.message);
  } finally {
    await localPool.end();
  }

  // Seed Render
  try {
    await seedPool(renderPool, 'Render Cloud DB');
  } catch(err) {
    console.error('Render cloud database seeding error:', err.message);
  } finally {
    await renderPool.end();
  }

  console.log('\n🎉 Seeding complete on both databases!');
}

run();
