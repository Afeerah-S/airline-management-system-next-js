import db from '@/lib/db';

// Get all pilots
export async function GET() {
  const [rows] = await db.query('SELECT * FROM pilots');
  return Response.json(rows);
}

// Add a pilot
export async function POST(request) {
  const { name, license_number, experience_years } = await request.json();

  const [result] = await db.query(
    'INSERT INTO pilots (name, license_number, experience_years) VALUES (?, ?, ?)',
    [name, license_number, experience_years]
  );

  return Response.json({ success: true, pilotId: result.insertId });
}