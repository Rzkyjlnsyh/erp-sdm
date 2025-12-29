import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const user = await authorize(['OWNER']);
    const s = await request.json();

    // Use id='1' or simplified singleton logic.
    // The previous logic verified there was a settings row.
    // We will upsert using a fixed query or assume finding first.
    // Prisma requires a unique key for update. Our schema has id(1).
    // Let's first Find First because we don't know the ID (usually '1' but who knows)
    
    // Safer: Updates the first record found or creates one if not exists (though logic implies it exists)
    const existing = await prisma.settings.findFirst();
    
    if (!existing) {
         // Should have been seeded, but if not:
         return NextResponse.json({ error: 'Settings not initialized' }, { status: 400 });
    }

    await prisma.settings.update({
        where: { id: existing.id },
        data: {
            officeLat: s.officeLocation.lat,
            officeLng: s.officeLocation.lng,
            officeStartTime: s.officeHours.start,
            officeEndTime: s.officeHours.end,
            telegramBotToken: s.telegramBotToken || '',
            telegramGroupId: s.telegramGroupId || '',
            telegramOwnerChatId: s.telegramOwnerChatId || '',
            companyProfileJson: JSON.stringify(s.companyProfile)
        }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
