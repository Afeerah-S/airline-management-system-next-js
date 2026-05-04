import db from '@/lib/db';

// Get bookings for a customer (flight data comes from JOIN, not stored in bookings)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const flightCode = searchParams.get('flightCode'); // for admin view

  try {
    if (flightCode) {
      // Admin: get all bookings for a specific flight
      const [rows] = await db.query(`
        SELECT b.id, c.username, f.flightCode,
               f.departure, f.destination,
               f.departure_time, f.arrival_time,
               s.seat_number, s.class, f.status
        FROM bookings b
        JOIN customers c ON b.user_id = c.id
        JOIN flights f ON b.flight_id = f.id
        JOIN seats s ON b.seat_id = s.id
        WHERE f.flightCode = ?
      `, [flightCode]);
      return Response.json(rows);
    }

    // Customer: get their own bookings
    const [rows] = await db.query(`
      SELECT b.id, f.flightCode,
             f.departure, f.destination,
             f.departure_time, f.arrival_time,
             s.seat_number, s.class, f.status
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN seats s ON b.seat_id = s.id
      WHERE b.user_id = ?
    `, [userId]);
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Create a booking (no longer stores depart/arrive/times — gets them from flights)
export async function POST(request) {
  try {
    const { userId, flightCode, seatNumber, seatClass } = await request.json();

    const [flight] = await db.query(
      'SELECT id, status FROM flights WHERE flightCode = ?',
      [flightCode]
    );

    if (flight.length === 0) return Response.json({ error: 'Flight not found' }, { status: 404 });
    if (flight[0].status === 'Cancelled') return Response.json({ error: 'Flight is cancelled' }, { status: 400 });

    const flightId = flight[0].id;

    const [seat] = await db.query(
      'SELECT id FROM seats WHERE flight_id = ? AND seat_number = ? AND class = ? AND is_booked = 0',
      [flightId, seatNumber, seatClass]
    );

    if (seat.length === 0) return Response.json({ error: 'Seat not available' }, { status: 400 });

    const seatId = seat[0].id;

    const [booking] = await db.query(
      'INSERT INTO bookings (user_id, flight_id, seat_id) VALUES (?, ?, ?)',
      [userId, flightId, seatId]
    );

    await db.query('UPDATE seats SET is_booked = 1 WHERE id = ?', [seatId]);

    return Response.json({ success: true, bookingId: booking.insertId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Cancel a booking
export async function DELETE(request) {
  try {
    const { bookingId, userId } = await request.json();

    const [booking] = await db.query(
      'SELECT seat_id FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );

    if (booking.length === 0) return Response.json({ error: 'Booking not found' }, { status: 404 });

    await db.query('DELETE FROM bookings WHERE id = ? AND user_id = ?', [bookingId, userId]);
    await db.query('UPDATE seats SET is_booked = 0 WHERE id = ?', [booking[0].seat_id]);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}