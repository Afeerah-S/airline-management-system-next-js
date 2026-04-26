'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.iconWrap}>✈️</div>
        <h1 style={styles.title}>Airline Management</h1>
        <p style={styles.subtitle}>Welcome aboard. Please select your portal to continue.</p>
        <div style={styles.divider} />
        <div style={styles.buttonGroup}>
          <button style={styles.adminBtn} onClick={() => router.push('/admin/login')}>
            <span style={styles.btnIcon}>🛠️</span>
            <span>
              <div style={styles.btnTitle}>Admin Portal</div>
              <div style={styles.btnSub}>Manage flights & operations</div>
            </span>
          </button>
          <button style={styles.customerBtn} onClick={() => router.push('/customer/login')}>
            <span style={styles.btnIcon}>🧳</span>
            <span>
              <div style={styles.btnTitle}>Customer Portal</div>
              <div style={styles.btnSub}>Book & manage your flights</div>
            </span>
          </button>
        </div>
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
    background: '#DDD3C9',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at top left, #ECC4C3 0%, #DDD3C9 40%, #928E5E 100%)',
    opacity: 0.6,
  },
  card: {
    position: 'relative',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    padding: '52px 44px',
    textAlign: 'center',
    boxShadow: '0 24px 64px rgba(146,127,123,0.25)',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid rgba(236,196,195,0.4)',
  },
  iconWrap: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#575527',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#897D7B',
    fontSize: '15px',
    marginBottom: '24px',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(to right, transparent, #ECC4C3, transparent)',
    marginBottom: '28px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #928E5E, #575527)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 4px 16px rgba(87,85,39,0.3)',
    transition: 'transform 0.1s',
  },
  customerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 4px 16px rgba(185,125,123,0.3)',
    transition: 'transform 0.1s',
  },
  btnIcon: { fontSize: '28px' },
  btnTitle: { fontWeight: '700', fontSize: '15px', marginBottom: '2px' },
  btnSub: { fontSize: '12px', opacity: 0.85 },
};