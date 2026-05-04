'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const flights = [
    { code: 'PK101', from: 'KHI', to: 'LHE', time: '06:00', status: 'On Time' },
    { code: 'PK107', from: 'KHI', to: 'DXB', time: '10:00', status: 'On Time' },
    { code: 'PK111', from: 'ISB', to: 'LHR', time: '14:00', status: 'Delayed' },
    { code: 'PK112', from: 'KHI', to: 'JFK', time: '01:00', status: 'On Time' },
    { code: 'PK118', from: 'KHI', to: 'CAI', time: '08:00', status: 'Cancelled' },
    { code: 'PK120', from: 'KHI', to: 'NRT', time: '00:00', status: 'On Time' },
  ];

  return (
    <main style={styles.container}>

      {/* Background layers */}
      <div style={styles.bgGradient} />
      <div style={styles.bgPattern} />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>✈️ AirlineMS</div>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => router.push('/admin/login')}>Admin</button>
          <button style={styles.navBtnPrimary} onClick={() => router.push('/customer/login')}>Book Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ ...styles.hero, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
        <div style={styles.heroBadge}>✈️ Airline Management System</div>
        <h1 style={styles.heroTitle}>
          Your Journey,<br />
          <span style={styles.heroAccent}>Our Priority</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Book flights, manage bookings, and travel with confidence.<br />
          Powered by a complete airline management solution.
        </p>
        <div style={styles.heroButtons}>
          <button style={styles.heroPrimaryBtn} onClick={() => router.push('/customer/login')}>
            🧳 Book a Flight
          </button>
          <button style={styles.heroSecondaryBtn} onClick={() => router.push('/admin/login')}>
            🛠️ Admin Portal
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { value: '20+', label: 'Destinations' },
            { value: '50+', label: 'Customers' },
            { value: '20+', label: 'Daily Flights' },
            { value: '155', label: 'Seats Per Flight' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Departures Board */}
      <section style={styles.boardSection}>
        <h2 style={styles.boardTitle}>🛫 Today's Departures</h2>
        <div style={styles.board}>
          <div style={styles.boardHeader}>
            {['Flight', 'From', 'To', 'Departure', 'Status'].map(h => (
              <div key={h} style={styles.boardHeaderCell}>{h}</div>
            ))}
          </div>
          {flights.map((f, i) => (
            <div key={f.code} style={{
              ...styles.boardRow,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
            }}>
              <div style={styles.boardCell}><span style={styles.flightCode}>{f.code}</span></div>
              <div style={styles.boardCell}>{f.from}</div>
              <div style={styles.boardCell}>{f.to}</div>
              <div style={styles.boardCell}>{f.time}</div>
              <div style={styles.boardCell}>
                <span style={{
                  ...styles.statusBadge,
                  background: f.status === 'On Time' ? '#22c55e' : f.status === 'Delayed' ? '#f59e0b' : '#ef4444'
                }}>
                  {f.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>Everything You Need</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: '🔍', title: 'Search Flights', desc: 'Search by flight code or route with real-time availability' },
            { icon: '💺', title: 'Choose Your Seat', desc: 'Pick from Economy, Business, or First Class seats' },
            { icon: '💳', title: 'Easy Payments', desc: 'Pay securely via card, bank transfer, or cash' },
            { icon: '📋', title: 'Manage Bookings', desc: 'View, cancel, and track all your bookings in one place' },
            { icon: '🛠️', title: 'Admin Control', desc: 'Full flight management including delays and cancellations' },
            { icon: '👨‍✈️', title: 'Crew & Pilots', desc: 'Complete crew and pilot assignment management' },
          ].map(f => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Take Off?</h2>
        <p style={styles.ctaSubtitle}>Create an account or log in to start booking your flights today.</p>
        <div style={styles.heroButtons}>
          <button style={styles.heroPrimaryBtn} onClick={() => router.push('/customer/login')}>
            Get Started →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>✈️ AirlineMS</div>
        <p style={styles.footerText}>© 2026 Airline Management System. Built with Next.js & MySQL.</p>
      </footer>

    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a0f0e',
    color: 'white',
    fontFamily: 'Georgia, serif',
    position: 'relative',
    overflowX: 'hidden',
  },
  bgGradient: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at top left, rgba(236,196,195,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(146,142,94,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  bgPattern: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'radial-gradient(rgba(236,196,195,0.05) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },

  // NAV
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 48px',
    borderBottom: '1px solid rgba(236,196,195,0.1)',
    position: 'relative', zIndex: 10,
  },
  navLogo: { fontSize: '22px', fontWeight: '800', color: '#ECC4C3', letterSpacing: '0.5px' },
  navLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: {
    padding: '8px 20px', background: 'transparent', color: '#DDD3C9',
    border: '1px solid rgba(221,211,201,0.3)', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  navBtnPrimary: {
    padding: '8px 20px', background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 14px rgba(185,125,123,0.4)',
  },

  // HERO
  hero: {
    textAlign: 'center', padding: '80px 48px 60px',
    position: 'relative', zIndex: 10,
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(236,196,195,0.1)',
    border: '1px solid rgba(236,196,195,0.3)',
    color: '#ECC4C3', padding: '8px 20px',
    borderRadius: '999px', fontSize: '14px',
    marginBottom: '28px', fontWeight: '600',
  },
  heroTitle: {
    fontSize: '64px', fontWeight: '900',
    lineHeight: 1.1, marginBottom: '20px',
    color: 'white', letterSpacing: '-1px',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px', color: '#B0A89A',
    lineHeight: 1.7, marginBottom: '40px',
  },
  heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  heroPrimaryBtn: {
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(185,125,123,0.4)',
  },
  heroSecondaryBtn: {
    padding: '16px 36px',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer',
  },

  // STATS
  statsRow: {
    display: 'flex', justifyContent: 'center',
    gap: '24px', marginTop: '60px', flexWrap: 'wrap',
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(236,196,195,0.15)',
    borderRadius: '16px', padding: '24px 36px',
    textAlign: 'center',
  },
  statValue: { fontSize: '36px', fontWeight: '900', color: '#ECC4C3', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#897D7B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },

  // DEPARTURES BOARD
  boardSection: {
    padding: '60px 48px',
    position: 'relative', zIndex: 10,
  },
  boardTitle: {
    fontSize: '28px', fontWeight: '800',
    color: 'white', marginBottom: '24px', textAlign: 'center',
  },
  board: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(236,196,195,0.1)',
    borderRadius: '16px', overflow: 'hidden',
    maxWidth: '800px', margin: '0 auto',
  },
  boardHeader: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr',
    background: 'rgba(236,196,195,0.08)',
    padding: '14px 24px',
    borderBottom: '1px solid rgba(236,196,195,0.1)',
  },
  boardHeaderCell: {
    fontSize: '11px', fontWeight: '700',
    color: '#ECC4C3', textTransform: 'uppercase', letterSpacing: '1px',
  },
  boardRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr',
    padding: '14px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  boardCell: { fontSize: '14px', color: '#DDD3C9', display: 'flex', alignItems: 'center' },
  flightCode: { fontWeight: '700', color: '#ECC4C3' },
  statusBadge: {
    padding: '3px 10px', borderRadius: '999px',
    fontSize: '11px', fontWeight: '700', color: 'white',
  },

  // FEATURES
  featuresSection: {
    padding: '60px 48px',
    position: 'relative', zIndex: 10,
  },
  featuresTitle: {
    fontSize: '36px', fontWeight: '800',
    color: 'white', textAlign: 'center', marginBottom: '40px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px', maxWidth: '1000px', margin: '0 auto',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(236,196,195,0.1)',
    borderRadius: '16px', padding: '28px',
    transition: 'border-color 0.2s',
  },
  featureIcon: { fontSize: '32px', marginBottom: '14px' },
  featureTitle: { fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '8px' },
  featureDesc: { fontSize: '14px', color: '#897D7B', lineHeight: 1.6 },

  // CTA
  ctaSection: {
    padding: '80px 48px',
    textAlign: 'center',
    position: 'relative', zIndex: 10,
    borderTop: '1px solid rgba(236,196,195,0.1)',
  },
  ctaTitle: { fontSize: '42px', fontWeight: '900', color: 'white', marginBottom: '16px' },
  ctaSubtitle: { fontSize: '16px', color: '#897D7B', marginBottom: '36px' },

  // FOOTER
  footer: {
    padding: '32px 48px',
    borderTop: '1px solid rgba(236,196,195,0.1)',
    textAlign: 'center',
    position: 'relative', zIndex: 10,
  },
  footerLogo: { fontSize: '18px', fontWeight: '800', color: '#ECC4C3', marginBottom: '8px' },
  footerText: { fontSize: '13px', color: '#575527' },
};