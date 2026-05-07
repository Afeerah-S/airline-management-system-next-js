import db from '@/lib/db';

// Get payments for a customer
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const [rows] = await db.query(`
      SELECT p.id, p.booking_id, p.amount, p.method, p.status, p.paid_at,
             f.flightCode
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN flights f ON b.flight_id = f.id
      WHERE b.user_id = ?
    `, [userId]);

    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Create a payment
export async function POST(request) {
  try {
    const { bookingId, amount, method, userId } = await request.json();

    if (!bookingId || !amount || !method || !userId) {
      return Response.json({ error: 'bookingId, amount, method, and userId are all required' }, { status: 400 });
    }

    // Verify the booking exists AND belongs to this user
    const [booking] = await db.query(
      'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );
    if (booking.length === 0) {
      return Response.json({ error: 'Booking not found or does not belong to this user' }, { status: 403 });
    }

    // Check payment doesn't already exist for this booking
    const [existing] = await db.query(
      'SELECT id FROM payments WHERE booking_id = ?',
      [bookingId]
    );
    if (existing.length > 0) {
      return Response.json({ error: 'Payment already made for this booking' }, { status: 409 });
    }

    const [result] = await db.query(
      `INSERT INTO payments (booking_id, amount, method, status, paid_at)
       VALUES (?, ?, ?, 'Completed', NOW())`,
      [bookingId, amount, method]
    );

    return Response.json({ success: true, paymentId: result.insertId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}