import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Only allow existing members to add others? Or just anyone? 
    // Let's restrict to existing members.
    const currentUser = await authorize();
    const body = await request.json();
    const { roomId, userIds } = body;

    if (!roomId || !Array.isArray(userIds)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const memberCheck = await pool.query('SELECT 1 FROM chat_members WHERE room_id=$1 AND user_id=$2', [roomId, currentUser.id]);
    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: 'You must be a member to add others' }, { status: 403 });
    }

    // Insert new members
    for (const uid of userIds) {
      await pool.query(
        'INSERT INTO chat_members (room_id, user_id, joined_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [roomId, uid, Date.now()]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add members' }, { status: 500 });
  }
}
