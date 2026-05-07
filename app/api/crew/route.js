import db from '@/lib/db';

// Get all crew OR crew for a specific flight
export async function GET(request) {
  try {
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
      [rows] = await db.query('SELECT * FROM crew');
    }

    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Add a new crew member (and optionally assign to a flight)
export async function POST(request) {
  try {
    const { name, role, flight_id } = await request.json();

    if (!name || !role) {
      return Response.json({ error: 'Name and role are required' }, { status: 400 });
    }

    // Check duplicate
    const [existing] = await db.query(
      'SELECT id FROM crew WHERE name = ? AND role = ?',
      [name, role]
    );
    if (existing.length > 0) {
      return Response.json({ error: 'Crew member with this name and role already exists' }, { status: 409 });
    }

    const [result] = await db.query(
      'INSERT INTO crew (name, role) VALUES (?, ?)',
      [name, role]
    );
    const crewId = result.insertId;

    // If a flight_id was provided, link in flight_crew
    if (flight_id) {
      await db.query(
        'INSERT INTO flight_crew (flight_id, crew_id) VALUES (?, ?)',
        [flight_id, crewId]
      );
      await db.query(
        'UPDATE crew SET status = ? WHERE id = ?',
        ['On Duty', crewId]
      );
    }

    return Response.json({ success: true, crewId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Assign an EXISTING crew member to a flight
export async function PATCH(request) {
  try {
    const { crew_id, flight_id } = await request.json();

    const crewId = parseInt(crew_id);
    const flightId = parseInt(flight_id);

    if (!crewId || !flightId) {
      return Response.json({ error: 'crew_id and flight_id are required' }, { status: 400 });
    }

    // Check crew exists
    const [crew] = await db.query('SELECT id FROM crew WHERE id = ?', [crewId]);
    if (crew.length === 0) {
      return Response.json({ error: 'Crew member not found' }, { status: 404 });
    }

    // Check flight exists
    const [flight] = await db.query('SELECT id FROM flights WHERE id = ?', [flightId]);
    if (flight.length === 0) {
      return Response.json({ error: 'Flight not found' }, { status: 404 });
    }

    // Check not already assigned
    const [alreadyAssigned] = await db.query(
      'SELECT id FROM flight_crew WHERE crew_id = ? AND flight_id = ?',
      [crewId, flightId]
    );
    if (alreadyAssigned.length > 0) {
      return Response.json({ error: 'Crew member already assigned to this flight' }, { status: 409 });
    }

    // Insert into flight_crew
    await db.query(
      'INSERT INTO flight_crew (flight_id, crew_id) VALUES (?, ?)',
      [flightId, crewId]
    );

    // Update crew status to On Duty
    await db.query(
      'UPDATE crew SET status = ? WHERE id = ?',
      ['On Duty', crewId]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}