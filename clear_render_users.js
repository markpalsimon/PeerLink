const { Pool } = require('pg');

// ⚠️ This connects to the RENDER (cloud) database
const pool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('🌐 Connected to RENDER (cloud) database\n');

  // Show current users before deletion
  const before = await pool.query('SELECT id, name, email, is_admin FROM users ORDER BY is_admin DESC, created_at');
  console.log('=== BEFORE ===');
  before.rows.forEach(r => {
    const role = r.is_admin ? 'ADMIN' : 'USER';
    console.log('[' + role + '] ' + r.name + ' | ' + r.email);
  });

  // Delete all non-admin users
  const del = await pool.query('DELETE FROM users WHERE is_admin = false');
  console.log('\nDeleted ' + del.rowCount + ' non-admin user(s) from Render DB.');

  // Clean OTP store if it exists
  try {
    await pool.query('DELETE FROM otp_store WHERE true');
    console.log('Cleared otp_store table.');
  } catch(e) {
    console.log('(otp_store not found or already empty, skipping)');
  }

  // Show remaining
  const after = await pool.query('SELECT id, name, email, is_admin FROM users');
  console.log('\n=== AFTER (Remaining Users) ===');
  after.rows.forEach(r => {
    const role = r.is_admin ? 'ADMIN' : 'USER';
    console.log('[' + role + '] ' + r.name + ' | ' + r.email);
  });

  await pool.end();
  console.log('\nDone! Render DB is now clean.');
}

run().catch(e => {
  console.error('Error:', e.message);
  pool.end();
});
