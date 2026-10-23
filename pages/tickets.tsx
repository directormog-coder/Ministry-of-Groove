import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  badge: string;
  color: string;
  available: number;
}

export default function ComputicketPortal() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>('vip');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'ozow' | 'card'>('payfast');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<{ passId: string; tierName: string; totalAmount: number } | null>(null);

  const tiers: TicketTier[] = [
    {
      id: 'ga',
      name: 'GENERAL OPERATIVE ACCESS',
      price: 150,
      description: 'Standard floor access to main stage & general bar facilities.',
      badge: 'GA PASS',
      color: '#00f2fe',
      available: 340,
    },
    {
      id: 'vip',
      name: 'VIP CLEARANCE PASSPORT',
      price: 350,
      description: 'VIP lounge access, priority fast-track entry, express bar & complimentary MOG lanyard.',
      badge: 'VIP CLEARANCE',
      color: '#d4af37',
      available: 85,
    },
    {
      id: 'vvip',
      name: 'DIRECTORATE VVIP BACKSTAGE',
      price: 850,
      description: 'Exclusive backstage access, meet & greet with Director & headline DJs, premium bottle service.',
      badge: 'VVIP DIRECTORATE',
      color: '#a855f7',
      available: 12,
    },
  ];

  const currentTier = tiers.find((t) => t.id === selectedTier) || tiers[1];
  const totalPrice = currentTier.price * quantity;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      alert('Please enter your Operative Name and Email address.');
      return;
    }

    setIsProcessing(true);

    // Simulate PayFast / Ozow / Yoco API payment processing delay
    setTimeout(async () => {
      const passId = `MOG-${selectedTier.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Log purchase into database
      await supabase.from('transmission_logs').insert([{
        message: `TICKET PURCHASED: ${customerName} bought ${quantity}x ${currentTier.name} (Ref: ${passId}) via ${paymentMethod.toUpperCase()}`
      }]);

      setPurchasedTicket({
        passId,
        tierName: currentTier.name,
        totalAmount: totalPrice
      });

      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | COMPUTICKET PASS PORTAL</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">OFFICIAL TICKET PORTAL</h1>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">HOWLER / COMPUTICKET SYNCED</span>
        </div>
      </div>

      {!purchasedTicket ? (
        <>
          {/* Event Banner Card */}
          <div className="panel" style={{ marginTop: '20px', border: '1px solid #d4af37' }}>
            <div className="panel-hdr">
              <h2 style={{ color: '#d4af37' }}>// UPCOMING MAIN EVENT</h2>
              <span style={{ fontSize: '11px', color: '#00f2fe', fontFamily: 'monospace' }}>
                STATUS: TICKETS ON SALE
              </span>
            </div>

            <h3 style={{ color: '#fff', fontSize: '18px', fontFamily: 'monospace', margin: '10px 0' }}>
              MINISTRY OF GROOVE: NIGHT OF THE CULTURES
            </h3>
            <p style={{ color: '#8e9bae', fontSize: '12px', lineHeight: '1.5' }}>
              📅 Date: 16 December 2026 // 📍 Venue: Witbank Main Arena / eMalahleni // 🕒 Doors Open: 16:00
            </p>
          </div>

          {/* Tier Selection (Computicket style) */}
          <div className="panel" style={{ marginTop: '20px' }}>
            <div className="panel-hdr">
              <h2>1. SELECT ACCESS TIER</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tiers.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  style={{
                    padding: '14px',
                    backgroundColor: selectedTier === t.id ? 'rgba(212, 175, 55, 0.12)' : '#0a101d',
                    border: selectedTier === t.id ? `1.5px solid ${t.color}` : '1px solid #1e293b',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: t.color, color: '#050811', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', borderRadius: '3px', fontFamily: 'monospace' }}>
                        {t.badge}
                      </span>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }}>
                        {t.name}
                      </span>
                    </div>
                    <p style={{ color: '#8e9bae', fontSize: '11px', marginTop: '6px', margin: 0 }}>
                      {t.description}
                    </p>
                    <span style={{ color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>
                      ⚡ Only {t.available} passes remaining
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                    <div style={{ color: t.color, fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      R {t.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout & Payment Section */}
          <form onSubmit={handleCheckout} className="panel" style={{ marginTop: '20px' }}>
            <div className="panel-hdr">
              <h2>2. OPERATIVE DETAILS & PAYMENT</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
                  OPERATIVE FULL NAME
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. PJ Moloto" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
                  EMAIL ADDRESS (FOR DIGITAL TICKET PASSPORT)
                </label>
                <input 
                  type="email" 
                  placeholder="director.mog@gmail.com" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
                  QUANTITY
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '8px 16px', backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>{quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '8px 16px', backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
                  SELECT PAYMENT GATEWAY
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('payfast')}
                    style={{
                      padding: '10px',
                      backgroundColor: paymentMethod === 'payfast' ? 'rgba(0, 242, 254, 0.2)' : '#0a101d',
                      border: paymentMethod === 'payfast' ? '1px solid #00f2fe' : '1px solid #1e293b',
                      color: paymentMethod === 'payfast' ? '#00f2fe' : '#8e9bae',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      cursor: 'pointer'
                    }}
                  >
                    PayFast
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('ozow')}
                    style={{
                      padding: '10px',
                      backgroundColor: paymentMethod === 'ozow' ? 'rgba(0, 242, 254, 0.2)' : '#0a101d',
                      border: paymentMethod === 'ozow' ? '1px solid #00f2fe' : '1px solid #1e293b',
                      color: paymentMethod === 'ozow' ? '#00f2fe' : '#8e9bae',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      cursor: 'pointer'
                    }}
                  >
                    Ozow EFT
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      padding: '10px',
                      backgroundColor: paymentMethod === 'card' ? 'rgba(0, 242, 254, 0.2)' : '#0a101d',
                      border: paymentMethod === 'card' ? '1px solid #00f2fe' : '1px solid #1e293b',
                      color: paymentMethod === 'card' ? '#00f2fe' : '#8e9bae',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      cursor: 'pointer'
                    }}
                  >
                    Card / Yoco
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#050811', border: '1px solid #d4af37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '13px' }}>TOTAL AMOUNT DUE:</span>
                <span style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold' }}>R {totalPrice}</span>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#d4af37',
                  border: 'none',
                  color: '#050811',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {isProcessing ? 'PROCESSING GATEWAY TRANSACTIONS...' : `CONFIRM & PAY R ${totalPrice}`}
              </button>
            </div>
          </form>
        </>
      ) : (
        /* Computicket / Howler Purchased QR Ticket Voucher */
        <div className="panel" style={{ marginTop: '20px', border: '2px solid #00f2fe', textAlign: 'center', padding: '24px' }}>
          <div style={{ color: '#00f2fe', fontSize: '22px', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '8px' }}>
            ✓ TICKET PURCHASE SUCCESSFUL
          </div>
          <p style={{ color: '#8e9bae', fontSize: '12px', fontFamily: 'monospace' }}>
            YOUR COMPUTICKET PASSPORT HAS BEEN ISSUED TO {customerEmail}
          </p>

          <div style={{
            margin: '20px auto',
            padding: '20px',
            backgroundColor: '#050811',
            border: '1px dashed #d4af37',
            maxWidth: '280px'
          }}>
            <div style={{ color: '#d4af37', fontSize: '12px', fontFamily: 'monospace', marginBottom: '10px' }}>
              OFFICIAL ENTRY CIPHER TOKEN
            </div>
            <div style={{ backgroundColor: '#fff', padding: '15px', display: 'inline-block', borderRadius: '4px' }}>
              {/* Simulated QR Code box */}
              <div style={{ width: '120px', height: '120px', backgroundColor: '#050811', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace' }}>
                [QR CIPHER]
              </div>
            </div>
            <div style={{ color: '#00f2fe', fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '12px' }}>
              {purchasedTicket.passId}
            </div>
            <div style={{ color: '#8e9bae', fontSize: '10px', marginTop: '4px' }}>
              {purchasedTicket.tierName} // R {purchasedTicket.totalAmount} PAID
            </div>
          </div>

          <button 
            onClick={() => setPurchasedTicket(null)}
            className="card-btn cyan"
            style={{ width: '100%', padding: '12px' }}
          >
            BUY ANOTHER PASS
          </button>
        </div>
      )}

      <AudioPlayer />
    </div>
  );
}
