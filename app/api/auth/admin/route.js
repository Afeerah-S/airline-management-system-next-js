import db from '@/lib/db';

// Admin Login
export async function POST(request) {
  const { admin_id, password } = await request.json();

  if (!admin_id || !password) {
    return Response.json({ error: 'Admin ID and password are required' }, { status: 400 });
  }

  const [rows] = await db.query(
    'SELECT * FROM admin WHERE admin_id = ? AND BINARY password = ?',
    [admin_id, password]
  );

  if (rows.length === 0) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return Response.json({ success: true, admin: rows[0] });
}

// Admin Signup
export async function PUT(request) {
  const { admin_id, password, email } = await request.json();

  if (!admin_id || !password || !email) {
    return Response.json({ error: 'Admin ID, password, and email are all required' }, { status: 400 });
  }

  // Admin ID must be ADM followed by exactly 3 digits e.g. ADM001
  const adminIdPattern = /^ADM\d{3}$/;
  if (!adminIdPattern.test(admin_id)) {
    return Response.json({ error: 'Admin ID must be in the format ADM followed by 3 digits (e.g. ADM001)' }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return Response.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const [existing] = await db.query(
    'SELECT admin_id FROM admin WHERE admin_id = ?', [admin_id]
  );
  if (existing.length > 0) {
    return Response.json({ error: 'Admin ID already exists' }, { status: 409 });
  }

  await db.query(
    'INSERT INTO admin (admin_id, password, email) VALUES (?, ?, ?)',
    [admin_id, password, email]
  );

  return Response.json({ success: true });
}