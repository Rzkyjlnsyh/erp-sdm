
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await authorize(['OWNER', 'FINANCE', 'MANAGER']);

    const { searchParams } = new URL(request.url);
    const businessUnitId = searchParams.get('businessUnitId');
    const hasUnitFilter = businessUnitId && businessUnitId !== 'ALL';

    const client = await pool.connect();
    try {
      // 1. Calculate Balance per Account
      // Note: We group by 'account' column in transactions.
      let balanceQuery = `
        SELECT account, 
               SUM(CASE WHEN type = 'IN' THEN amount ELSE -amount END) as balance
        FROM transactions
      `;
      const balanceParams: any[] = [];
      
      if (hasUnitFilter) {
          balanceQuery += ` WHERE business_unit_id = $1`;
          balanceParams.push(businessUnitId);
      }
      balanceQuery += ` GROUP BY account`;

      const balanceRes = await client.query(balanceQuery, balanceParams);

      // 2. Calculate This Month's P&L
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      
      let plQuery = `
        SELECT type, SUM(amount) as total
        FROM transactions
        WHERE date >= $1 AND date <= $2
      `;
      const plParams: any[] = [startOfMonth, endOfMonth];

      if (hasUnitFilter) {
          plQuery += ` AND business_unit_id = $3`;
          plParams.push(businessUnitId);
      }
      plQuery += ` GROUP BY type`;
      
      const plRes = await client.query(plQuery, plParams);

      const income = Number(plRes.rows.find(r => r.type === 'IN')?.total || 0);
      const expense = Number(plRes.rows.find(r => r.type === 'OUT')?.total || 0);

      const accountBalances: Record<string, number> = {};
      let totalAssets = 0;

      balanceRes.rows.forEach(r => {
        const bal = Number(r.balance);
        accountBalances[r.account] = bal;
        totalAssets += bal;
      });

      return NextResponse.json({
        accountBalances,
        totalAssets,
        monthStats: {
          income,
          expense,
          profit: income - expense
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
