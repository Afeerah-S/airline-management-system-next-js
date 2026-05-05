'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('search');
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [seats, setSeats] = useState([]);
  const [airports, setAirports] = useState([]);
  const [msg, setMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const [customerName, setCustomerName] = useState('');

  const [searchMode, setSearchMode] = useState('code');
  const [searchForm, setSearchForm] = useState({ flightCode: '', departure: '', destination: '' });
  const [bookForm, setBookForm] = useState({ flightCode: '', seatClass: 'Economy', seatNumber: '' });
  const [cancelId, setCancelId] = useState('');
  const [payForm, setPayForm] = useState({ bookingId: '', amount: '', method: 'Credit Card' });

  useEffect(() => {
    const id = localStorage.getItem('customerId');
    const name = localStorage.getItem('customerName');
    if (!id) return router.push('/customer/login');
    setUserId(id);
    setCustomerName(name);
    fetchBookings(id);
    fetchPayments(id);
    fetchAirports();
  }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const fetchBookings = async (id) => {
    try { const res = await fetch(`/api/bookings?userId=${id}`); const data = await res.json(); setBookings(Array.isArray(data) ? data : []); } catch { setBookings([]); }
  };

  const fetchPayments = async (id) => {
    try { const res = await fetch(`/api/payments?userId=${id}`); const data = await res.json(); setPayments(Array.isArray(data) ? data : []); } catch { setPayments([]); }
  };

  const fetchAirports = async () => {
    try { const res = await fetch('/api/airports'); const data = await res.json(); setAirports(Array.isArray(data) ? data : []); } catch { setAirports([]); }
  };

  const searchFlights = async () => {
    if (searchMode === 'code' && !searchForm.flightCode.trim()) {
      return notify('Please enter a flight code.');
    }
    if (searchMode === 'route' && !searchForm.departure) {
      return notify('Please select a departure airport.');
    }
    if (searchMode === 'route' && !searchForm.destination) {
      return notify('Please select a destination airport.');
    }
    if (searchMode === 'route' && searchForm.departure === searchForm.destination) {
      return notify('Departure and destination cannot be the same.');
    }
    try {
      const params = new URLSearchParams(searchForm).toString();
      const res = await fetch(`/api/flights?${params}`);
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length === 0) notify('No flights found for your search.');
    } catch { setFlights([]); notify('Error fetching flights.'); }
  };

  const fetchSeats = async () => {
    if (!bookForm.flightCode.trim()) return notify('Please enter a flight code.');
    try {
      const res = await fetch(`/api/seats?flightCode=${bookForm.flightCode}&class=${bookForm.seatClass}`);
      const data = await res.json();
      setSeats(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length === 0) notify('No available seats for this flight and class.');
    } catch { setSeats([]); notify('Error loading seats.'); }
  };

  const bookFlight = async () => {
    if (!bookForm.flightCode.trim()) return notify('Please enter a flight code.');
    if (!bookForm.seatNumber) return notify('Please select a seat.');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...bookForm }),
      });
      const data = await res.json();
      if (!res.ok) return notify('Error: ' + data.error);
      notify('Flight booked successfully!');
      setBookForm({ flightCode: '', seatClass: 'Economy', seatNumber: '' });
      setSeats([]);
      fetchBookings(userId);
    } catch (e) { notify('Error: ' + e.message); }
  };

  const cancelBooking = async () => {
    if (!cancelId.trim()) return notify('Please enter a booking ID.');
    try {
      const res = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: cancelId, userId }),
      });
      if (!res.ok) return notify('Booking not found or does not belong to you.');
      notify('Booking cancelled!');
      setCancelId('');
      fetchBookings(userId);
    } catch (e) { notify('Error: ' + e.message); }
  };

  const makePayment = async () => {
    if (!payForm.bookingId.trim()) return notify('Please enter a booking ID.');
    if (!payForm.amount.trim() || isNaN(payForm.amount) || Number(payForm.amount) <= 0) return notify('Please enter a valid amount.');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payForm),
      });
      if (!res.ok) return notify('Payment failed. Check your booking ID.');
      notify('Payment successful!');
      setPayForm({ bookingId: '', amount: '', method: 'Credit Card' });
      fetchPayments(userId);
    } catch (e) { notify('Error: ' + e.message); }
  };

  const tabs = ['search', 'book', 'bookings', 'payments'];
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#B97D7B', display: 'block', marginBottom: '6px' };

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 Welcome, {customerName}</h1>
        <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); router.push('/'); }}>Logout</button>
      </div>

      {msg && <div style={styles.toast}>{msg}</div>}

      <div style={styles.tabs}>
        {tabs.map(t => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Search Flights</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button style={{ ...styles.secondaryBtn, opacity: searchMode === 'code' ? 1 : 0.5 }}
              onClick={() => { setSearchMode('code'); setFlights([]); setSearchForm({ flightCode: '', departure: '', destination: '' }); }}>
              🔍 Search by Flight Code
            </button>
            <button style={{ ...styles.secondaryBtn, opacity: searchMode === 'route' ? 1 : 0.5 }}
              onClick={() => { setSearchMode('route'); setFlights([]); setSearchForm({ flightCode: '', departure: '', destination: '' }); }}>
              🗺️ Search by Route
            </button>
          </div>

          {searchMode === 'code' && (
            <div style={styles.grid}>
              <div>
                <label style={labelStyle}>Flight Code</label>
                <input style={styles.input} placeholder="e.g. PK101" value={searchForm.flightCode}
                  onChange={e => setSearchForm({ ...searchForm, flightCode: e.target.value })} />
              </div>
            </div>
          )}

          {searchMode === 'route' && (
            <div style={styles.grid}>
              <div>
                <label style={labelStyle}>From</label>
                <select style={styles.input} value={searchForm.departure}
                  onChange={e => setSearchForm({ ...searchForm, departure: e.target.value })}>
                  <option value="">-- Select departure --</option>
                  {airports.map(a => (
                    <option key={a.id} value={a.code}>{a.code} — {a.city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>To</label>
                <select style={styles.input} value={searchForm.destination}
                  onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })}>
                  <option value="">-- Select destination --</option>
                  {airports.filter(a => a.code !== searchForm.departure).map(a => (
                    <option key={a.id} value={a.code}>{a.code} — {a.city}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button style={{ ...styles.primaryBtn, marginTop: '4px' }} onClick={searchFlights}>Search</button>

          {flights.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>{['Code', 'From', 'To', 'Departure', 'Arrival', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {flights.map(f => (
                    <tr key={f.id}>
                      <td style={styles.td}>{f.flightCode}</td>
                      <td style={styles.td}>{f.departure}</td>
                      <td style={styles.td}>{f.destination}</td>
                      <td style={styles.td}>{f.departure_time ? new Date(f.departure_time).toLocaleString() : '-'}</td>
                      <td style={styles.td}>{f.arrival_time ? new Date(f.arrival_time).toLocaleString() : '-'}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, background: f.status === 'On Time' ? '#22c55e' : f.status === 'Delayed' ? '#f59e0b' : '#ef4444' }}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'book' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Book a Flight</h2>
          <div style={styles.grid}>
            <div>
              <label style={labelStyle}>Flight Code</label>
              <input style={styles.input} placeholder="e.g. PK101" value={bookForm.flightCode}
                onChange={e => { setBookForm({ ...bookForm, flightCode: e.target.value }); setSeats([]); }} />
            </div>
            <div>
              <label style={labelStyle}>Seat Class</label>
              <select style={styles.input} value={bookForm.seatClass}
                onChange={e => { setBookForm({ ...bookForm, seatClass: e.target.value }); setSeats([]); }}>
                <option>Economy</option>
                <option>Business</option>
                <option>First Class</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button style={styles.secondaryBtn} onClick={fetchSeats}>Load Seats</button>
            </div>
          </div>

          {seats.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Select Seat</label>
              <select style={{ ...styles.input, maxWidth: '250px' }} value={bookForm.seatNumber}
                onChange={e => setBookForm({ ...bookForm, seatNumber: e.target.value })}>
                <option value="">-- Choose a seat --</option>
                {seats.map(s => <option key={s.id} value={s.seat_number}>{s.seat_number} ({s.class})</option>)}
              </select>
            </div>
          )}

          {seats.length === 0 && (
            <p style={{ color: '#B0A89A', marginBottom: '16px', fontSize: '14px' }}>
              Enter a flight code, select a class, then click Load Seats.
            </p>
          )}

          <button style={styles.primaryBtn} onClick={bookFlight}>Book Flight</button>
        </div>
      )}

      {tab === 'bookings' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Bookings</h2>
          {bookings.length === 0 ? (
            <p style={{ color: '#B0A89A', marginTop: '12px' }}>No bookings yet.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>{['Booking ID', 'Flight', 'From', 'To', 'Departure', 'Arrival', 'Seat', 'Class', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={styles.td}>{b.id}</td>
                      <td style={styles.td}>{b.flightCode}</td>
                      <td style={styles.td}>{b.depart}</td>
                      <td style={styles.td}>{b.arrive}</td>
                      <td style={styles.td}>{b.depart_time ? new Date(b.depart_time).toLocaleString() : '-'}</td>
                      <td style={styles.td}>{b.arrive_time ? new Date(b.arrive_time).toLocaleString() : '-'}</td>
                      <td style={styles.td}>{b.seat_number}</td>
                      <td style={styles.td}>{b.class}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, background: b.status === 'On Time' ? '#22c55e' : b.status === 'Delayed' ? '#f59e0b' : '#ef4444' }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Cancel a Booking</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Booking ID" value={cancelId}
              onChange={e => setCancelId(e.target.value)} />
          </div>
          <button style={styles.dangerBtn} onClick={cancelBooking}>Cancel Booking</button>
        </div>
      )}

      {tab === 'payments' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Make a Payment</h2>
          <div style={styles.grid}>
            <div>
              <label style={labelStyle}>Booking ID</label>
              <input style={styles.input} placeholder="e.g. 1" value={payForm.bookingId}
                onChange={e => setPayForm({ ...payForm, bookingId: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Amount ($)</label>
              <input style={styles.input} placeholder="e.g. 150" value={payForm.amount}
                onChange={e => setPayForm({ ...payForm, amount: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Payment Method</label>
              <select style={styles.input} value={payForm.method}
                onChange={e => setPayForm({ ...payForm, method: e.target.value })}>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
              </select>
            </div>
          </div>
          <button style={styles.primaryBtn} onClick={makePayment}>Pay Now</button>

          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Payment History</h2>
          {payments.length === 0 ? (
            <p style={{ color: '#B0A89A', marginTop: '12px' }}>No payments yet.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>{['Payment ID', 'Booking ID', 'Flight', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.id}</td>
                      <td style={styles.td}>{p.booking_id}</td>
                      <td style={styles.td}>{p.flightCode}</td>
                      <td style={styles.td}>${p.amount}</td>
                      <td style={styles.td}>{p.method}</td>
                      <td style={styles.td}>{p.status}</td>
                      <td style={styles.td}>{p.paid_at ? new Date(p.paid_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#FDF7F6', padding: '28px', fontFamily: 'Georgia, serif' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '28px', background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    padding: '18px 28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(185,125,123,0.25)',
  },
  title: { fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' },
  logoutBtn: {
    padding: '8px 18px', background: 'rgba(255,255,255,0.2)', color: 'white',
    border: '1px solid rgba(255,255,255,0.35)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  toast: {
    background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)', color: 'white',
    padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
    textAlign: 'center', boxShadow: '0 4px 16px rgba(185,125,123,0.2)',
  },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: {
    padding: '10px 22px', border: '1.5px solid #ECC4C3', borderRadius: '10px',
    cursor: 'pointer', background: 'white', color: '#B97D7B', fontSize: '14px', fontWeight: '600',
  },
  activeTab: { background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)', color: 'white', border: '1.5px solid transparent' },
  section: {
    background: 'white', borderRadius: '16px', padding: '28px',
    boxShadow: '0 2px 16px rgba(236,196,195,0.2)', border: '1px solid #F5E8E7',
  },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#B97D7B', marginBottom: '16px', borderLeft: '4px solid #ECC4C3', paddingLeft: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' },
  input: {
    padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #ECC4C3',
    fontSize: '14px', width: '100%', background: '#FDFAF9', color: '#333', outline: 'none',
  },
  primaryBtn: {
    padding: '11px 26px', background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '700', boxShadow: '0 4px 12px rgba(185,125,123,0.25)',
  },
  secondaryBtn: {
    padding: '11px 26px', background: 'linear-gradient(135deg, #DDD3C9, #928E5E)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
  },
  dangerBtn: {
    padding: '11px 26px', background: 'linear-gradient(135deg, #928E5E, #575527)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
  },
  tableWrapper: { overflowX: 'auto', marginTop: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#FDF7F6', padding: '12px 14px', textAlign: 'left',
    borderBottom: '2px solid #ECC4C3', fontSize: '12px', color: '#B97D7B',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  td: { padding: '12px 14px', borderBottom: '1px solid #F9F0EF', fontSize: '14px', color: '#444' },
  badge: { padding: '4px 12px', borderRadius: '999px', color: 'white', fontSize: '12px', fontWeight: '600' },
};