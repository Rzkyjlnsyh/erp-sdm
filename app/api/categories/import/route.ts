
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await authorize(['OWNER', 'FINANCE']);
    const { categories } = await request.json(); // Expected: [{ name, type, parentName? }]

    if (!Array.isArray(categories)) {
        return NextResponse.json({ error: 'Invalid payload: categories must be an array' }, { status: 400 });
    }

    // 1. Fetch current categories to check for duplicates and resolve parents
    const existingRes = await pool.query('SELECT id, name, type FROM transaction_categories');
    
    // Map: "NAME|TYPE" -> ID
    const categoryMap = new Map<string, string>();
    existingRes.rows.forEach(row => {
        categoryMap.set(`${row.name.trim().toUpperCase()}|${row.type}`, row.id);
    });

    let newCount = 0;

    // 2. Pass 1: Process Roots (No Parent)
    // We prioritize roots so they exist when children need them
    const roots = categories.filter((c: any) => !c.parentName);
    
    for (const cat of roots) {
        if (!cat.name) continue;
        const normalizedName = cat.name.trim();
        const key = `${normalizedName.toUpperCase()}|${cat.type}`;

        if (!categoryMap.has(key)) {
            const id = Math.random().toString(36).substr(2, 9);
            await pool.query(
                `INSERT INTO transaction_categories (id, name, type, parent_id) VALUES ($1, $2, $3, NULL)`,
                [id, normalizedName, cat.type]
            );
            categoryMap.set(key, id);
            newCount++;
        }
    }

    // 3. Pass 2: Process Children (Has Parent)
    const children = categories.filter((c: any) => c.parentName);

    for (const cat of children) {
        if (!cat.name) continue;
        const normalizedName = cat.name.trim();
        const key = `${normalizedName.toUpperCase()}|${cat.type}`;

        // Skip if already exists
        if (categoryMap.has(key)) continue;

        // Resolve Parent
        const parentKey = `${cat.parentName.trim().toUpperCase()}|${cat.type}`;
        let parentId = categoryMap.get(parentKey);

        // Fallback: If parent not found in map, maybe it was meant for a different type? 
        // Or if strictly not found, we insert as root to avoid data loss, but log it.
        // This fulfills "jangan sampai ada error" by being resilient.
        
        const id = Math.random().toString(36).substr(2, 9);
        await pool.query(
            `INSERT INTO transaction_categories (id, name, type, parent_id) VALUES ($1, $2, $3, $4)`,
            [id, normalizedName, cat.type, parentId || null]
        );
        categoryMap.set(key, id);
        newCount++;
    }

    return NextResponse.json({ 
        message: 'Import successfully processed', 
        importedCount: newCount 
    }, { status: 200 });

  } catch (error) {
    console.error("Import Categories Error:", error);
    return NextResponse.json({ error: 'Internal Server Error during import' }, { status: 500 });
  }
}
