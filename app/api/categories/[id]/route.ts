
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await authorize(['OWNER', 'FINANCE']);
        const id = params.id;
        
        // Check if there are sub-categories or transactions using this category
        // For simplicity, we just delete or set to null. Better to restrict if used.
        // Option 1: Cascade delete sub-categories (Simple)
        await pool.query('DELETE FROM transaction_categories WHERE parent_id = $1', [id]);
        
        // Option 2: Delete the category itself
        await pool.query('DELETE FROM transaction_categories WHERE id = $1', [id]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await authorize(['OWNER', 'FINANCE']);
        const id = params.id;
        const body = await request.json();
        
        await pool.query(
          `UPDATE transaction_categories SET name = $1, type = $2 WHERE id = $3`,
          [body.name, body.type, id]
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error(error);
         return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}
