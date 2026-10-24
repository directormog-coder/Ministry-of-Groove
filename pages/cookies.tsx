import Head from 'next/head';
import { useRouter } from 'next/router';

export default function CookiePolicy() {
  const router = useRouter();
  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '90px', color: '#8e9bae', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
      <Head><title>M.O.G. | COOKIE POLICY</title></Head>
      <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 12px', cursor: 'pointer', marginBottom: '20px' }}>← BACK</button>
      <h1 style={{ color: '#d4af37', fontSize: '18px' }}>COOKIE POLICY</h1>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>1. Essential System Cookies</h3>
      <p>M.O.G. utilizes essential session storage and security tokens (via Supabase Auth) strictly required to maintain active logins and save operative profile state across sessions.</p>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>2. Third-Party Analytics</h3>
      <p>No intrusive commercial tracking cookies are utilized. Preferences can be managed through the interactive Cookie Consent banner on the platform hub.</p>
    </div>
  );
}
