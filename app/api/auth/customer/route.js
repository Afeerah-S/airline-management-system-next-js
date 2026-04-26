import db from '@/lib/db';

// Customer Login
export async function POST(request) {
  const { username, password } = await request.json();

  const [rows] = await db.query(
    'SELECT id, username, email FROM customers WHERE LOWER(username) = LOWER(?) AND password = ?',
    [username, password]
  );

  if (rows.length === 0) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return Response.json({ success: true, customer: rows[0] });
}

// Customer Signup
export async function PUT(request) {
  const { username, password, email } = await request.json();

  const [existing] = await db.query(
    'SELECT id FROM customers WHERE LOWER(username) = LOWER(?)',
    [username]
  );

  if (existing.length > 0) {
    return Response.json({ error: 'Username already taken' }, { status: 409 });
  }

  const [result] = await db.query(
    'INSERT INTO customers (username, password, email) VALUES (?, ?, ?)',
    [username, password, email]
  );

  return Response.json({ success: true, customerId: result.insertId });
}