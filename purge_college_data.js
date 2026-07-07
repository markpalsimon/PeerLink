const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// =============================================
// LOCAL DB
// =============================================
const localPool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'peerlink_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// =============================================
// RENDER (CLOUD) DB
// =============================================
const renderPool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

async function cleanDatabase(pool, label) {
  console.log('\n========================================');
  console.log('  Cleaning: ' + label);
  console.log('========================================');

  // 1. Delete all non-admin users (cascades to connections, messages, etc.)
  const users = await pool.query('DELETE FROM users WHERE is_admin = false');
  console.log('Deleted ' + users.rowCount + ' non-admin users');

  // 2. Clear courses table (college subjects)
  try {
    const courses = await pool.query('DELETE FROM courses WHERE true');
    console.log('Deleted ' + courses.rowCount + ' rows from courses table');
  } catch(e) { console.log('courses table: ' + e.message); }

  // 3. Clear skills table (college skills)
  try {
    const skills = await pool.query('DELETE FROM skills WHERE true');
    console.log('Deleted ' + skills.rowCount + ' rows from skills table');
  } catch(e) { console.log('skills table: ' + e.message); }

  // 4. Clear connections, messages, meetings, chat_rooms, logs
  const cleanTables = ['connections', 'messages', 'meetings', 'chat_rooms', 'logs', 'otp_store'];
  for (const t of cleanTables) {
    try {
      const r = await pool.query('DELETE FROM ' + t + ' WHERE true');
      console.log('Deleted ' + r.rowCount + ' rows from ' + t);
    } catch(e) { console.log(t + ': ' + e.message); }
  }

  // 5. Confirm remaining users
  const remaining = await pool.query('SELECT name, email, is_admin FROM users');
  console.log('\nRemaining users:');
  remaining.rows.forEach(r => {
    console.log('  [' + (r.is_admin ? 'ADMIN' : 'USER') + '] ' + r.name + ' | ' + r.email);
  });
}

async function cleanBackupJson() {
  console.log('\n========================================');
  console.log('  Cleaning: db_backup.json');
  console.log('========================================');

  const cleanBackup = {
    users: [],
    connections: [],
    chat_rooms: [],
    messages: [],
    courses: [],
    skills: [],
    subjects: [],
    meetings: [],
    logs: [],
    _note: 'Cleaned on ' + new Date().toISOString() + '. System now targets JHS/SHS (DepEd K-12). All college-era data removed.'
  };

  fs.writeFileSync('db_backup.json', JSON.stringify(cleanBackup, null, 2), 'utf8');
  console.log('db_backup.json overwritten with clean empty structure.');
}

async function run() {
  console.log('🧹 FULL PURGE — Removing all college-era data\n');

  await cleanDatabase(localPool, 'LOCAL PostgreSQL (peerlink_db)');
  await cleanDatabase(renderPool, 'RENDER Cloud DB');
  await cleanBackupJson();

  await localPool.end();
  await renderPool.end();

  console.log('\n✅ ALL DONE — Both databases and db_backup.json are now clean.');
  console.log('   Only the admin account remains. System is JHS/SHS ready.\n');
}

run().catch(e => {
  console.error('Fatal error:', e.message);
  localPool.end();
  renderPool.end();
});
