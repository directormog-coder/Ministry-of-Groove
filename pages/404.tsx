import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <Head>
        <title>M.O.G. | 404 SIGNAL LOST</title>
      </Head>
      <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔌</div>
      <h1 style={{ fontSize: '20px', color: '#ef4444', margin: '0 0 8px 0' }}>404: SIGNAL LOST</h1>
      <p style={{ color: '#8e9bae', fontSize: '12px', maxWidth: '300px', marginBottom: '24px' }}>
        THE SECTOR YOU ARE TRYING TO REACH DOES NOT EXIST OR HAS BEEN REDACTED.
      </p>
      <button 
        onClick={() => router.push('/')}
        style={{ backgroundColor: '#00f2fe', border: 'none', color: '#050811', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
      >
        RETURN TO GRID
      </button>
    </div>
  );
}
