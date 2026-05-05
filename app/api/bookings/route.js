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
               s.seat_number, s.class, f.status,
               b.booked_at
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
             s.seat_number, s.class, f.status,
             b.booked_at
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

// Create a booking
export async function POST(request) {
  try {
    const { userId, flightCode, seatNumber, seatClass } = await request.json();

    if (!userId || !flightCode || !seatNumber || !seatClass) {
      return Response.json({ error: 'userId, flightCode, seatNumber, and seatClass are all required' }, { status: 400 });
    }

    // Check flight exists and is not cancelled
    const [flight] = await db.query(
      'SELECT id, status FROM flights WHERE flightCode = ?',
      [flightCode]
    );
    if (flight.length === 0) return Response.json({ error: 'Flight not found' }, { status: 404 });
    if (flight[0].status === 'Cancelled') return Response.json({ error: 'Flight is cancelled' }, { status: 400 });

    const flightId = flight[0].id;

    // Check seat exists for this flight — no is_booked column, check bookings table instead
    const [seat] = await db.query(
      'SELECT id FROM seats WHERE flight_id = ? AND seat_number = ? AND class = ?',
      [flightId, seatNumber, seatClass]
    );
    if (seat.length === 0) return Response.json({ error: 'Seat not found on this flight' }, { status: 404 });

    const seatId = seat[0].id;

    // Check seat is not already booked (via bookings table)
    const [alreadyBooked] = await db.query(
      'SELECT id FROM bookings WHERE seat_id = ?',
      [seatId]
    );
    if (alreadyBooked.length > 0) return Response.json({ error: 'Seat is already booked' }, { status: 400 });

    // Insert booking
    const [booking] = await db.query(
      'INSERT INTO bookings (user_id, flight_id, seat_id) VALUES (?, ?, ?)',
      [userId, flightId, seatId]
    );

    return Response.json({ success: true, bookingId: booking.insertId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Cancel a booking
export async function DELETE(request) {
  try {
    const { bookingId, userId } = await request.json();

    if (!bookingId || !userId) {
      return Response.json({ error: 'bookingId and userId are required' }, { status: 400 });
    }

    // Check booking exists and belongs to this user
    const [booking] = await db.query(
      'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );
    if (booking.length === 0) return Response.json({ error: 'Booking not found' }, { status: 404 });

    // Delete booking — seat becomes available automatically (no is_booked to reset)
    await db.query(
      'DELETE FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}