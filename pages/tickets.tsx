import Head from 'next/head';
import Link from 'next/link';

export default function Tickets() {
  const events = [
    { name: 'THE CABINET LAUNCH SESSION', price: 'R 150', status: 'AVAILABLE' },
    { name: 'VIP GROOVE PASS', price: 'R 350', status: 'LIMITED' },
  ];

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px' }}>
      <Head>
        <title>M.O.G. | TICKETS</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          EVENT TICKETS
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {events.map((evt, idx) => (
          <div key={idx} style={{ backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}>{evt.name}</div>
              <div style={{ fontSize: '10px', color: '#00f2fe' }}>{evt.price} • {evt.status}</div>
            </div>
            <button
              type="button"
              style={{ backgroundColor: '#d4af37', border: 'none', color: '#050811', padding: '8px 16px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}
            >
              RESERVE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
