import Head from 'next/head';
import { useRouter } from 'next/router';

export default function TicketsPage() {
  const router = useRouter();
  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <Head><title>M.O.G. | TICKETS</title></Head>
      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '14px' }}>← HOME</button>
        <h1 style={{ fontSize: '14px', color: '#d4af37', margin: 0 }}>EVENT TICKETS</h1>
        <span></span>
      </div>
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8e9bae', fontSize: '13px' }}>
        🎟️ You have no active tickets.
      </div>
    </div>
  );
}
