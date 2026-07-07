// db/migrate_jhs_shs.js
// PeerLink JHS/SHS Database Migration Script
// Run with: node db/migrate_jhs_shs.js
// Safe to run multiple times (idempotent).

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function getColumns(client) {
  const res = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users'"
  );
  return res.rows.map(r => r.column_name);
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Step 1: Rename legacy columns ────────────────────────────────
    console.log('Step 1: Renaming legacy columns...');
    let cols = await getColumns(client);

    const renames = [
      ['student_id',  'student_lrn'],
      ['program',     'school_name'],
      ['courses',     'subjects_need_help'],
      ['skills',      'subjects_can_help'],
      ['schedule',    'study_schedule'],
    ];

    for (const [oldName, newName] of renames) {
      if (cols.includes(oldName) && !cols.includes(newName)) {
        await client.query(`ALTER TABLE users RENAME COLUMN ${oldName} TO ${newName}`);
        console.log(`  Renamed ${oldName} -> ${newName}`);
      } else if (cols.includes(newName)) {
        console.log(`  ${newName} already exists, skipping.`);
      } else {
        console.log(`  ${oldName} not found and ${newName} not found, skipping.`);
      }
    }

    // Increase school_name (old program) size to VARCHAR(255)
    await client.query("ALTER TABLE users ALTER COLUMN school_name TYPE VARCHAR(255)");
    console.log("  Increased school_name column size to VARCHAR(255)");

    // ── Step 2: Add new JHS/SHS columns ─────────────────────────────
    console.log('Step 2: Adding new JHS/SHS columns...');
    cols = await getColumns(client);

    if (!cols.includes('education_level')) {
      await client.query(
        "ALTER TABLE users ADD COLUMN education_level VARCHAR(10) CHECK(education_level IN ('JHS','SHS'))"
      );
      console.log('  Added education_level');
    } else { console.log('  education_level already exists, skipping.'); }

    if (!cols.includes('grade_level')) {
      await client.query(
        "ALTER TABLE users ADD COLUMN grade_level VARCHAR(20) CHECK(grade_level IN ('Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'))"
      );
      console.log('  Added grade_level');
    } else { console.log('  grade_level already exists, skipping.'); }

    if (!cols.includes('section')) {
      await client.query('ALTER TABLE users ADD COLUMN section VARCHAR(100)');
      console.log('  Added section');
    } else { console.log('  section already exists, skipping.'); }

    if (!cols.includes('track')) {
      await client.query('ALTER TABLE users ADD COLUMN track VARCHAR(50)');
      console.log('  Added track');
    } else { console.log('  track already exists, skipping.'); }

    if (!cols.includes('strand')) {
      await client.query('ALTER TABLE users ADD COLUMN strand VARCHAR(50)');
      console.log('  Added strand');
    } else { console.log('  strand already exists, skipping.'); }

    // ── Step 3: Add SHS track/strand integrity constraint ───────────
    console.log('Step 3: Adding SHS track/strand constraint...');
    try {
      await client.query(
        "ALTER TABLE users ADD CONSTRAINT chk_shs_track_strand CHECK(" +
        "  education_level = 'JHS' OR education_level IS NULL OR" +
        "  (track IS NOT NULL AND strand IS NOT NULL)" +
        ")"
      );
      console.log('  Added chk_shs_track_strand constraint');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('  Constraint already exists, skipping.');
      } else { throw e; }
    }

    // ── Step 4: Drop year_section ────────────────────────────────────
    console.log('Step 4: Dropping year_section...');
    cols = await getColumns(client);
    if (cols.includes('year_section')) {
      await client.query('ALTER TABLE users DROP COLUMN year_section');
      console.log('  Dropped year_section');
    } else { console.log('  year_section not found, skipping.'); }

    // ── Step 5: Create subjects metadata table ───────────────────────
    console.log('Step 5: Creating subjects table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id    SERIAL PRIMARY KEY,
        name  VARCHAR(100) UNIQUE NOT NULL,
        level VARCHAR(10) NOT NULL DEFAULT 'Both'
              CHECK(level IN ('JHS', 'SHS', 'Both'))
      )
    `);
    console.log('  subjects table ready');

    // ── Step 6: Seed JHS and SHS subjects ───────────────────────────
    console.log('Step 6: Seeding JHS/SHS subjects...');
    const subjects = [
      // JHS
      ['Mathematics',                          'JHS'],
      ['Science',                              'JHS'],
      ['English',                              'JHS'],
      ['Filipino',                             'JHS'],
      ['Araling Panlipunan',                   'JHS'],
      ['Technology and Livelihood Education',  'JHS'],
      ['MAPEH',                                'JHS'],
      ['Edukasyon sa Pagpapakatao (EsP)',       'JHS'],
      // SHS
      ['Oral Communication',                   'SHS'],
      ['Reading and Writing',                  'SHS'],
      ['Komunikasyon at Pananaliksik',          'SHS'],
      ['General Mathematics',                  'SHS'],
      ['Statistics and Probability',           'SHS'],
      ['Earth and Life Science',               'SHS'],
      ['Personal Development',                 'SHS'],
      ['Media and Information Literacy',       'SHS'],
      ['Pre-Calculus',                         'SHS'],
      ['Basic Calculus',                       'SHS'],
      ['General Physics 1',                    'SHS'],
      ['General Chemistry 1',                  'SHS'],
      ['Empowerment Technologies',             'SHS'],
      ['Introduction to World Religions',      'SHS'],
      ['Creative Writing',                     'SHS'],
      ['21st Century Literature',              'SHS'],
      ['Contemporary Arts from the Regions',   'SHS'],
      ['Physical Education and Health',        'SHS'],
    ];

    let inserted = 0;
    for (const [name, level] of subjects) {
      const res = await client.query(
        'INSERT INTO subjects(name, level) VALUES($1, $2) ON CONFLICT(name) DO NOTHING RETURNING id',
        [name, level]
      );
      if (res.rowCount > 0) inserted++;
    }
    console.log(`  Inserted ${inserted} new subjects (${subjects.length - inserted} already existed)`);

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration FAILED — rolled back all changes.');
    console.error('   Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
