// PeerLink DB Utility Tool
// Usage:
//   node db_util.js hash <password>
//   node db_util.js reset-password <student_id> <new_password>
//   node db_util.js delete-user <student_id>
//   node db_util.js list-users

const { Pool } = require('./node_modules/pg');
const bcrypt = require('./node_modules/bcrypt');

const pool = new Pool({
  host:     'localhost',
  port:     5432,
  database: 'peerlink_db',
  user:     'postgres',
  password: 'Judie0126',
});

const [,, command, arg1, arg2] = process.argv;

async function run() {
  if (command === 'hash') {
    if (!arg1) { console.log('Usage: node db_util.js hash <password>'); process.exit(1); }
    const hash = await bcrypt.hash(arg1, 10);
    console.log('\n✅ bcrypt hash for password:\n');
    console.log(hash);
    console.log('\nPaste this into the password_hash column in pgAdmin.\n');
    await pool.end();
    return;
  }

  if (command === 'reset-password') {
    if (!arg1 || !arg2) { console.log('Usage: node db_util.js reset-password <student_id> <new_password>'); process.exit(1); }
    const hash = await bcrypt.hash(arg2, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE student_id = $2 RETURNING name, email',
      [hash, arg1]
    );
    if (result.rows.length === 0) {
      console.log('No user found with student_id: ' + arg1);
    } else {
      console.log('Password reset for: ' + result.rows[0].name + ' (' + result.rows[0].email + ')');
      console.log('New password: "' + arg2 + '"');
    }
    await pool.end();
    return;
  }

  if (command === 'delete-user') {
    if (!arg1) { console.log('Usage: node db_util.js delete-user <student_id>'); process.exit(1); }
    if (arg1 === 'admin') { console.log('Cannot delete the admin account.'); await pool.end(); return; }
    const result = await pool.query(
      'DELETE FROM users WHERE student_id = $1 RETURNING name, email',
      [arg1]
    );
    if (result.rows.length === 0) {
      console.log('No user found with student_id: ' + arg1);
    } else {
      console.log('Deleted user: ' + result.rows[0].name + ' (' + result.rows[0].email + ')');
    }
    await pool.end();
    return;
  }

  if (command === 'list-users') {
    const result = await pool.query('SELECT student_id, name, email, is_admin FROM users ORDER BY is_admin DESC, name');
    console.log('Registered Users:');
    result.rows.forEach(r => {
      const role = r.is_admin ? '[ADMIN]' : '[STUDENT]';
      console.log('  ' + role + ' ' + r.name + ' | ID: ' + r.student_id + ' | Email: ' + r.email);
    });
    await pool.end();
    return;
  }

  console.log('PeerLink DB Utility');
  console.log('Commands:');
  console.log('  node db_util.js hash <password>');
  console.log('  node db_util.js reset-password <student_id> <password>');
  console.log('  node db_util.js delete-user <student_id>');
  console.log('  node db_util.js list-users');
  await pool.end();
}

run().catch(err => { console.error('Error:', err.message); pool.end(); });
