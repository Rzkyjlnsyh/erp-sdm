import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await authorize(['OWNER', 'MANAGER']);
    const id = params.id;
    const r = await request.json();

    await prisma.leaveRequest.update({
      where: { id },
      data: {
        type: r.type,
        description: r.description || '',
        startDate: new Date(r.startDate),
        endDate: r.endDate ? new Date(r.endDate) : new Date(r.startDate),
        attachmentUrl: r.attachmentUrl || null,
        status: r.status
      }
    });

    return NextResponse.json(r);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
