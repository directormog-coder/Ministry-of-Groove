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
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '30px 20px' }}>
      <Head>
        <title>M.O.G. | THE CABINET</title>
      </Head>

      {/* Official Crest Logo Display */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ width: '120px', height: '120px', margin: '0 auto 15px auto', borderRadius: '50%', overflow: 'hidden', border: '2px solid #d4af37', boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)', backgroundColor: '#0a101d' }}>
          <img 
            src="/logo.png" 
            alt="The Ministry of Groove Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <h1 style={{ fontSize: '18px', color: '#d4af37', letterSpacing: '2px', marginBottom: '6px', fontWeight: 'bold' }}>
          MINISTRY OF GROOVE
        </h1>
        <p style={{ fontSize: '10px', color: '#00f2fe', letterSpacing: '2px', margin: 0 }}>
          THE CABINET [PTY] LTD • EST. 2026
        </p>
      </div>

      {/* Navigation Grid */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '15px',
              textAlign: 'center',
              color: '#00f2fe',
              fontWeight: 'bold',
              fontSize: '13px',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
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
