const { pool } = require('./server/db.cjs');

async function migrate() {
  console.log("Starting migration to add audit columns...");
  
  try {
    // 1. Check connection
    const res = await pool.query('SELECT NOW()');
    console.log("Connected to DB at", res.rows[0].now);

    // 2. Add columns
    // approver_id (TEXT/UUID) - assuming userId is string/text based on previous files
    // approver_name (TEXT)
    // action_note (TEXT)
    // action_at (BIGINT) - for Date.now()
    
    await pool.query(`
      ALTER TABLE leave_requests 
      ADD COLUMN IF NOT EXISTS approver_id TEXT,
      ADD COLUMN IF NOT EXISTS approver_name TEXT,
      ADD COLUMN IF NOT EXISTS action_note TEXT,
      ADD COLUMN IF NOT EXISTS action_at BIGINT;
    `);

    console.log("✅ Successfully added columns: approver_id, approver_name, action_note, action_at");
  } catch (err) {
    console.error("❌ Migration Failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
