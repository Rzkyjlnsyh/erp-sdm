const { Pool } = require('pg');
const path = require('path');
// Load .env from root (two levels up or current directory depending on where run)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR FATAL: DATABASE_URL tidak ditemukan di file .env!");
  console.error("👉 Pastikan Anda sudah membuat file .env di folder utama dan mengisinya dengan URI dari Supabase.");
  process.exit(1);
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
