
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await authorize(['OWNER', 'FINANCE']);
        const id = params.id;
        const body = await request.json();
        
        await pool.query(
          `UPDATE business_units SET name = $1, description = $2, is_active = $3 WHERE id = $4`,
          [body.name, body.description, body.isActive ?? true, id]
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error(error);
         return NextResponse.json({ error: 'Failed to update business unit' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await authorize(['OWNER', 'FINANCE']);
        const id = params.id;
        
        // Soft delete
        await pool.query('UPDATE business_units SET is_active = false WHERE id = $1', [id]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete business unit' }, { status: 500 });
    }
}
