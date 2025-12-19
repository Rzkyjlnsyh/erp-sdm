const { Pool } = require('pg');
const path = require('path');
// In Vercel, env vars are injected securely, no file loading needed.
// Only load from file if running locally AND file exists.
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
  } catch (e) { /* ignore */ }
}

// Validation (still good to keep to debug Vercel logs)
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing in environment variables!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  pool
};
