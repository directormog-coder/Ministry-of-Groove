import Head from 'next/head';
import { useRouter } from 'next/router';

export default function RefundPolicy() {
  const router = useRouter();
  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '90px', color: '#8e9bae', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
      <Head><title>M.O.G. | REFUND POLICY</title></Head>
      <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 12px', cursor: 'pointer', marginBottom: '20px' }}>← BACK</button>
      <h1 style={{ color: '#d4af37', fontSize: '18px' }}>REFUND & CANCELLATION POLICY</h1>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>1. Event Access Passes</h3>
      <p>Event pass reservations and ticket purchases are subject to the South African Consumer Protection Act (CPA). Refunds for event cancellations will be credited back automatically via the initial payment method.</p>
      
      <h3 style={{ color: '#00f2fe', marginTop: '15px' }}>2. Membership Tier Upgrades</h3>
      <p>Digital rank promotions (Operative, Agent, Director) provide immediate platform access. Monthly subscriptions can be canceled at any time prior to the next billing cycle via your profile settings.</p>
    </div>
  );
}
