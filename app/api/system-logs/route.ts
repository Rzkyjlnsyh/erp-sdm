import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const log = await request.json();
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO system_logs (id, timestamp, actor_id, actor_name, actor_role, action_type, details, target_obj, metadata_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          log.id, 
          log.timestamp, 
          log.actorId, 
          log.actorName, 
          log.actorRole, 
          log.actionType, 
          log.details, 
          log.target || null, 
          log.metadata ? JSON.stringify(log.metadata) : null
        ]
      );
      
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Failed to save log', err);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}
