import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Get Settings
    const res = await pool.query('SELECT * FROM settings LIMIT 1');
    if (!res.rows.length) {
      return NextResponse.json({ error: 'Settings not initialized' }, { status: 400 });
    }
    const settings = res.rows[0];
    
    const targetTime = settings.daily_recap_time || '18:00'; // HH:mm
    let targetModules: string[] = [];
    try {
        targetModules = typeof settings.daily_recap_content === 'string' 
            ? JSON.parse(settings.daily_recap_content) 
            : settings.daily_recap_content || [];
    } catch (e) {
        targetModules = [];
    }
    
    // 2. Check Time (WIB)
    const now = new Date();
    // Convert to WIB (UTC+7)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibDate = new Date(utc + (3600000 * 7));
    const currentHHMM = wibDate.toISOString().slice(11, 16); // HH:mm
    const dateStr = wibDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // URL Param Check
    const url = new URL(request.url);
    const isForce = url.searchParams.get('force') === 'true';

    console.log(`[Cron] Check. WIB: ${currentHHMM}, Target: ${targetTime}, Date: ${dateStr}`);

    // LOGIC: If Current Time < Target Time, WE WAIT (unless force).
    // If Current Time >= Target Time, WE CHECK "Did we already send today?".
    
    if (currentHHMM < targetTime && !isForce) {
         return NextResponse.json({ 
          skipped: true, 
          message: 'Too early. Waiting for scheduled time.', 
          serverTimeWIB: currentHHMM, 
          targetTime 
      });
    }

    // 3. IDEMPOTENCY CHECK (Cek biar gak kirim dobel hari ini)
    if (!isForce) {
        const logCheck = await pool.query(`
            SELECT id FROM system_logs 
            WHERE action_type = 'DAILY_RECAP_AUTO' 
            AND details LIKE $1
            LIMIT 1
        `, [`%${dateStr}%`]);

        if (logCheck.rows.length > 0) {
            return NextResponse.json({ 
                skipped: true, 
                message: 'Already sent today.', 
                date: dateStr 
            });
        }
    }

    // 4. Generate Report
    let message = `🔔 *LAPORAN HARIAN OWNER* 🔔\n📅 ${dateStr}\n\n`;
    let hasContent = false;

    // -- MODULE: FINANCE (OMSET) --
    if (targetModules.includes('omset')) {
       const resFin = await pool.query(`
          SELECT 
            COALESCE(SUM(amount) FILTER (WHERE type='IN'), 0) as income,
            COALESCE(SUM(amount) FILTER (WHERE type='OUT'), 0) as expense
          FROM transactions 
          WHERE date = CURRENT_DATE
       `);
       const { income, expense } = resFin.rows[0];
       message += `💰 *KEUANGAN HARI INI*\n📥 Masuk: Rp ${Number(income).toLocaleString('id-ID')}\nBeban: Rp ${Number(expense).toLocaleString('id-ID')}\n💸 *Net: Rp ${Number(income - expense).toLocaleString('id-ID')}*\n\n`;
       hasContent = true;
    }

    // -- MODULE: ATTENDANCE --
    if (targetModules.includes('attendance')) {
       const resAtt = await pool.query(`
          SELECT 
             COUNT(*) FILTER (WHERE time_in IS NOT NULL) as present,
             COUNT(*) FILTER (WHERE CAST(is_late AS TEXT) = 'true' OR CAST(is_late AS TEXT) = '1') as late
          FROM attendance 
          WHERE date = $1
       `, [dateStr]);
       
       const { present, late } = resAtt.rows[0];
       message += `👥 *ABSENSI KARYAWAN*\n✅ Hadir: ${present} orang\n⚠️ Terlambat: ${late} orang\n\n`;
       hasContent = true;
    }

    // -- MODULE: REQUESTS (IZIN/CUTI) --
    if (targetModules.includes('requests')) {
        const resReq = await pool.query(`
           SELECT type, COUNT(*) as count 
           FROM leave_requests 
           WHERE status = 'PENDING'
           GROUP BY type
        `);
        const pendingTotal = resReq.rows.reduce((acc: number, curr: any) => acc + Number(curr.count), 0);

        if (pendingTotal > 0) {
           message += `📩 *PERMOHONAN MENUNGGU (PENDING)*\n`;
           message += `Total: ${pendingTotal} Permohonan\n`;
           resReq.rows.forEach((r: any) => {
              message += `- ${r.type}: ${r.count}\n`;
           });
           message += `_Mohon segera dicek di Dashboard._\n\n`;
        } else {
           message += `📩 *PERMOHONAN*\nSemua bersih (Tidak ada pending).\n\n`;
        }
        hasContent = true;
    }

    // -- MODULE: PROJECTS --
    if (targetModules.includes('projects')) {
        const resProj = await pool.query(`
           SELECT status, COUNT(*) as count 
           FROM projects 
           GROUP BY status
        `);
        const stats: any = {};
        resProj.rows.forEach((r: any) => stats[r.status] = r.count);
        
        message += `📊 *STATUS PROYEK (KANBAN)*\n`;
        message += `🔥 Doing: ${stats['DOING'] || 0}\n`;
        message += `✅ Done: ${stats['DONE'] || 0}\n`;
        message += `📋 Todo: ${stats['TODO'] || 0}\n\n`;
        hasContent = true;
    }

    if (!hasContent) message += "_Tidak ada modul laporan yang dipilih._";

    // 5. Send to Telegram
    const chatId = settings.telegram_owner_chat_id;
    const token = settings.telegram_bot_token;

    if (!chatId || !token) {
        return NextResponse.json({ error: 'Missing Telegram Configuration' }, { status: 500 });
    }

    const teleRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
    });

    const teleData = await teleRes.json();
    
    if (!teleData.ok) {
        return NextResponse.json({ error: 'Failed to send to Telegram', details: teleData }, { status: 500 });
    }

    // 6. LOG SUCCESS (Important for Idempotency)
    if (!isForce) {
        await pool.query(`
            INSERT INTO system_logs (id, timestamp, actor_id, actor_name, actor_role, action_type, details, target_obj)
            VALUES ($1, $2, $3, 'SYSTEM CRON', 'SYSTEM', 'DAILY_RECAP_AUTO', $4, 'Telegram')
        `, [
            `log_${Date.now()}`, 
            Date.now(), 
            'system', 
            `Laporan Harian sent for ${dateStr}`
        ]);
    }

    return NextResponse.json({ success: true, recipient: chatId, time: currentHHMM });

  } catch (error: any) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
