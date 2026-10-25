import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const menuItems = [
    { label: 'PROFILE', path: '/profile' },
    { label: 'CHAT & MESSAGES', path: '/chat' },
    { label: 'VOTE', path: '/vote' },
    { label: 'GALLERY', path: '/gallery' },
    { label: 'LIVE STREAM', path: '/livestream' },
    { label: 'TICKETS', path: '/tickets' },
  ];

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 20px' }}>
      <Head>
        <title>M.O.G. | THE CABINET</title>
      </Head>

      {/* Brand Header & Crest Placeholder / Title */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontSize: '20px', color: '#d4af37', letterSpacing: '2px', marginBottom: '8px', fontWeight: 'bold' }}>
          MINISTRY OF GROOVE
        </h1>
        <p style={{ fontSize: '11px', color: '#00f2fe', letterSpacing: '3px', margin: 0 }}>
          THE CABINET [PTY] LTD • EST. 2026
        </p>
      </div>

      {/* Navigation Grid */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              color: '#00f2fe',
              fontWeight: 'bold',
              fontSize: '13px',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}>
              {item.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
