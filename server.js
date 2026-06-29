// PeerLink - Express + PostgreSQL Backend Server
// Run with: node server.js

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// DATABASE CONNECTION
// Supports both local dev and cloud deployment
// (Render + Supabase uses DATABASE_URL)
// =============================================
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Supabase/Render
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'peerlink_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.error('   Make sure your .env file has the correct DB_PASSWORD.');
    process.exit(1);
  } else {
    release();
    console.log('✅ Connected to PostgreSQL database:', process.env.DB_NAME || 'peerlink_db');
  }
});

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// =============================================
// HELPER: Add a log entry
// =============================================
async function addLog(type, message) {
  try {
    await pool.query('INSERT INTO logs (type, message) VALUES ($1, $2)', [type, message]);
  } catch (err) {
    console.error('Log insert failed:', err.message);
  }
}

// =============================================
// HELPER: Map DB row -> frontend user object
// =============================================
function mapUser(row) {
  return {
    id:          row.id,
    studentId:   row.student_id,
    name:        row.name,
    email:       row.email,
    program:     row.program,
    yearSection: row.year_section,
    avatar:      row.avatar,
    bio:         row.bio,
    birthday:    row.birthday || '',
    address:     row.address || '',
    contactInfo: row.contact_info || '',
    isBanned:    row.is_banned || false,
    isOnline:    row.last_active ? (Date.now() - new Date(row.last_active).getTime() < 10000) : false,
    courses:     row.courses,
    skills:      row.skills,
    schedule:    row.schedule,
    isAdmin:     row.is_admin,
  };
}

// =============================================
// AUTH ROUTES
// =============================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Look up user by student_id or email (works for both admin and students)
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1 OR email = $1',
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Account not found. Check your Email/Student ID.' });
    }

    const user = result.rows[0];

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned due to violation of community guidelines.' });
    }

    // Verify password with bcrypt
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // Update last_active on login
    await pool.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    res.json({ success: true, user: mapUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/register-send-otp
app.post('/api/auth/register-send-otp', async (req, res) => {
  try {
    const { name, studentId, email, password, program, yearLevel, courses, skills, schedule } = req.body;

    // Block reserved admin ID
    if (studentId === 'admin') {
      return res.status(403).json({ success: false, message: 'That Student ID is reserved.' });
    }

    // Check for duplicate student ID or email
    const existing = await pool.query(
      'SELECT id FROM users WHERE student_id = $1 OR email = $2',
      [studentId, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Student ID or email already exists.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP + registration data in DB so it survives server restarts/sleeps
    const userData = JSON.stringify({ name, studentId, email, password, program, yearLevel, courses, skills, schedule });
    await pool.query(
      `INSERT INTO otp_store (email, code, expires_at, user_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, user_data = $4, created_at = NOW()`,
      [email, otp, expires, userData]
    );

    // Respond to client IMMEDIATELY — do NOT await the email
    res.json({ success: true, message: 'Verification OTP sent to email.' });

    // Send email in background (fire-and-forget) so slow SMTP never causes client timeout
    sendOTPMail(
      email,
      otp,
      'PeerLink Registration Verification Code',
      `Thank you for registering at PeerLink, ${name}! To activate and complete your registration, please verify your email address using the code below.`
    ).catch(err => console.error('Background email error (register):', err.message));

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error sending verification code.' });
  }
});

// POST /api/auth/register-verify-otp
app.post('/api/auth/register-verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Look up from DB
    const otpResult = await pool.query('SELECT * FROM otp_store WHERE email = $1', [email]);
    const pending = otpResult.rows[0];

    if (!pending || !pending.user_data) {
      return res.status(400).json({ success: false, message: 'No registration data found. Please register again.' });
    }

    if (Date.now() > Number(pending.expires_at)) {
      await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please register again.' });
    }

    if (pending.code !== code) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
    }

    const { name, studentId, password, program, yearLevel, courses, skills, schedule } = JSON.parse(pending.user_data);
    const passwordHash = await bcrypt.hash(password, 10);
    const newId = 'student_' + Date.now();
    const yearSection = `${program} ${yearLevel || ''}`.trim();

    await pool.query(
      `INSERT INTO users (id, student_id, name, email, password_hash, program, year_section, courses, skills, schedule, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)`,
      [newId, studentId, name, email, passwordHash, program, yearSection,
       JSON.stringify(courses || []),
       JSON.stringify(skills || { have: [], want: [] }),
       JSON.stringify(schedule || {})]
    );

    // Clean up OTP from DB
    await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [newId]);
    await addLog('user', `New user ${name} registered & verified email.`);
    res.status(201).json({ success: true, user: mapUser(result.rows[0]) });
  } catch (err) {
    console.error('Verify registration OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error completing registration.' });
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email address not found.' });
    }

    const user = result.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in DB (no user_data for password reset — just code + expiry)
    await pool.query(
      `INSERT INTO otp_store (email, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, user_data = NULL, created_at = NOW()`,
      [email, otp, expires]
    );

    // Respond to client IMMEDIATELY — do NOT await the email
    res.json({ success: true, message: 'Verification OTP sent to email.' });

    // Send email in background
    sendOTPMail(
      email,
      otp,
      'PeerLink Password Reset Verification Code',
      `Hello ${user.name},\n\nYou requested a password reset. Please use the verification code below to set a new password.`
    ).catch(err => console.error('Background email error (forgot-password):', err.message));

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error processing password recovery.' });
  }
});

