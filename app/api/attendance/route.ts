import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await authorize();
    const a = await request.json();

    await prisma.attendance.create({
      data: {
        id: a.id,
        userId: a.userId,
        date: a.date,
        timeIn: a.timeIn,
        timeOut: a.timeOut || null,
        isLate: (a.isLate ? 1 : 0) as any,
        lateReason: a.lateReason || null,
        selfieUrl: a.selfieUrl,
        checkoutSelfieUrl: a.checkOutSelfieUrl || null,
        locationLat: a.location.lat,
        locationLng: a.location.lng
      }
    });

    return NextResponse.json(a, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
