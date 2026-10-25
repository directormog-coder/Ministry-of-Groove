import Head from 'next/head';
import Link from 'next/link';

export default function Gallery() {
  const items = [
    { title: 'THE CABINET SESSION #1', date: 'EST. 2026' },
    { title: 'EXCLUSIVE SET RECAP', date: 'EST. 2026' },
  ];

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px' }}>
      <Head>
        <title>M.O.G. | GALLERY</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          MEDIA GALLERY
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ width: '100%', height: '80px', backgroundColor: '#050811', border: '1px solid #d4af37', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: '20px' }}>
              📸
            </div>
            <div style={{ fontSize: '10px', color: '#ffffff', fontWeight: 'bold', marginBottom: '2px' }}>{item.title}</div>
            <div style={{ fontSize: '9px', color: '#00f2fe' }}>{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