// POST /api/auth/verify-forgot-otp
app.post('/api/auth/verify-forgot-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await pool.query('SELECT * FROM otp_store WHERE email = $1', [email]);
    const store = result.rows[0];

    if (!store) {
      return res.status(400).json({ success: false, message: 'Verification code not found or expired.' });
    }

    if (Date.now() > Number(store.expires_at)) {
      await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
      return res.status(400).json({ success: false, message: 'Verification code has expired.' });
    }

    if (store.code !== code) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
    }

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    console.error('Verify forgot OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying code.' });
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await pool.query('SELECT * FROM otp_store WHERE email = $1', [email]);
    const store = result.rows[0];

    if (!store || store.code !== code || Date.now() > Number(store.expires_at)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification session.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);

    // Clean up OTP from DB
    await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);

    res.json({ success: true, message: 'Password has been successfully updated.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error updating password.' });
  }
});

// GET /api/auth/get-otp — retrieves generated code for testing / demo fallbacks
app.get('/api/auth/get-otp', async (req, res) => {
  try {
    const { email } = req.query;
    const result = await pool.query('SELECT code FROM otp_store WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No code found for this email address.' });
    }
    res.json({ success: true, code: result.rows[0].code });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving code.' });
  }
});


// =============================================
// USER ROUTES
// =============================================

