import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await authorize();
    const id = params.id;
    const p = await request.json();

    if (p.status === 'DONE' && user.role === 'STAFF') {
      return NextResponse.json({ error: 'Not allowed to mark DONE' }, { status: 403 });
    }

    await prisma.project.update({
      where: { id },
      data: {
        title: p.title,
        description: p.description || '',
        collaboratorsJson: JSON.stringify(p.collaborators || []),
        deadline: p.deadline ? new Date(p.deadline) : null,
        status: p.status,
        tasksJson: JSON.stringify(p.tasks || []),
        commentsJson: JSON.stringify(p.comments || []),
        isManagementOnly: !!p.isManagementOnly,
        priority: p.priority
      }
    });

    return NextResponse.json(p);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Support DELETE if required by recent user requests
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await authorize(['OWNER']); // Only Owner Delete
    const id = params.id;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
