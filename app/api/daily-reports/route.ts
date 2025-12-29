import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await authorize();
    const r = await request.json();

    await prisma.dailyReport.create({
      data: {
        id: r.id,
        userId: r.userId,
        date: r.date,
        activitiesJson: JSON.stringify(r.activities || [])
      }
    });

    return NextResponse.json(r, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
