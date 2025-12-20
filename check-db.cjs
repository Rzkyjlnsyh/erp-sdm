const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log("Testing Database Connection...");
  // Hide password more robustly
  const safeUrl = process.env.DATABASE_URL.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  console.log("URL:", safeUrl);
  
  try {
    const client = await pool.connect();
    console.log("✅ Connection Successful!");
    
    const res = await client.query('SELECT NOW()');
    console.log("Database Time:", res.rows[0].now);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection Failed:", err.message);
    if (err.code) console.error("Error Code:", err.code);
    process.exit(1);
  }
}

testConnection();
