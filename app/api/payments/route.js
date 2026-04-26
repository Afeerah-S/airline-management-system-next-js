import db from '@/lib/db';

// Get payments for a customer
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const [rows] = await db.query(`
    SELECT p.id, p.booking_id, p.amount, p.method, p.status, p.paid_at,
           f.flightCode
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN flights f ON b.flight_id = f.id
    WHERE b.user_id = ?
  `, [userId]);

  return Response.json(rows);
}

// Create a payment
export async function POST(request) {
  const { bookingId, amount, method } = await request.json();

  const [result] = await db.query(
    `INSERT INTO payments (booking_id, amount, method, status, paid_at)
     VALUES (?, ?, ?, 'Completed', NOW())`,
    [bookingId, amount, method]
  );

  return Response.json({ success: true, paymentId: result.insertId });
}