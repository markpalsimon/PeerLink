// PeerLink Database Setup Script
// Run this ONCE to create the database, tables, and admin user.
// Usage: node db/setup.js
// Make sure your .env file has the correct DB_PASSWORD before running!

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: 'postgres',  // connect to default DB first to create peerlink_db
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const dbName = process.env.DB_NAME || 'peerlink_db';

async function setup() {
  console.log('\n🔧 PeerLink Database Setup\n' + '='.repeat(40));

  // 1. Create the database if it doesn't exist
  try {
    console.log(`\n[1/3] Creating database "${dbName}"...`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`      ✅ Database "${dbName}" created!`);
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`      ℹ️  Database "${dbName}" already exists — skipping.`);
    } else {
      console.error('      ❌ Failed to create database:', err.message);
      console.error('\n⚠️  Check your .env file — DB_PASSWORD might be wrong.');
      process.exit(1);
    }
  } finally {
    await adminPool.end();
  }

  // 2. Connect to peerlink_db and run schema + seed
  const dbPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: dbName,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Run schema.sql
    console.log('\n[2/3] Creating tables (schema.sql)...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await dbPool.query(schema);
    console.log('      ✅ All tables created!');

    // Run seed.sql
    console.log('\n[3/3] Seeding admin account and data (seed.sql)...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await dbPool.query(seed);
    console.log('      ✅ Admin user, courses, and skills seeded!');

    console.log('\n' + '='.repeat(40));
    console.log('🎉 Setup complete! Your database is ready.');
    console.log('\n📋 Admin Login Credentials:');
    console.log('   Student ID : admin');
    console.log('   Password   : PeerLink@Admin2026');
    console.log('\n🚀 Now run: npm start');
    console.log('   Then open: http://localhost:3000\n');
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    if (err.message.includes('password')) {
      console.error('⚠️  Check your DB_PASSWORD in the .env file.');
    }
    process.exit(1);
  } finally {
    await dbPool.end();
  }
}

setup();
