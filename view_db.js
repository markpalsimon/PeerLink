// view_db.js - Quick database viewer for PeerLink
// Usage: node view_db.js
// Usage: node view_db.js users
// Usage: node view_db.js messages
// Usage: node view_db.js connections

require('dotenv').config();
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'peerlink_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    });

const target = process.argv[2] || 'all';

async function run() {
  try {
    console.log('\n🗄️  PeerLink Local Database Viewer\n' + '='.repeat(40));

    if (target === 'all' || target === 'users') {
      const res = await pool.query(`
        SELECT id, student_lrn, name, email, grade_level, education_level, school_name, 
               section, track, strand, is_admin, is_banned, created_at 
        FROM users ORDER BY created_at DESC
      `);
      console.log(`\n👤 USERS (${res.rowCount} total):`);
      console.table(res.rows);
    }

    if (target === 'all' || target === 'messages') {
      const res = await pool.query('SELECT id, room_id, sender_name, LEFT(text,40) AS text_preview, sent_at FROM messages ORDER BY sent_at DESC LIMIT 20');
      console.log(`\n💬 MESSAGES (latest 20):`);
      console.table(res.rows);
    }

    if (target === 'all' || target === 'connections') {
      const res = await pool.query('SELECT id, sender_id, receiver_id, status, created_at FROM connections ORDER BY created_at DESC LIMIT 20');
      console.log(`\n🤝 CONNECTIONS (latest 20):`);
      console.table(res.rows);
    }

    if (target === 'all' || target === 'meetings') {
      const res = await pool.query('SELECT id, topic, host_id, guest_id, status, scheduled_at FROM meetings ORDER BY created_at DESC LIMIT 10');
      console.log(`\n📅 MEETINGS (latest 10):`);
      console.table(res.rows);
    }

    if (target === 'all' || target === 'otp') {
      try {
        const res = await pool.query('SELECT email, otp_code, expires_at, used FROM otp_codes ORDER BY expires_at DESC LIMIT 10');
        console.log(`\n🔑 OTP CODES (latest 10):`);
        console.table(res.rows);
      } catch(e) {
        console.log('\n🔑 OTP table not found (may not exist yet)');
      }
    }

    console.log('\n✅ Done!\n');
  } catch (err) {
    console.error('\n❌ Error connecting to database:', err.message);
    console.log('Make sure your local PostgreSQL is running and .env is correct.\n');
  } finally {
    await pool.end();
  }
}

run();
