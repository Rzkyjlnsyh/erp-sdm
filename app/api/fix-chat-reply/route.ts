import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add reply_to_id column if not exists
    await client.query(`
      ALTER TABLE chat_messages 
      ADD COLUMN IF NOT EXISTS reply_to_id VARCHAR(50);
    `);
    
    await client.query('COMMIT');
    return NextResponse.json({ message: 'Chat Database Upgraded: Added reply support.' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
