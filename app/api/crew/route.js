import db from '@/lib/db';

// Get crew for a flight
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const flightId = searchParams.get('flightId');

  const [rows] = await db.query(`
    SELECT c.* FROM crew c
    JOIN flight_crew fc ON c.id = fc.crew_id
    WHERE fc.flight_id = ?
  `, [flightId]);

  return Response.json(rows);
}

// Add crew member
export async function POST(request) {
  const { name, role, flight_id } = await request.json();

  const [result] = await db.query(
    'INSERT INTO crew (name, role) VALUES (?, ?)',
    [name, role]
  );

  const crewId = result.insertId;

  await db.query(
    'INSERT INTO flight_crew (flight_id, crew_id) VALUES (?, ?)',
    [flight_id, crewId]
  );

  return Response.json({ success: true, crewId });
}