import db from '@/lib/db';

// Admin Login
export async function POST(request) {
  const { admin_id, password } = await request.json();

  const [rows] = await db.query(
    'SELECT * FROM admin WHERE admin_id = ? AND password = ?',
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