import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await authorize(['OWNER', 'FINANCE']);
    const pr = await request.json();

    // Transaction: Create Payroll Record + Auto Journal
    await prisma.$transaction(async (tx) => {
        // 1. Create Pay Record
        await tx.payrollRecord.create({
            data: {
                id: pr.id,
                userId: pr.userId,
                month: pr.month,
                basicSalary: pr.basicSalary,
                allowance: pr.allowance,
                totalMealAllowance: pr.totalMealAllowance,
                bonus: pr.bonus,
                deductions: pr.deductions,
                netSalary: pr.netSalary,
                isSent: !!pr.isSent,
                processedAt: pr.processedAt ? new Date(pr.processedAt) : new Date(),
                metadataJson: pr.metadata ? JSON.stringify(pr.metadata) : null
            }
        });

        // 2. Auto Journal
        const transactionId = Math.random().toString(36).substr(2, 9);
        const today = new Date();
        const desc = `Gaji Bulan ${pr.month} (Auto)`;
        
        await tx.transaction.create({
            data: {
                id: transactionId,
                date: today,
                amount: pr.netSalary,
                type: 'OUT',
                category: 'SALARY',
                description: desc,
                account: 'MAIN',
                imageUrl: null
            }
        });
    });

    return NextResponse.json(pr, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
