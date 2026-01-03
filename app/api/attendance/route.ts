import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await authorize();
    const a = await request.json();

    // --- HARDENING: SERVER TIME ENFORCEMENT ---
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    
    // Format: "08:30" (HH:mm)
    const serverTimeStr = jakartaTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
    const serverDateStr = jakartaTime.toDateString(); // "Wed Dec 27 2023"

    // Calculate Late Status (Server Side)
    const settings = await prisma.settings.findFirst();
    const startHour = settings?.officeStartTime || '08:00';
    
    // Compare H:mStrings
    const [h, m] = serverTimeStr.split(':').map(Number);
    const [limitH, limitM] = startHour.split(':').map(Number);
    const isLateCalculated = (h > limitH) || (h === limitH && m > limitM);

    await prisma.attendance.create({
      data: {
        id: a.id, // ID from client is okay for optimistic UI, or consider UUID()
        userId: a.userId,
        date: serverDateStr, // SERVER DATE
        timeIn: serverTimeStr, // SERVER TIME
        timeOut: null,
        isLate: (isLateCalculated ? 1 : 0) as any, // SERVER LOGIC
        lateReason: isLateCalculated ? (a.lateReason || 'Terlambat') : null,
        selfieUrl: a.selfieUrl,
        checkoutSelfieUrl: null,
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
