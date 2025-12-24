
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function GET() {
  try {
    await authorize(['OWNER', 'FINANCE', 'MANAGER']);
    const res = await pool.query('SELECT * FROM transaction_categories ORDER BY type, name ASC');
    
    // Map snake_case to camelCase
    const categories = res.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      parentId: row.parent_id
    }));
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await authorize(['OWNER', 'FINANCE']);
    const body = await request.json();
    
    if (!body.name || !body.type) {
        return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    const id = Math.random().toString(36).substr(2, 9);
    
    await pool.query(
      `INSERT INTO transaction_categories (id, name, type, parent_id)
       VALUES ($1, $2, $3, $4)`,
      [id, body.name, body.type, body.parentId || null]
    );

    return NextResponse.json({
        id,
        name: body.name,
        type: body.type,
        parentId: body.parentId || null
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
