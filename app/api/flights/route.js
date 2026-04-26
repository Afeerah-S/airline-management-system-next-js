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
    if (departure) { query += ' AND f.departure = ?'; params.push(departure); }
    if (destination) { query += ' AND f.destination = ?'; params.push(destination); }

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

    // Auto-generate seats
    const seats = [];
    for (let i = 1; i <= 100; i++) seats.push([flightId, `E${i}`, 'Economy', 0]);
    for (let i = 1; i <= 50; i++) seats.push([flightId, `B${i}`, 'Business', 0]);
    for (let i = 1; i <= 5; i++) seats.push([flightId, `F${i}`, 'First Class', 0]);

    for (const seat of seats) {
      await db.query(
        'INSERT INTO seats (flight_id, seat_number, class, is_booked) VALUES (?, ?, ?, ?)',
        seat
      );
    }

    return Response.json({ success: true, flightId });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { flightCode, status, departure_time, arrival_time } = await request.json();

    await db.query(
      'UPDATE flights SET status = ?, departure_time = ?, arrival_time = ? WHERE flightCode = ?',
      [status, departure_time, arrival_time, flightCode]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}