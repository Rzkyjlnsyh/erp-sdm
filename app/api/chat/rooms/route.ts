import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await authorize();
    // Get rooms where user is member
    const res = await pool.query(`
      SELECT r.*, 
             COALESCE(
               (SELECT json_agg(user_id) FROM chat_members WHERE room_id = r.id), '[]'
             ) as member_ids,
             (SELECT json_build_object('content', content, 'senderName', (SELECT name FROM users WHERE id = chat_messages.sender_id), 'timestamp', created_at) 
              FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_rooms r
      INNER JOIN chat_members cm ON r.id = cm.room_id
      WHERE cm.user_id = $1
      ORDER BY 
        CASE WHEN (SELECT created_at FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) IS NOT NULL 
        THEN (SELECT created_at FROM chat_messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1)
        ELSE r.created_at END DESC
    `, [user.id]);
    
    // Transform to match interface
    const rooms = res.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      createdBy: row.created_by,
      createdAt: Number(row.created_at),
      memberIds: row.member_ids,
      lastMessage: row.last_message ? {
         content: row.last_message.content,
         senderName: row.last_message.senderName || 'Unknown',
         timestamp: Number(row.last_message.timestamp)
      } : undefined
    }));

    return NextResponse.json(rooms);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authorize();
    const body = await request.json();
    const { name, type, memberIds } = body; // memberIds is array of string

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const roomId = Math.random().toString(36).substr(2, 9);
    const createdAt = Date.now();

    await pool.query('BEGIN');
    
    await pool.query(
      'INSERT INTO chat_rooms (id, name, type, created_by, created_at) VALUES ($1, $2, $3, $4, $5)',
      [roomId, name, type || 'GROUP', user.id, createdAt]
    );

    // Add creator
    await pool.query(
      'INSERT INTO chat_members (room_id, user_id, joined_at) VALUES ($1, $2, $3)',
      [roomId, user.id, createdAt]
    );

    // Add other members
    if (Array.isArray(memberIds)) {
      for (const mid of memberIds) {
        if (mid !== user.id) {
           await pool.query(
             'INSERT INTO chat_members (room_id, user_id, joined_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
             [roomId, mid, createdAt]
           );
        }
      }
    }

    await pool.query('COMMIT');
    
    return NextResponse.json({ id: roomId, name, type, createdBy: user.id, createdAt, memberIds: [user.id, ...(memberIds || [])] });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
