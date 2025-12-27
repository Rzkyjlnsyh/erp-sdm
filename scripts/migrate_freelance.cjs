const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.resolve(__dirname, '.env');
// Fallback connection string (optional, but good to have variable defined)
let connString = ""; 

if (fs.existsSync(envPath)) {
  const fileContent = fs.readFileSync(envPath, 'utf8');
  fileContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2 && parts[0].trim() === 'DATABASE_URL') {
      let val = parts.slice(1).join('=').trim();
      // Remove quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      connString = val;
    }
  });
}

if (!connString) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new Pool({
  connectionString: connString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    console.log("🚀 Starting database migration for Freelance feature...");
    
    // Add is_freelance column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_freelance BOOLEAN DEFAULT FALSE;
    `);
    
    console.log("✅ Column 'is_freelance' added to 'users' table.");
    
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
