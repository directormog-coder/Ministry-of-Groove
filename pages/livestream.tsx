import Head from 'next/head';
import Link from 'next/link';

export default function LiveStream() {
  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px' }}>
      <Head>
        <title>M.O.G. | LIVE STREAM</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          LIVE STREAM STUDIO
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '100%', height: '180px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '6px', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '32px' }}>📻</span>
          <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: 'bold' }}>BROADCAST OFFLINE</span>
        </div>
        <h3 style={{ fontSize: '13px', color: '#d4af37', margin: '0 0 6px 0' }}>MINISTRY OF GROOVE RADIO</h3>
        <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Tune in for live Amapiano DJ sessions & commentary.</p>
      </div>
    </div>
  );
}
