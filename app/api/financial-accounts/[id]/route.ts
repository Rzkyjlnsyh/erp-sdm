
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await authorize(['OWNER', 'FINANCE']); 
    const id = params.id;
    const body = await request.json();

    // Validation
    if (!body.name || !body.bankName) {
      return NextResponse.json({ error: 'Name and Bank Name are required' }, { status: 400 });
    }

    // 1. Get existing account to check name change
    const existingRes = await pool.query('SELECT name FROM financial_accounts WHERE id = $1', [id]);
    if (existingRes.rowCount === 0) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    const oldName = existingRes.rows[0].name;

    // 2. Update Account
    await pool.query(
      `UPDATE financial_accounts 
       SET name = $1, bank_name = $2, account_number = $3, description = $4, is_active = $5
       WHERE id = $6`,
      [body.name, body.bankName, body.accountNumber || '-', body.description || '', body.isActive ?? true, id]
    );

    // 3. Cascade Update Transactions if name changed
    if (oldName !== body.name) {
        await pool.query('UPDATE transactions SET account = $1 WHERE account = $2', [body.name, oldName]);
    }

    const updated = {
      id,
      name: body.name,
      bankName: body.bankName,
      accountNumber: body.accountNumber || '-',
      description: body.description || '',
      isActive: body.isActive ?? true
    };

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await authorize(['OWNER', 'FINANCE']);
        const id = params.id;
        
        // Soft delete (set is_active = false) is safer for financial data
        await pool.query('UPDATE financial_accounts SET is_active = false WHERE id = $1', [id]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
