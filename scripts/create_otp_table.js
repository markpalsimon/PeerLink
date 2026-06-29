const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        email         VARCHAR(255) PRIMARY KEY,
        code          VARCHAR(10)  NOT NULL,
        expires_at    BIGINT       NOT NULL,
        user_data     TEXT         DEFAULT NULL,
        created_at    TIMESTAMPTZ  DEFAULT NOW()
      )
    `);
    console.log('otp_store table created on Render DB');
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    await pool.end();
  }
}
run();
