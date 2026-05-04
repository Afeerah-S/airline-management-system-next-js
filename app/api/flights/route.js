

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


export async function PATCH(request) {
  try {
    const { flightCode, status, departure_time, arrival_time } = await request.json();

    // 1. Update the flight
    await db.query(
      `UPDATE flights SET status = ?
      ${departure_time ? ', departure_time = ?' : ''}
      ${arrival_time ? ', arrival_time = ?' : ''}
      WHERE flightCode = ?`,
      [status, ...(departure_time ? [departure_time] : []), ...(arrival_time ? [arrival_time] : []), flightCode]
    );

    // 2. If flight is done/cancelled, free up the pilot
    if (status === 'Completed' || status === 'Cancelled') {
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