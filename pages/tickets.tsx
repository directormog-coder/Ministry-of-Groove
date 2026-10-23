import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function TicketPortal() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>('GA');
  const [quantity, setQuantity] = useState<number>(1);
  const [issuedPass, setIssuedPass] = useState<any | null>(null);

  const tiers = [
    { id: 'GA', name: 'GENERAL ACCESS', price: 150, description: 'Standard Entry · Main Stage Access · Cashless Bar Access' },
    { id: 'VIP', name: 'VIP OPERATIVE PASS', price: 350, description: 'Express Entry · VIP Lounge Access · Dedicated Bar & Restrooms' },
    { id: 'VVIP', name: 'DIRECTORATE VVIP', price: 750, description: 'Backstage Access · Complimentary Welcome Drink · Exclusive DJ Pit Access' }
  ];

  const currentTier = tiers.find((t) => t.id === selectedTier) || tiers[0];
  const totalPrice = currentTier.price * quantity;

  const handleCheckout = async () => {
    const passCode = `MOG-GENESIS-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newPass = {
      passCode,
      tier: currentTier.name,
      qty: quantity,
      total: totalPrice,
      issuedAt: new Date().toLocaleTimeString()
    };

    setIssuedPass(newPass);

    await supabase.from('transmission_logs').insert([{
      message: `EARLY ACCESS PASS RESERVED: ${currentTier.name} (x${quantity}) — R${totalPrice}`
    }]);

    alert(`✓ ACCESS RESERVED! PASS CODE: ${passCode}`);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | TICKET PORTAL</title>
      </Head>

      <div className="dispatch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
          <div>
            <h1 className="header-title" style={{ margin: 0 }}>TICKET PORTAL</h1>
            <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>GENESIS PASS RESERVATION</span>
          </div>
        </div>
        <button onClick={() => router.push('/wallet')} style={{ background: 'none', border: '1px solid #d4af37', color: '#d4af37', padding: '4px 8px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          💳 WALLET
        </button>
      </div>

      {/* Main Banner */}
      <div className="panel" style={{ marginTop: '15px', border: '1px solid #d4af37' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>// INAUGURAL OPERATION</div>
            <h2 style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace', margin: '4px 0' }}>M.O.G. SESSION 01 — MAIDEN DROP</h2>
            <div style={{ fontSize: '11px', color: '#8e9bae', fontFamily: 'monospace' }}>📅 DATE: ANNOUNCEMENT INCOMING</div>
            <div style={{ fontSize: '11px', color: '#8e9bae', fontFamily: 'monospace' }}>📍 LOCATION: EMALAHLENI // CLASSIFIED</div>
          </div>
          <span style={{ border: '1px solid #00f2fe', color: '#00f2fe', padding: '2px 6px', fontSize: '9px', fontFamily: 'monospace', borderRadius: '4px' }}>EARLY BIRD</span>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// SELECT TICKET TIER</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div 
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                style={{
                  padding: '14px',
                  backgroundColor: isSelected ? '#0d2238' : '#0a101d',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid #1e293b',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>
                    {tier.name}
                  </div>
                  <div style={{ color: '#d4af37', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px' }}>
                    R{tier.price}
                  </div>
                </div>
                <div style={{ color: '#8e9bae', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>
                  {tier.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quantity & Order Summary */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// ORDER SUMMARY</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: '#8e9bae', fontSize: '12px', fontFamily: 'monospace' }}>PASS QUANTITY:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ padding: '4px 10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', cursor: 'pointer' }}
            >
              -
            </button>
            <span style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              style={{ padding: '4px 10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold' }}>TOTAL DUE:</span>
          <span style={{ color: '#00f2fe', fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold' }}>R{totalPrice}</span>
        </div>

        <button 
          onClick={handleCheckout}
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#d4af37',
            border: 'none',
            color: '#050811',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          🎟️ RESERVE PASSES (PAYFAST / OZOW)
        </button>
      </div>

      {/* Generated Pass Modal Card */}
      {issuedPass && (
        <div className="panel" style={{ marginTop: '20px', border: '2px solid #00f2fe', textAlign: 'center', backgroundColor: '#0a101d' }}>
          <div style={{ color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '4px' }}>✓ PASS RESERVED & ACTIVATED</div>
          <h3 style={{ color: '#fff', margin: '4px 0', fontFamily: 'monospace' }}>{issuedPass.tier}</h3>
          <div style={{ fontSize: '20px', color: '#d4af37', fontFamily: 'monospace', letterSpacing: '2px', margin: '10px 0' }}>
            {issuedPass.passCode}
          </div>
          <div style={{ fontSize: '10px', color: '#8e9bae', fontFamily: 'monospace' }}>
            QTY: {issuedPass.qty} · ISSUED AT: {issuedPass.issuedAt}
          </div>
          <button 
            onClick={() => router.push('/wallet')}
            style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#050811', border: '1px solid #00f2fe', color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            VIEW IN DIGITAL WALLET →
          </button>
        </div>
      )}

      <AudioPlayer />
    </div>
  );
}
