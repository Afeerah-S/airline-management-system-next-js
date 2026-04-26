import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const flightCode = searchParams.get('flightCode');
    const seatClass = searchParams.get('class');

    if (!flightCode) {
      return Response.json({ error: 'Flight code required' }, { status: 400 });
    }

    const [flight] = await db.query(
      'SELECT id FROM flights WHERE flightCode = ?',
      [flightCode]
    );

    if (flight.length === 0) {
      return Response.json({ error: 'Flight not found' }, { status: 404 });
    }

    const flightId = flight[0].id;
    let query = `
      SELECT * FROM seats 
      WHERE flight_id = ? AND is_booked = 0
    `;
    const params = [flightId];

    if (seatClass) {
      query += ' AND class = ?';
      params.push(seatClass);
    }

    query += ' ORDER BY CAST(SUBSTRING(seat_number, 2) AS UNSIGNED) ASC';

    const [seats] = await db.query(query, params);
    return Response.json(seats);
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}