import db from '@/lib/db';

// Get crew for a flight
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const flightId = searchParams.get('flightId');

  let rows;

  if (flightId) {
    [rows] = await db.query(`
      SELECT c.* FROM crew c
      JOIN flight_crew fc ON c.id = fc.crew_id
      WHERE fc.flight_id = ?
    `, [flightId]);
  } else {
    // Return all crew for admin dashboard
    [rows] = await db.query(`
    SELECT DISTINCT c.* FROM crew c
    LEFT JOIN flight_crew fc ON c.id = fc.crew_id
  `);
  }

  return Response.json(rows);
}

// Add crew member
export async function POST(request) {
  const { name, role, flight_id } = await request.json();

  // Check if crew member with same name and role already exists
  const [existing] = await db.query(
    'SELECT id FROM crew WHERE name = ? AND role = ?',
    [name, role]
  );

  if (existing.length > 0) {
    return Response.json({ error: 'Crew member with this name and role already exists' }, { status: 400 });
  }

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

export async function PATCH(request) {
  try {
    const { crew_id, flight_id } = await request.json();

    const crewId = parseInt(crew_id);
    const flightId = parseInt(flight_id);

    if (!crewId || !flightId) {
      return Response.json({ error: 'Invalid crew or flight ID' }, { status: 400 });
    }

    const [existing] = await db.query(
      'SELECT id FROM flight_crew WHERE crew_id = ? AND flight_id = ?',
      [crewId, flightId]
    );

    if (existing.length > 0) {
      return Response.json({ error: 'Crew member already assigned to this flight' }, { status: 400 });
    }

    await db.query(
      'INSERT INTO flight_crew (flight_id, crew_id) VALUES (?, ?)',
      [flightId, crewId]
    );

    await db.query(
      'UPDATE crew SET status = ? WHERE id = ?',
      ['On Duty', crewId]
    );

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}