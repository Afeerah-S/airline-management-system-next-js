import db from '@/lib/db';

export async function GET() {
  const [rows] = await db.query('SELECT * FROM airports');
  return Response.json(rows);
}

export async function POST(request) {
  const { code, name, city, country } = await request.json();

  const [existing] = await db.query('SELECT id FROM airports WHERE code = ?', [code]);
  if (existing.length > 0) {
    return Response.json({ error: 'Airport code already exists' }, { status: 409 });
  }

  await db.query(
    'INSERT INTO airports (code, name, city, country) VALUES (?, ?, ?, ?)',
    [code, name, city, country]
  );

  return Response.json({ success: true });
}