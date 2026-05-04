import db from '@/lib/db';

export async function GET() {
  const [rows] = await db.query('SELECT * FROM airports');
  return Response.json(rows);
}

export async function POST(request) {
  const { code, name, city, country } = await request.json();

  if (!code || !name || !city || !country) {
    return Response.json({ error: 'Airport code, name, city, and country are all required' }, { status: 400 });
  }

  if (code.length !== 3) {
    return Response.json({ error: 'Airport code must be exactly 3 letters (e.g. KHI, JFK)' }, { status: 400 });
  }

  const [existing] = await db.query('SELECT id FROM airports WHERE code = ?', [code.toUpperCase()]);
  if (existing.length > 0) {
    return Response.json({ error: 'Airport code already exists' }, { status: 409 });
  }

  await db.query(
    'INSERT INTO airports (code, name, city, country) VALUES (?, ?, ?, ?)',
    [code.toUpperCase(), name, city, country]
  );

  return Response.json({ success: true });
}