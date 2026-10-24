import Head from 'next/head';
import { useRouter } from 'next/router';

export default function TermsOfService() {
  const router = useRouter();
  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '90px', color: '#8e9bae', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
      <Head><title>M.O.G. | TERMS OF SERVICE</title></Head>
      <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 12px', cursor: 'pointer', marginBottom: '20px' }}>← BACK</button>
      <h1 style={{ color: '#d4af37', fontSize: '18px' }}>TERMS OF SERVICE</h1>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>1. Editorial Commentary & Copyright Positioning</h3>
      <p>M.O.G. functions purely as a fan-voting and community commentary platform protected under the SA Copyright Act 98 of 1978. No audio streaming or audio file hosting takes place on M.O.G. external audio links redirect exclusively to licensed third-party services (Spotify, Apple Music, YouTube Music).</p>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>2. Conduct & Access</h3>
      <p>Access tiers (Recruit, Operative, Agent, Director) grant platform privileges. Misuse, spam, or unauthorized system disruption will result in immediate termination of the operative dossier under Protocol Zero.</p>

      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>3. Takedown Requests</h3>
      <p>IP or rights queries can be directed to <strong>director.mog@gmail.com</strong> for resolution within 24 hours.</p>
    </div>
  );
}
