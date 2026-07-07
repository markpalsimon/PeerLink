const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

async function viewDatabase() {
  console.log('\n📊 FETCHING USERS FROM RENDER DATABASE...\n' + '='.repeat(60));
  try {
    const result = await pool.query('SELECT id, student_lrn, name, email, school_name, grade_level, is_email_verified, is_admin FROM users ORDER BY created_at ASC');
    
    if (result.rows.length === 0) {
      console.log('ℹ️  No users found in the database.');
    } else {
      console.table(result.rows);
    }
  } catch (err) {
    console.error('❌ Failed to fetch database:', err.message);
  } finally {
    await pool.end();
  }
}

viewDatabase();
