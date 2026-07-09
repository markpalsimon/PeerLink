// PeerLink DB Utility Tool
// Usage:
//   node db_util.js list-users
//   node db_util.js reset-password <student_lrn> <new_password>
//   node db_util.js delete-user <student_lrn>
//   node db_util.js hash <password>

require('dotenv').config();
const { Pool } = require('./node_modules/pg');
const bcrypt = require('./node_modules/bcrypt');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     process.env.DB_PORT     || 5432,
      database: process.env.DB_NAME     || 'peerlink_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'Judie0126',
    });

const [,, command, arg1, arg2] = process.argv;

async function run() {

  // --- HASH a password ---
  if (command === 'hash') {
    if (!arg1) { console.log('Usage: node db_util.js hash <password>'); process.exit(1); }
    const hash = await bcrypt.hash(arg1, 10);
    console.log('\n✅ bcrypt hash:\n');
    console.log(hash);
    console.log('\nPaste this into the password_hash column in pgAdmin.\n');
    await pool.end();
    return;
  }

  // --- LIST USERS ---
  if (command === 'list-users') {
    const result = await pool.query(
      `SELECT student_lrn, name, email, grade_level, education_level, school_name, is_admin, is_banned
       FROM users ORDER BY is_admin DESC, name`
    );
    console.log('\n👤 Registered Users (' + result.rowCount + ' total):');
    result.rows.forEach(r => {
      const role    = r.is_admin  ? '[ADMIN]'   : '[STUDENT]';
      const banned  = r.is_banned ? ' ⛔BANNED'  : '';
      const level   = r.education_level ? ` (${r.education_level} ${r.grade_level || ''})` : '';
      console.log(`  ${role}${banned} ${r.name} | LRN: ${r.student_lrn} | Email: ${r.email}${level}`);
    });
    console.log('');
    await pool.end();
    return;
  }

  // --- RESET PASSWORD ---
  if (command === 'reset-password') {
    if (!arg1 || !arg2) {
      console.log('Usage: node db_util.js reset-password <student_lrn> <new_password>');
      process.exit(1);
    }
    const hash = await bcrypt.hash(arg2, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE student_lrn = $2 RETURNING name, email',
      [hash, arg1]
    );
    if (result.rows.length === 0) {
      console.log('❌ No user found with LRN: ' + arg1);
    } else {
      console.log('✅ Password reset for: ' + result.rows[0].name + ' (' + result.rows[0].email + ')');
      console.log('   New password: "' + arg2 + '"');
    }
    await pool.end();
    return;
  }

  // --- DELETE USER ---
  if (command === 'delete-user') {
    if (!arg1) {
      console.log('Usage: node db_util.js delete-user <student_lrn>');
      process.exit(1);
    }
    if (arg1 === 'admin') {
      console.log('❌ Cannot delete the admin account.');
      await pool.end();
      return;
    }
    const result = await pool.query(
      'DELETE FROM users WHERE student_lrn = $1 RETURNING name, email',
      [arg1]
    );
    if (result.rows.length === 0) {
      console.log('❌ No user found with LRN: ' + arg1);
    } else {
      console.log('✅ Deleted user: ' + result.rows[0].name + ' (' + result.rows[0].email + ')');
    }
    await pool.end();
    return;
  }

  // --- BAN / UNBAN USER ---
  if (command === 'ban-user' || command === 'unban-user') {
    if (!arg1) {
      console.log('Usage: node db_util.js ban-user <student_lrn>');
      process.exit(1);
    }
    const ban = command === 'ban-user';
    const result = await pool.query(
      'UPDATE users SET is_banned = $1 WHERE student_lrn = $2 RETURNING name, email',
      [ban, arg1]
    );
    if (result.rows.length === 0) {
      console.log('❌ No user found with LRN: ' + arg1);
    } else {
      console.log(`${ban ? '🚫 Banned' : '✅ Unbanned'}: ${result.rows[0].name} (${result.rows[0].email})`);
    }
    await pool.end();
    return;
  }

  // --- HELP ---
  console.log('\nPeerLink DB Utility');
  console.log('Commands:');
  console.log('  node db_util.js list-users');
  console.log('  node db_util.js reset-password <student_lrn> <new_password>');
  console.log('  node db_util.js delete-user <student_lrn>');
  console.log('  node db_util.js ban-user <student_lrn>');
  console.log('  node db_util.js unban-user <student_lrn>');
  console.log('  node db_util.js hash <password>');
  console.log('');
  await pool.end();
}

run().catch(err => { console.error('❌ Error:', err.message); pool.end(); });
