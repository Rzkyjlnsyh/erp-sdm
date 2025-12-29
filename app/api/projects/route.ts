import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await authorize(); 
    const p = await request.json();
    
    await prisma.project.create({
      data: {
        id: p.id,
        title: p.title,
        description: p.description || '',
        collaboratorsJson: JSON.stringify(p.collaborators || []),
        deadline: p.deadline ? new Date(p.deadline) : null,
        status: p.status,
        tasksJson: JSON.stringify(p.tasks || []),
        commentsJson: JSON.stringify(p.comments || []),
        isManagementOnly: !!p.isManagementOnly,
        priority: p.priority,
        createdBy: p.createdBy,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
      }
    });

    return NextResponse.json(p, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
