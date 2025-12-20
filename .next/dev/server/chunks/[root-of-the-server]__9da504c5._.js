module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing!");
}
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Vercel Postgres
    }
});
const __TURBOPACK__default__export__ = pool;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/api/bootstrap/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function ensureSeedData() {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
    try {
        // Basic Settings
        const resSettings = await client.query('SELECT * FROM settings LIMIT 1');
        if (resSettings.rows.length === 0) {
            const companyProfile = {
                name: 'Sukses Digital Media',
                address: 'Jl. Kemajuan No. 88, Jakarta Selatan',
                phone: '0812-3456-7890',
                logoUrl: '',
                logoPosition: 'top',
                textAlignment: 'center'
            };
            await client.query(`INSERT INTO settings (office_lat, office_lng, office_start_time, office_end_time, telegram_bot_token, telegram_group_id, telegram_owner_chat_id, company_profile_json)
         VALUES ($1, $2, $3, $4, '', '', '', $5)`, [
                -6.2,
                106.816666,
                '08:00',
                '17:00',
                JSON.stringify(companyProfile)
            ]);
        }
        // Seed Users if empty
        const resUsers = await client.query('SELECT count(*) FROM users');
        if (parseInt(resUsers.rows[0].count) === 0) {
            const defaultUsers = [
                {
                    id: '1',
                    name: 'Budi Owner',
                    username: 'owner',
                    telegramId: '111',
                    telegramUsername: '@budi_owner',
                    role: 'OWNER',
                    password: 'owner123'
                },
                {
                    id: '2',
                    name: 'Siti Manager',
                    username: 'manager',
                    telegramId: '222',
                    telegramUsername: '@siti_mgr',
                    role: 'MANAGER',
                    password: 'manager123'
                },
                {
                    id: '3',
                    name: 'Andi Finance',
                    username: 'finance',
                    telegramId: '333',
                    telegramUsername: '@andi_fin',
                    role: 'FINANCE',
                    password: 'finance123'
                },
                {
                    id: '4',
                    name: 'Joko Staff',
                    username: 'staff',
                    telegramId: '444',
                    telegramUsername: '@joko_sdm',
                    role: 'STAFF',
                    password: 'staff123'
                }
            ];
            for (const u of defaultUsers){
                const hash = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(u.password, 10);
                await client.query('INSERT INTO users (id, name, username, telegram_id, telegram_username, role, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
                    u.id,
                    u.name,
                    u.username,
                    u.telegramId,
                    u.telegramUsername,
                    u.role,
                    hash
                ]);
            }
        }
    } catch (e) {
        console.error("Seed Check Failed", e);
    } finally{
        client.release();
    }
}
async function GET() {
    try {
        await ensureSeedData(); // Ensure DB is ready
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
        try {
            const [usersRes, projectsRes, attendanceRes, requestsRes, transactionsRes, dailyReportsRes, salaryConfigsRes, payrollRes, settingsRes] = await Promise.all([
                client.query('SELECT * FROM users'),
                client.query('SELECT * FROM projects'),
                client.query('SELECT * FROM attendance ORDER BY date DESC, time_in DESC LIMIT 500'),
                client.query('SELECT * FROM leave_requests ORDER BY created_at DESC LIMIT 200'),
                client.query('SELECT * FROM transactions ORDER BY date DESC LIMIT 500'),
                client.query('SELECT * FROM daily_reports ORDER BY date DESC LIMIT 200'),
                client.query('SELECT * FROM salary_configs'),
                client.query('SELECT * FROM payroll_records ORDER BY processed_at DESC LIMIT 100'),
                client.query('SELECT * FROM settings LIMIT 1')
            ]);
            const settingsRow = settingsRes.rows[0];
            const settings = settingsRow ? {
                officeLocation: {
                    lat: settingsRow.office_lat,
                    lng: settingsRow.office_lng
                },
                officeHours: {
                    start: settingsRow.office_start_time,
                    end: settingsRow.office_end_time
                },
                telegramBotToken: settingsRow.telegram_bot_token || '',
                telegramGroupId: settingsRow.telegram_group_id || '',
                telegramOwnerChatId: settingsRow.telegram_owner_chat_id || '',
                companyProfile: JSON.parse(settingsRow.company_profile_json || '{}')
            } : {};
            const data = {
                users: usersRes.rows.map((u)=>({
                        id: u.id,
                        name: u.name,
                        username: u.username,
                        telegramId: u.telegram_id || '',
                        telegramUsername: u.telegram_username || '',
                        role: u.role
                    })),
                projects: projectsRes.rows.map((p)=>({
                        id: p.id,
                        title: p.title,
                        description: p.description || '',
                        collaborators: JSON.parse(p.collaborators_json || '[]'),
                        deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : '',
                        status: p.status,
                        tasks: JSON.parse(p.tasks_json || '[]'),
                        comments: p.comments_json ? JSON.parse(p.comments_json) : [],
                        isManagementOnly: !!p.is_management_only,
                        priority: p.priority,
                        createdBy: p.created_by,
                        createdAt: Number(p.created_at)
                    })),
                attendance: attendanceRes.rows.map((a)=>({
                        id: a.id,
                        userId: a.user_id,
                        date: a.date,
                        timeIn: a.time_in,
                        timeOut: a.time_out || undefined,
                        isLate: !!a.is_late,
                        lateReason: a.late_reason || undefined,
                        selfieUrl: a.selfie_url,
                        checkOutSelfieUrl: a.checkout_selfie_url || undefined,
                        location: {
                            lat: a.location_lat,
                            lng: a.location_lng
                        }
                    })),
                requests: requestsRes.rows.map((r)=>({
                        id: r.id,
                        userId: r.user_id,
                        type: r.type,
                        description: r.description,
                        startDate: new Date(r.start_date).toISOString().split('T')[0],
                        endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : new Date(r.start_date).toISOString().split('T')[0],
                        attachmentUrl: r.attachment_url || undefined,
                        status: r.status,
                        createdAt: Number(r.created_at)
                    })),
                transactions: transactionsRes.rows.map((t)=>({
                        id: t.id,
                        date: new Date(t.date).toISOString().split('T')[0],
                        amount: Number(t.amount),
                        type: t.type,
                        category: t.category || '',
                        description: t.description,
                        account: t.account,
                        imageUrl: t.image_url || undefined
                    })),
                dailyReports: dailyReportsRes.rows.map((r)=>({
                        id: r.id,
                        userId: r.user_id,
                        date: r.date,
                        activities: JSON.parse(r.activities_json || '[]')
                    })),
                salaryConfigs: salaryConfigsRes.rows.map((c)=>({
                        userId: c.user_id,
                        basicSalary: Number(c.basic_salary),
                        allowance: Number(c.allowance),
                        mealAllowance: Number(c.meal_allowance),
                        lateDeduction: Number(c.late_deduction)
                    })),
                payrollRecords: payrollRes.rows.map((pr)=>({
                        id: pr.id,
                        userId: pr.user_id,
                        month: pr.month,
                        basicSalary: Number(pr.basic_salary),
                        allowance: Number(pr.allowance),
                        totalMealAllowance: Number(pr.total_meal_allowance),
                        bonus: Number(pr.bonus),
                        deductions: Number(pr.deductions),
                        netSalary: Number(pr.net_salary),
                        isSent: !!pr.is_sent,
                        processedAt: Number(pr.processed_at),
                        metadata: pr.metadata_json ? JSON.parse(pr.metadata_json) : undefined
                    })),
                settings
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
        } finally{
            client.release();
        }
    } catch (err) {
        console.error('Bootstrap error', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to load initial data'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9da504c5._.js.map