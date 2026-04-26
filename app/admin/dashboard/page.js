'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('flights');
  const [flights, setFlights] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [crew, setCrew] = useState([]);
  const [airports, setAirports] = useState([]);
  const [msg, setMsg] = useState('');

  const [flightForm, setFlightForm] = useState({
    flightCode: '', departure: '', destination: '',
    departure_time: '', arrival_time: '', pilot_id: ''
  });
  const [pilotForm, setPilotForm] = useState({ name: '', license_number: '', experience_years: '' });
  const [crewForm, setCrewForm] = useState({ name: '', role: '', flight_id: '' });
  const [airportForm, setAirportForm] = useState({ code: '', name: '', city: '', country: '' });
  const [delayForm, setDelayForm] = useState({ flightCode: '', departure_time: '', arrival_time: '' });
  const [cancelCode, setCancelCode] = useState('');

  useEffect(() => {
    fetchFlights(); fetchPilots(); fetchCrew(); fetchAirports();
  }, []);

  const fetchFlights = async () => {
    try { const res = await fetch('/api/flights'); const data = await res.json(); setFlights(Array.isArray(data) ? data : []); } catch { setFlights([]); }
  };
  const fetchPilots = async () => {
    try { const res = await fetch('/api/pilots'); const data = await res.json(); setPilots(Array.isArray(data) ? data : []); } catch { setPilots([]); }
  };
  const fetchCrew = async () => {
    try { const res = await fetch('/api/crew'); const data = await res.json(); setCrew(Array.isArray(data) ? data : []); } catch { setCrew([]); }
  };
  const fetchAirports = async () => {
    try { const res = await fetch('/api/airports'); const data = await res.json(); setAirports(Array.isArray(data) ? data : []); } catch { setAirports([]); }
  };

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const addFlight = async () => {
    try {
      const res = await fetch('/api/flights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(flightForm) });
      const data = await res.json();
      if (!res.ok) return notify('Error: ' + data.error);
      notify('Flight added successfully!');
      setFlightForm({ flightCode: '', departure: '', destination: '', departure_time: '', arrival_time: '', pilot_id: '' });
      await fetchFlights();
    } catch (e) { notify('Error: ' + e.message); }
  };

  const delayFlight = async () => {
    try {
      const res = await fetch('/api/flights', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...delayForm, status: 'Delayed' }) });
      if (!res.ok) return notify('Error delaying flight');
      notify('Flight delayed!');
      setDelayForm({ flightCode: '', departure_time: '', arrival_time: '' });
      await fetchFlights();
    } catch (e) { notify('Error: ' + e.message); }
  };

  const cancelFlight = async () => {
    try {
      const res = await fetch('/api/flights', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flightCode: cancelCode, status: 'Cancelled', departure_time: null, arrival_time: null }) });
      if (!res.ok) return notify('Error cancelling flight');
      notify('Flight cancelled!');
      setCancelCode('');
      await fetchFlights();
    } catch (e) { notify('Error: ' + e.message); }
  };

  const addPilot = async () => {
    try {
      const res = await fetch('/api/pilots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pilotForm) });
      const data = await res.json();
      if (!res.ok) return notify('Error: ' + data.error);
      notify('Pilot added!');
      setPilotForm({ name: '', license_number: '', experience_years: '' });
      fetchPilots();
    } catch (e) { notify('Error: ' + e.message); }
  };

  const addCrew = async () => {
    try {
      const res = await fetch('/api/crew', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(crewForm) });
      const data = await res.json();
      if (!res.ok) return notify('Error: ' + data.error);
      notify('Crew member added!');
      setCrewForm({ name: '', role: '', flight_id: '' });
      fetchCrew();
    } catch (e) { notify('Error: ' + e.message); }
  };

  const addAirport = async () => {
    try {
      const res = await fetch('/api/airports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(airportForm) });
      const data = await res.json();
      if (!res.ok) return notify('Error: ' + data.error);
      notify('Airport added!');
      setAirportForm({ code: '', name: '', city: '', country: '' });
      await fetchAirports();
    } catch (e) { notify('Error: ' + e.message); }
  };

  const tabs = ['flights', 'pilots', 'crew', 'airports'];

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛠️ Admin Dashboard</h1>
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

      {tab === 'flights' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Flight</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Flight Code"
              value={flightForm.flightCode} onChange={e => setFlightForm({ ...flightForm, flightCode: e.target.value })} />
            <select style={styles.input} value={flightForm.departure}
              onChange={e => setFlightForm({ ...flightForm, departure: e.target.value })}>
              <option value="">Select Departure</option>
              {airports.map(a => <option key={a.id} value={a.code}>{a.code} — {a.city}</option>)}
            </select>
            <select style={styles.input} value={flightForm.destination}
              onChange={e => setFlightForm({ ...flightForm, destination: e.target.value })}>
              <option value="">Select Destination</option>
              {airports.map(a => <option key={a.id} value={a.code}>{a.code} — {a.city}</option>)}
            </select>
            <input style={styles.input} placeholder="Pilot ID"
              value={flightForm.pilot_id} onChange={e => setFlightForm({ ...flightForm, pilot_id: e.target.value })} />
            <input style={styles.input} type="datetime-local" value={flightForm.departure_time}
              onChange={e => setFlightForm({ ...flightForm, departure_time: e.target.value })} />
            <input style={styles.input} type="datetime-local" value={flightForm.arrival_time}
              onChange={e => setFlightForm({ ...flightForm, arrival_time: e.target.value })} />
          </div>
          <button style={styles.primaryBtn} onClick={addFlight}>Add Flight</button>

          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Delay Flight</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Flight Code" value={delayForm.flightCode}
              onChange={e => setDelayForm({ ...delayForm, flightCode: e.target.value })} />
            <input style={styles.input} type="datetime-local" value={delayForm.departure_time}
              onChange={e => setDelayForm({ ...delayForm, departure_time: e.target.value })} />
            <input style={styles.input} type="datetime-local" value={delayForm.arrival_time}
              onChange={e => setDelayForm({ ...delayForm, arrival_time: e.target.value })} />
          </div>
          <button style={styles.warningBtn} onClick={delayFlight}>Delay Flight</button>

          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Cancel Flight</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Flight Code" value={cancelCode}
              onChange={e => setCancelCode(e.target.value)} />
          </div>
          <button style={styles.dangerBtn} onClick={cancelFlight}>Cancel Flight</button>

          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Flight Schedule</h2>
          {flights.length === 0 ? (
            <p style={{ color: '#94a3b8', marginTop: '12px' }}>No flights added yet.</p>
          ) : (
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

      {tab === 'pilots' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Pilot</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Full Name" value={pilotForm.name}
              onChange={e => setPilotForm({ ...pilotForm, name: e.target.value })} />
            <input style={styles.input} placeholder="License Number" value={pilotForm.license_number}
              onChange={e => setPilotForm({ ...pilotForm, license_number: e.target.value })} />
            <input style={styles.input} placeholder="Experience (years)" value={pilotForm.experience_years}
              onChange={e => setPilotForm({ ...pilotForm, experience_years: e.target.value })} />
          </div>
          <button style={styles.primaryBtn} onClick={addPilot}>Add Pilot</button>
          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Pilots List</h2>
          {pilots.length === 0 ? <p style={{ color: '#94a3b8', marginTop: '12px' }}>No pilots added yet.</p> : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr>{['Name', 'License', 'Experience', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {pilots.map(p => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.license_number}</td>
                      <td style={styles.td}>{p.experience_years} years</td>
                      <td style={styles.td}>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'crew' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Crew Member</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Full Name" value={crewForm.name}
              onChange={e => setCrewForm({ ...crewForm, name: e.target.value })} />
            <select style={styles.input} value={crewForm.role}
              onChange={e => setCrewForm({ ...crewForm, role: e.target.value })}>
              <option value="">Select Role</option>
              <option>Flight Attendant</option>
              <option>Co-Pilot</option>
              <option>Engineer</option>
              <option>Ground Staff</option>
            </select>
            <input style={styles.input} placeholder="Flight ID (optional)" value={crewForm.flight_id}
              onChange={e => setCrewForm({ ...crewForm, flight_id: e.target.value })} />
          </div>
          <button style={styles.primaryBtn} onClick={addCrew}>Add Crew</button>
          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Crew List</h2>
          {crew.length === 0 ? <p style={{ color: '#94a3b8', marginTop: '12px' }}>No crew members added yet.</p> : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr>{['Name', 'Role', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {crew.map(c => (
                    <tr key={c.id}>
                      <td style={styles.td}>{c.name}</td>
                      <td style={styles.td}>{c.role}</td>
                      <td style={styles.td}>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'airports' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Airport</h2>
          <div style={styles.grid}>
            <input style={styles.input} placeholder="Code (e.g. KHI)" value={airportForm.code}
              onChange={e => setAirportForm({ ...airportForm, code: e.target.value })} />
            <input style={styles.input} placeholder="Airport Name" value={airportForm.name}
              onChange={e => setAirportForm({ ...airportForm, name: e.target.value })} />
            <input style={styles.input} placeholder="City" value={airportForm.city}
              onChange={e => setAirportForm({ ...airportForm, city: e.target.value })} />
            <input style={styles.input} placeholder="Country" value={airportForm.country}
              onChange={e => setAirportForm({ ...airportForm, country: e.target.value })} />
          </div>
          <button style={styles.primaryBtn} onClick={addAirport}>Add Airport</button>
          <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>Airports List</h2>
          {airports.length === 0 ? <p style={{ color: '#94a3b8', marginTop: '12px' }}>No airports added yet.</p> : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr>{['Code', 'Name', 'City', 'Country'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {airports.map(a => (
                    <tr key={a.id}>
                      <td style={styles.td}>{a.code}</td>
                      <td style={styles.td}>{a.name}</td>
                      <td style={styles.td}>{a.city}</td>
                      <td style={styles.td}>{a.country}</td>
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
  container: { minHeight: '100vh', background: '#F5F0EB', padding: '28px', fontFamily: 'Georgia, serif' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '28px', background: 'linear-gradient(135deg, #928E5E, #575527)',
    padding: '18px 28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(87,85,39,0.25)',
  },
  title: { fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' },
  logoutBtn: {
    padding: '8px 18px', background: 'rgba(255,255,255,0.15)', color: 'white',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  toast: {
    background: 'linear-gradient(135deg, #928E5E, #575527)', color: 'white',
    padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
    textAlign: 'center', boxShadow: '0 4px 16px rgba(87,85,39,0.2)',
  },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: {
    padding: '10px 22px', border: '1.5px solid #DDD3C9', borderRadius: '10px',
    cursor: 'pointer', background: 'white', color: '#897D7B', fontSize: '14px', fontWeight: '600',
  },
  activeTab: { background: 'linear-gradient(135deg, #928E5E, #575527)', color: 'white', border: '1.5px solid transparent' },
  section: {
    background: 'white', borderRadius: '16px', padding: '28px',
    boxShadow: '0 2px 16px rgba(146,142,94,0.12)', border: '1px solid #EDE8E0',
  },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#575527', marginBottom: '16px', borderLeft: '4px solid #928E5E', paddingLeft: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' },
  input: {
    padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #DDD3C9',
    fontSize: '14px', width: '100%', background: '#FDFAF9', color: '#333', outline: 'none',
  },
  primaryBtn: {
    padding: '11px 26px', background: 'linear-gradient(135deg, #928E5E, #575527)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '700', boxShadow: '0 4px 12px rgba(87,85,39,0.25)',
  },
  warningBtn: {
    padding: '11px 26px', background: 'linear-gradient(135deg, #E8C97A, #C9A84C)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
  },
  dangerBtn: {
    padding: '11px 26px', background: 'linear-gradient(135deg, #ECC4C3, #B97D7B)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
  },
  tableWrapper: { overflowX: 'auto', marginTop: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#F5F0EB', padding: '12px 14px', textAlign: 'left',
    borderBottom: '2px solid #DDD3C9', fontSize: '12px', color: '#928E5E',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  td: { padding: '12px 14px', borderBottom: '1px solid #F0EBE3', fontSize: '14px', color: '#444' },
  badge: { padding: '4px 12px', borderRadius: '999px', color: 'white', fontSize: '12px', fontWeight: '600' },
};