// GET /api/users — get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at ASC');
    res.json(result.rows.map(mapUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id — update profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, bio, program, yearSection, avatar, courses, skills, schedule, password, birthday, address, contactInfo } = req.body;

    let passwordHash = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name        !== undefined) { fields.push(`name = $${idx++}`);         values.push(name); }
    if (bio         !== undefined) { fields.push(`bio = $${idx++}`);          values.push(bio); }
    if (program     !== undefined) { fields.push(`program = $${idx++}`);      values.push(program); }
    if (yearSection !== undefined) { fields.push(`year_section = $${idx++}`); values.push(yearSection); }
    if (avatar      !== undefined) { fields.push(`avatar = $${idx++}`);       values.push(avatar); }
    if (birthday    !== undefined) { fields.push(`birthday = $${idx++}`);     values.push(birthday); }
    if (address     !== undefined) { fields.push(`address = $${idx++}`);      values.push(address); }
    if (contactInfo !== undefined) { fields.push(`contact_info = $${idx++}`); values.push(contactInfo); }
    if (courses     !== undefined) { fields.push(`courses = $${idx++}`);      values.push(JSON.stringify(courses)); }
    if (skills      !== undefined) { fields.push(`skills = $${idx++}`);       values.push(JSON.stringify(skills)); }
    if (schedule    !== undefined) { fields.push(`schedule = $${idx++}`);     values.push(JSON.stringify(schedule)); }
    if (passwordHash !== undefined){ fields.push(`password_hash = $${idx++}`);values.push(passwordHash); }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true, user: mapUser(result.rows[0]) });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id — admin only
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await addLog('user', `User ${req.params.id} deleted by admin.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/avatar — upload profile picture as base64
app.post('/api/users/:id/avatar', async (req, res) => {
  try {
    const { avatarData } = req.body; // base64 data URL: "data:image/jpeg;base64,..."
    const userId = req.params.id;

    if (!avatarData) {
      return res.status(400).json({ success: false, message: 'No image data provided.' });
    }

    // Validate it's a real image data URL
    const validPrefixes = ['data:image/jpeg;base64,', 'data:image/jpg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,', 'data:image/gif;base64,'];
    const isValid = validPrefixes.some(prefix => avatarData.startsWith(prefix));
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid image format. Use JPG, PNG, WebP, or GIF.' });
    }

    // Enforce 5MB limit (base64 is ~33% larger than raw so base64 5MB ~ 3.75MB raw)
    const sizeInBytes = (avatarData.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Image too large. Maximum size is 5MB.' });
    }

    await pool.query('UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2', [avatarData, userId]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: mapUser(result.rows[0]) });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ success: false, message: 'Server error uploading avatar.' });
  }
});

// =============================================
// CONNECTIONS ROUTES
// =============================================

// GET /api/connections?userId=xxx
app.get('/api/connections', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM connections';
    const params = [];
    if (userId) {
      query += ' WHERE sender_id = $1 OR receiver_id = $1';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    const mapped = result.rows.map(r => ({
      id:         r.id,
      senderId:   r.sender_id,
      receiverId: r.receiver_id,
      status:     r.status,
      timestamp:  new Date(r.created_at).getTime(),
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/connections — send study request
app.post('/api/connections', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const result = await pool.query(
      `INSERT INTO connections (sender_id, receiver_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (sender_id, receiver_id) DO NOTHING
       RETURNING *`,
      [senderId, receiverId]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ success: false, message: 'Connection already exists.' });
    }

    // Get names for the log
    const senderQ   = await pool.query('SELECT name FROM users WHERE id = $1', [senderId]);
    const receiverQ = await pool.query('SELECT name FROM users WHERE id = $1', [receiverId]);
    const senderName   = senderQ.rows[0]?.name   || senderId;
    const receiverName = receiverQ.rows[0]?.name || receiverId;
    await addLog('connection', `${senderName} sent a study request to ${receiverName}.`);

    const r = result.rows[0];
    res.status(201).json({
      success: true,
      connection: { id: r.id, senderId: r.sender_id, receiverId: r.receiver_id, status: r.status, timestamp: new Date(r.created_at).getTime() }
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/connections/:id — accept or reject
app.put('/api/connections/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const result = await pool.query(
      'UPDATE connections SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Connection not found' });

    const r = result.rows[0];
    if (status === 'accepted') {
      const senderQ   = await pool.query('SELECT name FROM users WHERE id = $1', [r.sender_id]);
      const receiverQ = await pool.query('SELECT name FROM users WHERE id = $1', [r.receiver_id]);
      const senderName   = senderQ.rows[0]?.name   || r.sender_id;
      const receiverName = receiverQ.rows[0]?.name || r.receiver_id;

      // Auto-create chat room
      const roomId = [r.sender_id, r.receiver_id].sort().join('_');
      await pool.query(
        'INSERT INTO chat_rooms (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
        [roomId]
      );
      await addLog('connection', `${receiverName} accepted study request from ${senderName}.`);
    }

    res.json({ success: true, connection: { id: r.id, senderId: r.sender_id, receiverId: r.receiver_id, status: r.status } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// CHAT ROUTES
// =============================================

// GET /api/chats — all rooms (for a user)
app.get('/api/chats', async (req, res) => {
  try {
    // Return all chat room IDs with their latest message
    const result = await pool.query(`
      SELECT cr.id as room_id,
             m.sender_id, m.sender_name, m.text, m.sent_at
      FROM chat_rooms cr
      LEFT JOIN LATERAL (
        SELECT * FROM messages WHERE room_id = cr.id ORDER BY sent_at DESC LIMIT 1
      ) m ON true
      ORDER BY m.sent_at DESC NULLS LAST
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chats/:roomId — messages in a room
app.get('/api/chats/:roomId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE room_id = $1 ORDER BY sent_at ASC',
      [req.params.roomId]
    );
    const messages = result.rows.map(r => ({
      id:         r.id,
      senderId:   r.sender_id,
      senderName: r.sender_name,
      text:       r.text,
      time:       new Date(r.sent_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isRead:     r.is_read
    }));
    res.json({ roomId: req.params.roomId, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chats/:roomId — send a message
app.post('/api/chats/:roomId', async (req, res) => {
  try {
    const { senderId, senderName, text } = req.body;
    const roomId = req.params.roomId;

    // Ensure room exists
    await pool.query(
      'INSERT INTO chat_rooms (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
      [roomId]
    );

    const result = await pool.query(
      'INSERT INTO messages (room_id, sender_id, sender_name, text) VALUES ($1, $2, $3, $4) RETURNING *',
      [roomId, senderId, senderName, text]
    );
    const r = result.rows[0];
    res.status(201).json({
      id:         r.id,
      senderId:   r.sender_id,
      senderName: r.sender_name,
      text:       r.text,
      time:       new Date(r.sent_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isRead:     r.is_read
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// METADATA ROUTES
// =============================================

// GET /api/courses
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM courses ORDER BY id');
    res.json(result.rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/skills
app.get('/api/skills', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM skills ORDER BY id');
    res.json(result.rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// ADMIN LOGS ROUTES
// =============================================

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY created_at DESC LIMIT 100');
    const logs = result.rows.map(r => ({
      time:    new Date(r.created_at).toLocaleString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''),
      type:    r.type,
      message: r.message,
    }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs
app.post('/api/logs', async (req, res) => {
  try {
    const { type, message } = req.body;
    await addLog(type, message);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// STATS ROUTE (Admin Dashboard)
// =============================================
app.get('/api/stats', async (req, res) => {
  try {
    const [usersR, connR, pendingR, messagesR, activeR] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE is_admin = false'),
      pool.query("SELECT COUNT(*) FROM connections WHERE status = 'accepted'"),
      pool.query("SELECT COUNT(*) FROM connections WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query("SELECT COUNT(*) FROM users WHERE last_active > NOW() - INTERVAL '10 seconds' AND is_admin = false"),
    ]);
    res.json({
      totalUsers:       parseInt(usersR.rows[0].count),
      totalConnections: parseInt(connR.rows[0].count),
      pendingRequests:  parseInt(pendingR.rows[0].count),
      totalMessages:    parseInt(messagesR.rows[0].count),
      activeUsers:      parseInt(activeR.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// HEARTBEAT & REAL-TIME STATUS ROUTE
// =============================================
app.post('/api/users/heartbeat', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // Check if banned
    const checkBan = await pool.query('SELECT is_banned FROM users WHERE id = $1', [userId]);
    if (checkBan.rows.length > 0 && checkBan.rows[0].is_banned) {
      return res.json({ success: false, isBanned: true });
    }

    await pool.query('UPDATE users SET last_active = NOW() WHERE id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// READ/SEEN RECEIPT ROUTE
// =============================================
app.post('/api/chats/:roomId/read', async (req, res) => {
  try {
    const { userId } = req.body; // the reader
    const roomId = req.params.roomId;
    await pool.query(
      'UPDATE messages SET is_read = true WHERE room_id = $1 AND sender_id != $2 AND is_read = false',
      [roomId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// BAN/UNBAN MODERATION ROUTES
// =============================================
app.post('/api/users/:id/ban', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_banned = true WHERE id = $1', [req.params.id]);
    await addLog('system', `User ${req.params.id} was BANNED by Admin.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:id/unban', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_banned = false WHERE id = $1', [req.params.id]);
    await addLog('system', `User ${req.params.id} was UNBANNED by Admin.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// COLLABORATION DELETION ROUTE
// =============================================
app.delete('/api/connections/:id', async (req, res) => {
  try {
    const connId = req.params.id;
    const connResult = await pool.query('SELECT * FROM connections WHERE id = $1', [connId]);
    if (connResult.rows.length === 0) return res.status(404).json({ error: 'Connection not found' });
    
    const conn = connResult.rows[0];
    await pool.query('DELETE FROM connections WHERE id = $1', [connId]);
    
    // Delete corresponding chat room
    const roomId1 = `${conn.sender_id}_${conn.receiver_id}`;
    const roomId2 = `${conn.receiver_id}_${conn.sender_id}`;
    await pool.query('DELETE FROM chat_rooms WHERE id = $1 OR id = $2', [roomId1, roomId2]);
    
    await addLog('system', `Collaboration ${connId} between ${conn.sender_id} and ${conn.receiver_id} deleted by Admin.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// MEETINGS API ROUTES
// =============================================
// Active participants in-memory store
const activeParticipants = {}; // { meetingId: [userIds] }

app.get('/api/meetings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meetings ORDER BY created_at DESC');
    const mapped = result.rows.map(r => ({
      id:           r.id,
      host_id:      r.host_id,
      guest_id:     r.guest_id,
      topic:        r.topic,
      meeting_date: r.meeting_date,
      start_time:   r.start_time,
      end_time:     r.end_time,
      meeting_type: r.meeting_type,
      notes:        r.notes,
      created_at:   new Date(r.created_at).getTime(),
      status:       r.status || 'pending',
      is_public:    r.is_public || false,
      max_participants: r.max_participants || 2,
      approved_participants: r.approved_participants || [],
      active_count: (activeParticipants[r.id] || []).length
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { host_id, guest_id, topic, meeting_date, start_time, end_time, meeting_type, notes, is_public, max_participants } = req.body;
    
    const maxParticipants = parseInt(max_participants) || 2;
    if (isNaN(maxParticipants) || maxParticipants < 2 || maxParticipants > 100) {
      return res.status(400).json({ error: 'Maximum participants must be between 2 and 100.' });
    }

    const initialApproved = JSON.stringify([host_id]);
    const result = await pool.query(
      `INSERT INTO meetings (host_id, guest_id, topic, meeting_date, start_time, end_time, meeting_type, notes, is_public, max_participants, approved_participants)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [host_id, guest_id, topic, meeting_date, start_time, end_time, meeting_type, notes, is_public || false, maxParticipants, initialApproved]
    );
    const r = result.rows[0];
    res.status(201).json({
      success: true,
      meeting: {
        id:           r.id,
        host_id:      r.host_id,
        guest_id:     r.guest_id,
        topic:        r.topic,
        meeting_date: r.meeting_date,
        start_time:   r.start_time,
        end_time:     r.end_time,
        meeting_type: r.meeting_type,
        notes:        r.notes,
        created_at:   new Date(r.created_at).getTime(),
        status:       r.status || 'pending',
        is_public:    r.is_public || false,
        max_participants: r.max_participants || 2,
        approved_participants: r.approved_participants || [],
        active_count: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OTP temporary storage — now backed by PostgreSQL (otp_store table)
// In-memory fallbacks kept for legacy reference only
const otpStore = {};            // DEPRECATED: kept for safety, now using DB
const pendingRegistrations = {}; // DEPRECATED: kept for safety, now using DB

// Helper function to send OTP email via Resend API (HTTP) or Gmail SMTP
async function sendOTPMail(email, otp, subject, bodyText) {
  console.log(`[OTP] Code for ${email}: ${otp}`);

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#6366f1;margin-bottom:8px;">PeerLink</h2>
      <p style="color:#334155;">${bodyText}</p>
      <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
        <p style="margin:0;font-size:12px;color:#64748b;">Your Verification Code</p>
        <p style="margin:8px 0 0;font-size:36px;font-weight:bold;letter-spacing:8px;color:#6366f1;">${otp}</p>
      </div>
      <p style="font-size:12px;color:#94a3b8;">This code expires in 10 minutes.</p>
    </div>
  `;

  // Option 1: Use Mailersend API if configured (using key starting with mlsn.)
  const mailersendKey = process.env.MAILERSEND_API_KEY || process.env.RESEND_API_KEY;
  if (mailersendKey && mailersendKey.startsWith('mlsn.')) {
    try {
      // Mailersend free tier default test domain info
      // Free accounts can send to their registered account emails using sandbox domains
      const response = await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mailersendKey}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          from: {
            email: 'MS_Xm68k5@trial-ynrwg1pd7p842k7d.mlsender.net', // Default Mailersend sandbox sender
            name: 'PeerLink'
          },
          to: [
            {
              email: email,
              name: email.split('@')[0]
            }
          ],
          subject: subject,
          text: `${bodyText}\n\nVerification Code: ${otp}`,
          html: htmlContent
        })
      });
      if (response.ok) {
        console.log(`[OTP] Email successfully sent to ${email} via Mailersend API`);
        return;
      } else {
        const text = await response.text();
        console.error(`[OTP] Mailersend API error:`, text);
      }
    } catch (mailersendErr) {
      console.error(`[OTP] Mailersend HTTP request failed:`, mailersendErr.message);
    }
  }

  // Option 1.5: Use Resend API if API Key is configured
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('mlsn.')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'PeerLink <onboarding@resend.dev>',
          to: email,
          subject: subject,
          html: htmlContent
        })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`[OTP] Email successfully sent to ${email} via Resend API`);
        return;
      } else {
        console.error(`[OTP] Resend API error:`, data.message || JSON.stringify(data));
      }
    } catch (resendErr) {
      console.error(`[OTP] Resend HTTP request failed:`, resendErr.message);
    }
  }

  // Option 2: Fallback to Gmail SMTP (Good for local development)
  const emailUser = process.env.EMAIL_USER || 'vincentpalsi02@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'ksir dbel skpv fdag'; // ← spaces required for Gmail App Password

  if (!emailUser || !emailPass) {
    console.log('[OTP] EMAIL_USER or EMAIL_PASS not set — SMTP fallback skipped.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: emailUser,
        pass: emailPass
      },
      connectionTimeout: 10000,
      family: 4, // Force IPv4
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"PeerLink" <${emailUser}>`,
      to: email,
      subject: subject,
      text: `${bodyText}\n\nVerification Code: ${otp}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP] Email successfully sent to ${email} via SMTP`);
  } catch (err) {
    console.error(`[OTP] Failed to send email to ${email} via SMTP:`, err.message);
  }
}

// Join requests in-memory store
const meetingJoinRequests = {}; // { meetingId: [ { userId, name } ] }

app.post('/api/meetings/:id/join', (req, res) => {
  const { userId } = req.body;
  const meetId = req.params.id;
  if (!activeParticipants[meetId]) activeParticipants[meetId] = [];
  if (!activeParticipants[meetId].includes(userId)) {
    activeParticipants[meetId].push(userId);
  }
  res.json({ success: true, count: activeParticipants[meetId].length, participants: activeParticipants[meetId] });
});

app.post('/api/meetings/:id/leave', (req, res) => {
  const { userId } = req.body;
  const meetId = req.params.id;
  if (activeParticipants[meetId]) {
    activeParticipants[meetId] = activeParticipants[meetId].filter(id => String(id) !== String(userId));
  }
  res.json({ success: true, count: activeParticipants[meetId] ? activeParticipants[meetId].length : 0 });
});

app.post('/api/meetings/:id/join-request', (req, res) => {
  const { userId, name } = req.body;
  const meetId = req.params.id;
  if (!meetingJoinRequests[meetId]) meetingJoinRequests[meetId] = [];
  if (!meetingJoinRequests[meetId].some(r => String(r.userId) === String(userId))) {
    meetingJoinRequests[meetId].push({ userId, name });
  }
  res.json({ success: true });
});

app.get('/api/meetings/:id/join-requests', (req, res) => {
  res.json(meetingJoinRequests[req.params.id] || []);
});

app.post('/api/meetings/:id/approve-request', async (req, res) => {
  const { userId, action } = req.body; // 'accept' or 'reject'
  const meetId = req.params.id;
  if (meetingJoinRequests[meetId]) {
    meetingJoinRequests[meetId] = meetingJoinRequests[meetId].filter(r => String(r.userId) !== String(userId));
  }
  if (action === 'accept') {
    const meetRes = await pool.query('SELECT approved_participants FROM meetings WHERE id = $1', [meetId]);
    if (meetRes.rows.length > 0) {
      const current = meetRes.rows[0].approved_participants || [];
      if (!current.includes(userId)) {
        current.push(userId);
        await pool.query('UPDATE meetings SET approved_participants = $1 WHERE id = $2', [JSON.stringify(current), meetId]);
      }
    }
  }
  res.json({ success: true });
});

app.post('/api/meetings/:id/remove-participant', async (req, res) => {
  const { userId } = req.body;
  const meetId = req.params.id;
  const meetRes = await pool.query('SELECT approved_participants FROM meetings WHERE id = $1', [meetId]);
  if (meetRes.rows.length > 0) {
    let current = meetRes.rows[0].approved_participants || [];
    current = current.filter(id => String(id) !== String(userId));
    await pool.query('UPDATE meetings SET approved_participants = $1 WHERE id = $2', [JSON.stringify(current), meetId]);
  }
  res.json({ success: true });
});

app.post('/api/meetings/:id/accept-invitation', async (req, res) => {
  const { userId } = req.body;
  const meetId = req.params.id;
  const meetRes = await pool.query('SELECT approved_participants FROM meetings WHERE id = $1', [meetId]);
  if (meetRes.rows.length > 0) {
    const current = meetRes.rows[0].approved_participants || [];
    if (!current.includes(userId)) {
      current.push(userId);
    }
    await pool.query("UPDATE meetings SET status = 'accepted', approved_participants = $1 WHERE id = $2", [JSON.stringify(current), meetId]);
  }
  res.json({ success: true });
});

app.post('/api/meetings/:id/decline-invitation', async (req, res) => {
  await pool.query("UPDATE meetings SET status = 'declined' WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});


app.delete('/api/meetings/:id', async (req, res) => {
  try {
    const meetId = req.params.id;
    await pool.query('DELETE FROM meetings WHERE id = $1', [meetId]);
    delete callSignals[meetId];
    delete meetingJoinRequests[meetId];
    delete activeParticipants[meetId];
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebRTC Signaling store
const callSignals = {}; // { meetingId: [ { senderId, data, timestamp } ] }

app.post('/api/meetings/:id/signal', (req, res) => {
  const { senderId, data } = req.body;
  const meetId = req.params.id;
  if (!callSignals[meetId]) {
    callSignals[meetId] = [];
  }
  callSignals[meetId].push({ senderId, data, timestamp: Date.now() });
  res.json({ success: true });
});

app.get('/api/meetings/:id/signal', (req, res) => {
  const meetId = req.params.id;
  const { userId } = req.query;
  const signals = callSignals[meetId] || [];
  // Return signals not sent by this user
  const newSignals = signals.filter(s => String(s.senderId) !== String(userId));
  // Clear signals that are consumed
  callSignals[meetId] = signals.filter(s => String(s.senderId) === String(userId));
  res.json(newSignals);
});

// =============================================
// CATCH-ALL: serve index.html
// =============================================
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// =============================================
// START SERVER
// =============================================
app.listen(PORT, () => {
  console.log(`🚀 PeerLink server running at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT} in your browser`);
});
