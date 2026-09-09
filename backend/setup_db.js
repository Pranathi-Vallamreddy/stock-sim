// setup_db.js — create all tables and seed stocks by running database_setup.sql.
// Usage: node setup_db.js   (reads DATABASE_URL from .env)
const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db');

async function setup() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');
  console.log('🚀 Running database_setup.sql ...');
  try {
    await pool.query(sql);           // node-postgres runs the whole multi-statement file
    console.log('✅ Database ready: tables created and stocks seeded.');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setup();
