import Head from 'next/head';
import { useRouter } from 'next/router';

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '90px', color: '#8e9bae', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
      <Head><title>M.O.G. | PRIVACY POLICY</title></Head>
      <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 12px', cursor: 'pointer', marginBottom: '20px' }}>← BACK</button>
      <h1 style={{ color: '#d4af37', fontSize: '18px' }}>PRIVACY POLICY (POPIA COMPLIANT)</h1>
      <p>Ministry of Groove ("M.O.G.") respects your privacy and is committed to protecting your personal data in accordance with South Africa's Protection of Personal Information Act (POPIA).</p>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>1. Data Collection</h3>
      <p>We collect essential operative information including email addresses, profile aliases, phone numbers, and transactional records for event pass reservations and tier upgrades.</p>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>2. Use of Information</h3>
      <p>Your data is strictly utilized to deliver platform functionality, issue digital access passes, log transmission activities, and provide event updates. We do not sell or trade user data to third parties.</p>

      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>3. Data Rights & Enquiries</h3>
      <p>Operatives retain the right to access, rectify, or request deletion of their personal dossier at any time by contacting: <strong>director.mog@gmail.com</strong>.</p>
    </div>
  );
}
