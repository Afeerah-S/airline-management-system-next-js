import db from '@/lib/db';

// Get bookings for a customer
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const [rows] = await db.query(`
    SELECT b.id, f.flightCode, b.depart, b.arrive,
           b.depart_time, b.arrive_time, s.seat_number, s.class, f.status
    FROM bookings b
    JOIN flights f ON b.flight_id = f.id
    JOIN seats s ON b.seat_id = s.id
    WHERE b.user_id = ?
  `, [userId]);

  return Response.json(rows);
}

// Create a booking
export async function POST(request) {
  const { userId, flightCode, seatNumber, seatClass } = await request.json();

  const [flight] = await db.query(
    'SELECT id, departure, destination, departure_time, arrival_time, status FROM flights WHERE flightCode = ?',
    [flightCode]
  );

  if (flight.length === 0) return Response.json({ error: 'Flight not found' }, { status: 404 });
  if (flight[0].status === 'Cancelled') return Response.json({ error: 'Flight is cancelled' }, { status: 400 });

  const flightId = flight[0].id;

  const [seat] = await db.query(
    'SELECT id FROM seats WHERE flight_id = ? AND seat_number = ? AND class = ? AND id NOT IN (SELECT seat_id FROM bookings)',
    [flightId, seatNumber, seatClass]
  );

  if (seat.length === 0) return Response.json({ error: 'Seat not available' }, { status: 400 });

  const seatId = seat[0].id;

  const [booking] = await db.query(
    `INSERT INTO bookings (user_id, flight_id, depart, arrive, depart_time, arrive_time, seat_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, flightId, flight[0].departure, flight[0].destination,
     flight[0].departure_time, flight[0].arrival_time, seatId]
  );

  return Response.json({ success: true, bookingId: booking.insertId });
}

// Cancel a booking
export async function DELETE(request) {
  const { bookingId, userId } = await request.json();

  const [booking] = await db.query(
    'SELECT seat_id FROM bookings WHERE id = ? AND user_id = ?',
    [bookingId, userId]
  );

  if (booking.length === 0) return Response.json({ error: 'Booking not found' }, { status: 404 });

  await db.query('DELETE FROM bookings WHERE id = ? AND user_id = ?', [bookingId, userId]);

  return Response.json({ success: true });
}