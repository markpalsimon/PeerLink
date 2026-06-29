require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'peerlink_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function run() {
  try {
    console.log('Altering meetings table...');
    await pool.query(`
      ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 2,
      ADD COLUMN IF NOT EXISTS approved_participants JSONB DEFAULT '[]';
    `);
    console.log('✅ Meetings table altered successfully!');
  } catch (err) {
    console.error('❌ Alter failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
