import db from '@/lib/db';

// Customer Login
export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const [rows] = await db.query(
    'SELECT id, username, email FROM customers WHERE LOWER(username) = LOWER(?) AND BINARY password = ?',
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

  if (!username || !password || !email) {
    return Response.json({ error: 'Username, password, and email are all required' }, { status: 400 });
  }

  if (username.length < 3) {
    return Response.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return Response.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

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