const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgre:r66THbK7KHNZpb2rBTCsasUPnSlvGrRK@dpg-d914etf7f7vs73d4fqe0-a.singapore-postgres.render.com/peerlink_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const result = await pool.query(`
    SELECT column_name, data_type, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `);
  console.log('=== Render Users Columns ===');
  console.table(result.rows);
  await pool.end();
}

run().catch(e => {
  console.error(e);
  pool.end();
});
