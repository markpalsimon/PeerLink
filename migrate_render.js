// migrate_render.js
// Runs migration directly against Render cloud database

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

async function getColumns(client) {
  const res = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users'"
  );
  return res.rows.map(r => r.column_name);
}

async function run() {
  console.log('🌐 Connected to RENDER cloud database for migration...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Rename columns if necessary
    console.log('Step 1: Renaming columns...');
    let cols = await getColumns(client);

    const renames = [
      ['student_id',  'student_lrn'],
      ['program',     'school_name'],
      ['courses',     'subjects_need_help'],
      ['skills',      'subjects_can_help'],
      ['schedule',    'study_schedule'],
    ];

    for (const [oldCol, newCol] of renames) {
      if (cols.includes(oldCol) && !cols.includes(newCol)) {
        await client.query(`ALTER TABLE users RENAME COLUMN ${oldCol} TO ${newCol}`);
        console.log(`  Renamed ${oldCol} -> ${newCol}`);
      }
    }

    // Alter school_name size to VARCHAR(255)
    await client.query("ALTER TABLE users ALTER COLUMN school_name TYPE VARCHAR(255)");
    console.log('  Set school_name column size to VARCHAR(255)');

    // 2. Add columns
    console.log('Step 2: Adding new columns...');
    cols = await getColumns(client);

    if (!cols.includes('education_level')) {
      await client.query("ALTER TABLE users ADD COLUMN education_level VARCHAR(10) CHECK(education_level IN ('JHS','SHS'))");
      console.log('  Added education_level');
    }
    if (!cols.includes('grade_level')) {
      await client.query("ALTER TABLE users ADD COLUMN grade_level VARCHAR(20) CHECK(grade_level IN ('Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'))");
      console.log('  Added grade_level');
    }
    if (!cols.includes('section')) {
      await client.query("ALTER TABLE users ADD COLUMN section VARCHAR(100) DEFAULT ''");
      console.log('  Added section');
    }
    if (!cols.includes('track')) {
      await client.query("ALTER TABLE users ADD COLUMN track VARCHAR(50)");
      console.log('  Added track');
    }
    if (!cols.includes('strand')) {
      await client.query("ALTER TABLE users ADD COLUMN strand VARCHAR(50)");
      console.log('  Added strand');
    }

    // 3. Add track/strand check constraint
    console.log('Step 3: Checking check constraint...');
    try {
      await client.query(
        `ALTER TABLE users ADD CONSTRAINT chk_shs_track_strand CHECK(
          education_level = 'JHS' OR education_level IS NULL OR
          (track IS NOT NULL AND strand IS NOT NULL)
        )`
      );
      console.log('  Added chk_shs_track_strand constraint');
    } catch(e) {
      console.log('  chk_shs_track_strand check constraint already present or skipped');
    }

    // 4. Create otp_store table
    console.log('Step 4: Creating otp_store table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        email         VARCHAR(255) PRIMARY KEY,
        code          VARCHAR(10)  NOT NULL,
        expires_at    BIGINT       NOT NULL,
        user_data     TEXT         DEFAULT NULL,
        created_at    TIMESTAMPTZ  DEFAULT NOW()
      )
    `);
    console.log('  otp_store created or verified');

    // 5. Create subjects table
    console.log('Step 5: Creating subjects table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id    SERIAL PRIMARY KEY,
        name  VARCHAR(100) UNIQUE NOT NULL,
        level VARCHAR(10)  NOT NULL DEFAULT 'Both' CHECK(level IN ('JHS', 'SHS', 'Both'))
      )
    `);
    console.log('  subjects created or verified');

    // 6. Populate default subjects
    console.log('Step 6: Seeding subjects data...');
    const defaultSubjects = [
      // JHS Subjects
      ['Mathematics', 'JHS'],
      ['Science', 'JHS'],
      ['English', 'JHS'],
      ['Filipino', 'JHS'],
      ['Araling Panlipunan', 'JHS'],
      ['Technology and Livelihood Education', 'JHS'],
      ['MAPEH', 'JHS'],
      ['Edukasyon sa Pagpapakatao (EsP)', 'JHS'],
      // SHS Subjects
      ['Oral Communication', 'SHS'],
      ['Reading and Writing', 'SHS'],
      ['Komunikasyon at Pananaliksik', 'SHS'],
      ['General Mathematics', 'SHS'],
      ['Statistics and Probability', 'SHS'],
      ['Earth and Life Science', 'SHS'],
      ['Personal Development', 'SHS'],
      ['Media and Information Literacy', 'SHS'],
      ['Pre-Calculus', 'SHS'],
      ['Basic Calculus', 'SHS'],
      ['General Physics 1', 'SHS'],
      ['General Chemistry 1', 'SHS'],
      ['Empowerment Technologies', 'SHS'],
      ['Introduction to World Religions', 'SHS'],
      ['Creative Writing', 'SHS'],
      ['21st Century Literature', 'SHS'],
      ['Contemporary Arts from the Regions', 'SHS'],
      ['Physical Education and Health', 'SHS']
    ];

    for (const [name, level] of defaultSubjects) {
      await client.query(
        "INSERT INTO subjects (name, level) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
        [name, level]
      );
    }
    console.log('  Subjects seeded successfully');

    // 7. Re-seed default admin if deleted
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('PeerLink@Admin2026', 10);
    await client.query(`
      INSERT INTO users (
        id, student_lrn, name, email, password_hash, school_name, education_level, 
        grade_level, section, subjects_need_help, subjects_can_help, study_schedule, 
        is_admin, is_email_verified
      ) VALUES (
        'admin', 'admin', 'System Administrator', 'admin@peerlink.edu.ph', $1, 'ADMIN', 
        NULL, NULL, '', '[]', '[]', '{}', TRUE, TRUE
      ) ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);
    console.log('  Admin seeded successfully');

    await client.query('COMMIT');
    console.log('\n✅ Live Render database migrated successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
