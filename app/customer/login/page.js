'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', confirm: '', email: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setError('');
    const res = await fetch('/api/auth/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem('customerId', data.customer.id);
    localStorage.setItem('customerName', data.customer.username);
    router.push('/customer/dashboard');
  };

  const handleSignup = async () => {
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.username.toUpperCase().startsWith('ADM')) return setError('Username cannot start with ADM');
    const res = await fetch('/api/auth/customer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password, email: form.email }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem('customerId', data.customerId);
    localStorage.setItem('customerName', form.username);
    router.push('/customer/dashboard');
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>🧳 Customer</div>
        <h2 style={styles.title}>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
        <p style={styles.subtitle}>{isLogin ? 'Sign in to manage your bookings' : 'Create your traveller account'}</p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Username</label>
          <input style={styles.input} name="username" placeholder="your username"
            value={form.username} onChange={handleChange} />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} />
        </div>
        {!isLogin && <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input style={styles.input} name="confirm" type="password" placeholder="••••••••"
              value={form.confirm} onChange={handleChange} />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" placeholder="you@email.com"
              value={form.email} onChange={handleChange} />
          </div>
        </>}

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
    background: 'radial-gradient(ellipse at top, #ECC4C3 0%, #B97D7B 100%)',
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    padding: '44px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 24px 64px rgba(185,125,123,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    border: '1px solid rgba(236,196,195,0.4)',
  },
  badge: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
  },
  title: { fontSize: '26px', fontWeight: '800', color: '#B97D7B', margin: 0 },
  subtitle: { color: '#897D7B', fontSize: '14px', margin: 0 },
  error: {
    background: '#FEE2E2',
    color: '#B91C1C',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#B97D7B' },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #ECC4C3',
    fontSize: '14px',
    outline: 'none',
    background: '#FDFAF9',
    color: '#333',
  },
  primaryBtn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 14px rgba(185,125,123,0.3)',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#B97D7B',
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