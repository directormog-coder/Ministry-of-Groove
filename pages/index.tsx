import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '20px' }}>
      <Head>
        <title>M.O.G. | MINISTRY OF GROOVE</title>
      </Head>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h1 style={{ color: '#d4af37', fontSize: '24px', marginBottom: '10px' }}>MINISTRY OF GROOVE</h1>
        <p style={{ color: '#8e9bae', fontSize: '12px', marginBottom: '30px' }}>SECURE AMAPIANO COMMUNITY HUB</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
          <button onClick={() => router.push('/profile')} style={btnStyle}>DOSSIER // PROFILE</button>
          <button onClick={() => router.push('/dispatch')} style={btnStyle}>DISPATCH</button>
          <button onClick={() => router.push('/vote')} style={btnStyle}>VOTE</button>
          <button onClick={() => router.push('/gallery')} style={btnStyle}>GALLERY</button>
          <button onClick={() => router.push('/live')} style={btnStyle}>LIVE FREQUENCY</button>
          <button onClick={() => router.push('/tickets')} style={btnStyle}>TICKETS</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  backgroundColor: '#0a101d',
  border: '1px solid #1e293b',
  color: '#00f2fe',
  padding: '12px',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '12px'
};
