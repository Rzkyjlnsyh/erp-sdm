import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await authorize();
    const id = params.id;
    const a = await request.json();

    await prisma.attendance.update({
      where: { id },
      data: {
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

    return NextResponse.json(a);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
