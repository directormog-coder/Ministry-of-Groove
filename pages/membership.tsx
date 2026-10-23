import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function MembershipPortal() {
  const router = useRouter();
  const [currentRank, setCurrentRank] = useState('RECRUIT');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentRank();
  }, []);

  const fetchCurrentRank = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('rank')
        .eq('id', user.id)
        .single();
      if (data && data.rank) {
        setCurrentRank(data.rank);
      }
    }
  };

  const handleUpgrade = async (newRank: string, price: string) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Update rank in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, rank: newRank, updated_at: new Date() });

      if (error) throw error;

      // Log promotion in network transmission logs
      await supabase.from('transmission_logs').insert([{
        message: `MEMBERSHIP PROMOTION: Operative upgraded to [${newRank}] (${price}/${billingCycle})`
      }]);

      setCurrentRank(newRank);
      alert(`✓ RANK PROMOTION SUCCESSFUL! YOUR NEW RANK IS: ${newRank}`);
      router.push('/directorate');
    } catch (err: any) {
      alert('Upgrade failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | MEMBERSHIP TIERS</title>
      </Head>

      <div className="dispatch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
          <h1 className="header-title" style={{ margin: 0 }}>MEMBERSHIP</h1>
        </div>
        <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>RANK: {currentRank}</span>
      </div>

      {/* Current Rank Status Banner */}
      <div className="panel" style={{ marginTop: '15px', border: '1px solid #00f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#8e9bae', fontFamily: 'monospace' }}>CURRENT RANK</div>
          <div style={{ fontSize: '18px', color: '#00f2fe', fontWeight: 'bold', fontFamily: 'monospace' }}>{currentRank}</div>
          <div style={{ fontSize: '10px', color: '#d4af37', fontFamily: 'monospace', marginTop: '2px' }}>MEMBER SINCE 2026</div>
        </div>
        <button onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })} style={{ padding: '6px 12px', backgroundColor: '#d4af37', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', borderRadius: '4px' }}>
          UPGRADE ↓
        </button>
      </div>

      {/* Monthly / Annual Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
        <span style={{ fontSize: '11px', color: billingCycle === 'monthly' ? '#d4af37' : '#8e9bae', fontFamily: 'monospace', fontWeight: 'bold' }}>MONTHLY</span>
        <button 
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          style={{ width: '44px', height: '22px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', borderRadius: '12px', position: 'relative', cursor: 'pointer', padding: '2px' }}
        >
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#00f2fe', position: 'absolute', left: billingCycle === 'annual' ? '24px' : '2px', transition: '0.2s' }}></div>
        </button>
        <span style={{ fontSize: '11px', color: billingCycle === 'annual' ? '#d4af37' : '#8e9bae', fontFamily: 'monospace', fontWeight: 'bold' }}>ANNUAL <span style={{ color: '#00f2fe', fontSize: '9px' }}>(SAVE 20%)</span></span>
      </div>

      {/* Tiers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* RECRUIT */}
        <div className="panel" style={{ border: currentRank === 'RECRUIT' ? '2px solid #00f2fe' : '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace', margin: 0 }}>🪖 RECRUIT</h2>
            {currentRank === 'RECRUIT' && <span style={{ color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace', border: '1px solid #00f2fe', padding: '2px 6px' }}>CURRENT</span>}
          </div>
          <div style={{ fontSize: '20px', color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>FREE</div>
          <ul style={{ paddingLeft: '18px', color: '#8e9bae', fontSize: '11px', lineHeight: '1.8', fontFamily: 'monospace' }}>
            <li>✓ Access to Operative Hub</li>
            <li>✓ General chat rooms</li>
            <li>✓ Top 10 voting (2 votes)</li>
          </ul>
        </div>

        {/* OPERATIVE */}
        <div className="panel" style={{ border: currentRank === 'OPERATIVE' ? '2px solid #00f2fe' : '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#00f2fe', fontSize: '16px', fontFamily: 'monospace', margin: 0 }}>🔫 OPERATIVE</h2>
            <span style={{ color: '#d4af37', fontSize: '10px', fontFamily: 'monospace' }}>POPULAR</span>
          </div>
          <div style={{ fontSize: '20px', color: '#00f2fe', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>
            {billingCycle === 'monthly' ? 'R99 / month' : 'R950 / year'}
          </div>
          <ul style={{ paddingLeft: '18px', color: '#8e9bae', fontSize: '11px', lineHeight: '1.8', fontFamily: 'monospace' }}>
            <li>✓ Everything in Recruit</li>
            <li>✓ Full HD photo & video downloads</li>
            <li>✓ 5 votes per poll week</li>
            <li>✓ 10% discount on tickets</li>
          </ul>
          {currentRank !== 'OPERATIVE' && (
            <button 
              disabled={updating}
              onClick={() => handleUpgrade('OPERATIVE', billingCycle === 'monthly' ? 'R99' : 'R950')}
              style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', color: '#00f2fe', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}
            >
              UPGRADE TO OPERATIVE
            </button>
          )}
        </div>

        {/* AGENT */}
        <div className="panel" style={{ border: currentRank === 'AGENT' ? '2px solid #d4af37' : '1px solid #d4af37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#d4af37', fontSize: '16px', fontFamily: 'monospace', margin: 0 }}>⭐ AGENT</h2>
            <span style={{ color: '#d4af37', fontSize: '10px', fontFamily: 'monospace' }}>BEST VALUE</span>
          </div>
          <div style={{ fontSize: '20px', color: '#d4af37', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>
            {billingCycle === 'monthly' ? 'R199 / month' : 'R1900 / year'}
          </div>
          <ul style={{ paddingLeft: '18px', color: '#8e9bae', fontSize: '11px', lineHeight: '1.8', fontFamily: 'monospace' }}>
            <li>✓ Everything in Operative</li>
            <li>✓ VIP event chat rooms</li>
            <li>✓ 10 votes per poll week</li>
            <li>✓ 20% discount on all tickets</li>
          </ul>
          {currentRank !== 'AGENT' && (
            <button 
              disabled={updating}
              onClick={() => handleUpgrade('AGENT', billingCycle === 'monthly' ? 'R199' : 'R1900')}
              style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#d4af37', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}
            >
              UPGRADE TO AGENT
            </button>
          )}
        </div>

        {/* DIRECTOR */}
        <div className="panel" style={{ border: currentRank === 'DIRECTOR' ? '2px solid #00f2fe' : '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#00f2fe', fontSize: '16px', fontFamily: 'monospace', margin: 0 }}>👑 DIRECTOR</h2>
            <span style={{ color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace' }}>ELITE</span>
          </div>
          <div style={{ fontSize: '20px', color: '#00f2fe', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>
            {billingCycle === 'monthly' ? 'R499 / month' : 'R4700 / year'}
          </div>
          <ul style={{ paddingLeft: '18px', color: '#8e9bae', fontSize: '11px', lineHeight: '1.8', fontFamily: 'monospace' }}>
            <li>✓ Everything in Agent</li>
            <li>✓ Meet & greet invitations</li>
            <li>✓ Unlimited votes per poll</li>
            <li>✓ Complimentary ticket per event</li>
          </ul>
          {currentRank !== 'DIRECTOR' && (
            <button 
              disabled={updating}
              onClick={() => handleUpgrade('DIRECTOR', billingCycle === 'monthly' ? 'R499' : 'R4700')}
              style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#00f2fe', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}
            >
              UPGRADE TO DIRECTOR
            </button>
          )}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
