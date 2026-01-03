
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Add 'daily_recap_time'
      await client.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='daily_recap_time') THEN 
            ALTER TABLE settings ADD COLUMN daily_recap_time VARCHAR(10) DEFAULT '18:00'; 
          END IF; 
        END $$;
      `);

      // Add 'daily_recap_content'
      await client.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='daily_recap_content') THEN 
            ALTER TABLE settings ADD COLUMN daily_recap_content TEXT DEFAULT '[]'; 
          END IF; 
        END $$;
      `);
      
      await client.query('COMMIT');
      return NextResponse.json({ success: true, message: 'Settings columns added.' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
