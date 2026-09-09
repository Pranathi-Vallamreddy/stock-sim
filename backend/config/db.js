// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Local Postgres has no SSL; hosted (Supabase/Neon/etc.) requires it.
const connectionString = process.env.DATABASE_URL || '';
const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  family: 4 // force IPv4 (avoids IPv6 resolution issues with some hosts)
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to Supabase PostgreSQL database');
    release();
  }
});

// Safe query helper
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

module.exports = { pool, query };
