import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Vote() {
  const [votes, setVotes] = useState([
    { id: 1, title: 'AMAPIANO TRACK OF THE MONTH', count: 142 },
    { id: 2, title: 'DJ SET OF THE WEEK', count: 89 },
  ]);

  const handleVote = (id: number) => {
    setVotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, count: item.count + 1 } : item))
    );
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px' }}>
      <Head>
        <title>M.O.G. | VOTE</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          COMMUNITY VOTING
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {votes.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '10px', color: '#00f2fe' }}>{item.count} VOTES</div>
            </div>
            <button
              type="button"
              onClick={() => handleVote(item.id)}
              style={{ backgroundColor: '#d4af37', border: 'none', color: '#050811', padding: '8px 16px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}
            >
              VOTE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
