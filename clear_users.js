const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'peerlink_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function run() {
  // Show current users before deletion
  const before = await pool.query('SELECT id, name, email, is_admin FROM users ORDER BY is_admin DESC');
  console.log('=== BEFORE ===');
  before.rows.forEach(r => {
    const role = r.is_admin ? 'ADMIN' : 'USER';
    console.log('[' + role + '] ' + r.name + ' | ' + r.email);
  });

  // Delete all non-admin users
  // Connections, messages, meetings are cleaned up via ON DELETE CASCADE
  const del = await pool.query('DELETE FROM users WHERE is_admin = false');
  console.log('\nDeleted ' + del.rowCount + ' non-admin user(s).');

  // Also clean up any orphaned OTP records, connections, messages not caught by cascade
  await pool.query('DELETE FROM otp_store WHERE true');
  console.log('Cleared otp_store table.');

  // Show remaining users
  const after = await pool.query('SELECT id, name, email, is_admin FROM users');
  console.log('\n=== AFTER (Remaining Users) ===');
  after.rows.forEach(r => {
    const role = r.is_admin ? 'ADMIN' : 'USER';
    console.log('[' + role + '] ' + r.name + ' | ' + r.email);
  });

  await pool.end();
  console.log('\nDone!');
}

run().catch(e => {
  console.error('Error:', e.message);
  pool.end();
});
