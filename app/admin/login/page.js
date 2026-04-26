'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ admin_id: '', password: '', email: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setError('');
    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: form.admin_id, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem('adminId', data.admin.admin_id);
    router.push('/admin/dashboard');
  };

  const handleSignup = async () => {
    setError('');
    if (!form.admin_id.startsWith('ADM')) return setError('Admin ID must start with ADM');
    const res = await fetch('/api/auth/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem('adminId', form.admin_id);
    router.push('/admin/dashboard');
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>🛠️ Admin</div>
        <h2 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={styles.subtitle}>{isLogin ? 'Sign in to your admin portal' : 'Register a new admin account'}</p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Admin ID</label>
          <input style={styles.input} name="admin_id" placeholder="e.g. ADM001"
            value={form.admin_id} onChange={handleChange} />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} />
        </div>
        {!isLogin && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" placeholder="admin@airline.com"
              value={form.email} onChange={handleChange} />
          </div>
        )}

        <button style={styles.primaryBtn} onClick={isLogin ? handleLogin : handleSignup}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <button style={styles.switchBtn} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
        <button style={styles.backBtn} onClick={() => router.push('/')}>← Back to Home</button>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at top, #928E5E 0%, #575527 100%)',
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    padding: '44px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 24px 64px rgba(87,85,39,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    border: '1px solid rgba(146,142,94,0.2)',
  },
  badge: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg, #928E5E, #575527)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
  },
  title: { fontSize: '26px', fontWeight: '800', color: '#575527', margin: 0 },
  subtitle: { color: '#897D7B', fontSize: '14px', margin: 0 },
  error: {
    background: '#FEE2E2',
    color: '#B91C1C',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#575527' },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #DDD3C9',
    fontSize: '14px',
    outline: 'none',
    background: '#FDFAF9',
    color: '#333',
  },
  primaryBtn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #928E5E, #575527)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 14px rgba(87,85,39,0.3)',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#928E5E',
    cursor: 'pointer',
    fontSize: '13px',
    textDecoration: 'underline',
    textAlign: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#B0A89A',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'center',
  },
};