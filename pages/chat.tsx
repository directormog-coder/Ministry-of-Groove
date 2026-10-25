import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ChatPage() {
  const router = useRouter();
  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <Head><title>M.O.G. | COMMUNITY CHAT</title></Head>
      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '14px' }}>← HOME</button>
        <h1 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>COMMUNITY CHAT</h1>
        <span></span>
      </div>
      <div style={{ padding: '20px', textAlign: 'center', color: '#8e9bae', fontSize: '13px' }}>
        💬 WELCOME TO THE COMMUNITY CHAT ROOM.
      </div>
    </div>
  );
}
