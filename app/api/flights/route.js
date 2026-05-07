import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const flightCode = searchParams.get('flightCode');
    const departure = searchParams.get('departure');
    const destination = searchParams.get('destination');

    let query = `
      SELECT f.*, a1.city AS departure_city, a2.city AS destination_city
      FROM flights f
      LEFT JOIN airports a1 ON f.departure = a1.code
      LEFT JOIN airports a2 ON f.destination = a2.code
      WHERE 1=1
    `;
    const params = [];

    if (flightCode) { query += ' AND f.flightCode = ?'; params.push(flightCode); }
    if (departure)  { query += ' AND f.departure = ?';  params.push(departure);  }
    if (destination){ query += ' AND f.destination = ?'; params.push(destination); }

    const [rows] = await db.query(query, params);
    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { flightCode, departure, destination, departure_time, arrival_time, pilot_id } = await request.json();

    const [result] = await db.query(
      `INSERT INTO flights (flightCode, departure, destination, departure_time, arrival_time, status, pilot_id)
       VALUES (?, ?, ?, ?, ?, 'On Time', ?)`,
      [flightCode, departure, destination, departure_time, arrival_time, pilot_id || null]
    );

    const flightId = result.insertId;

    // Auto-generate seats — no is_booked column in schema
    const seats = [];
    for (let i = 1; i <= 100; i++) seats.push([flightId, `E${i}`, 'Economy']);
    for (let i = 1; i <= 50;  i++) seats.push([flightId, `B${i}`, 'Business']);
    for (let i = 1; i <= 5;   i++) seats.push([flightId, `F${i}`, 'First Class']);

    for (const seat of seats) {
      await db.query('INSERT INTO seats (flight_id, seat_number, class) VALUES (?, ?, ?)', seat);
    }

    // Update flight_airports many-to-many
    await db.query(
      'INSERT INTO flight_airports (flight_id, airport_code, role) VALUES (?, ?, ?)',
      [flightId, departure, 'departure']
    );
    await db.query(
      'INSERT INTO flight_airports (flight_id, airport_code, role) VALUES (?, ?, ?)',
      [flightId, destination, 'destination']
    );

    return Response.json({ success: true, flightId });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { flightCode, status, departure_time, arrival_time } = await request.json();

    if (!flightCode || !status) {
      return Response.json({ error: 'flightCode and status are required' }, { status: 400 });
    }

    // Check flight exists
    const [flight] = await db.query('SELECT id FROM flights WHERE flightCode = ?', [flightCode]);
    if (flight.length === 0) {
      return Response.json({ error: `Flight ${flightCode} not found` }, { status: 404 });
    }

    // FIX: for Cancel — only update status, keep existing times (times are NOT NULL)
    // For Delay — update status AND times
    if (status === 'Cancelled') {
      await db.query(
        'UPDATE flights SET status = ? WHERE flightCode = ?',
        [status, flightCode]
      );
    } else {
      // Delayed or other — update status and times if provided
      await db.query(
        `UPDATE flights SET status = ?
         ${departure_time ? ', departure_time = ?' : ''}
         ${arrival_time ? ', arrival_time = ?' : ''}
         WHERE flightCode = ?`,
        [status, ...(departure_time ? [departure_time] : []), ...(arrival_time ? [arrival_time] : []), flightCode]
      );
    }

    // Free up the pilot if cancelled or completed
    if (status === 'Cancelled' || status === 'Completed') {
      await db.query(
        `UPDATE pilots p
         JOIN flights f ON f.pilot_id = p.id
         SET p.status = 'Available'
         WHERE f.flightCode = ?`,
        [flightCode]
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}