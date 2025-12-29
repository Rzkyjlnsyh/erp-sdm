import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await authorize(['OWNER']);
    const id = params.id;

    await prisma.user.update({
        where: { id },
        data: { 
            deviceIds: [], // Reset List
            // deviceId: null // If using legacy field, check schema. Assuming deviceIds is enough based on login logic.
        }
    });

    return NextResponse.json({ message: 'Device reset' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
