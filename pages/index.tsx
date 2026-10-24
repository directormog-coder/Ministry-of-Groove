import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function OperativeHub() {
  const router = useRouter();
  const [profileName, setProfileName] = useState('RECRUIT');
  const [userEmail, setUserEmail] = useState('');
  const [rank, setRank] = useState('RECRUIT');
  const [intelFeed, setIntelFeed] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchIntelFeed();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && data.name) {
        setProfileName(data.name);
        setRank(data.rank || 'RECRUIT');
      } else {
        setProfileName(user.email ? user.email.split('@')[0].toUpperCase() : 'RECRUIT');
      }
    }
  };

  const fetchIntelFeed = async () => {
    const { data } = await supabase
      .from('transmission_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data && data.length > 0) {
      setIntelFeed(data);
    } else {
      setIntelFeed([
        { id: '1', message: 'Welcome to the Ministry of Groove Command Network.', created_at: new Date().toISOString() }
      ]);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px', backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace' }}>
      <Head>
        <title>M.O.G. | OPERATIVE HUB</title>
      </Head>

      {/* Header Bar */}
      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '15px', color: '#d4af37', margin: 0 }}>MINISTRY OF GROOVE</h1>
          <span style={{ fontSize: '9px', color: '#00f2fe' }}>DECRYPTING THE CULTURE. SYNCHRONIZING THE GRID.</span>
        </div>
        <button 
          onClick={() => router.push('/directorate')} 
          style={{ backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', borderRadius: '4px' }}
        >
          👑 DIRECTOR
        </button>
      </div>

      {/* Operative Dossier Banner */}
      <div style={{ margin: '16px', padding: '16px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', borderRadius: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#050811', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🪖
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#8e9bae' }}>OPERATIVE HUB</div>
            <div style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>{profileName}</div>
            <div style={{ fontSize: '10px', color: '#00f2fe', marginTop: '2px' }}>● GROOVE DIVISION · {rank}</div>
          </div>
        </div>
      </div>

      {/* Command Centre Grid */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#8e9bae', marginBottom: '10px' }}>// COMMAND CENTRE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button onClick={() => router.push('/gallery')} style={{ padding: '12px 6px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '10px', cursor: 'pointer', borderRadius: '4px' }}>
            🎬 GALLERY
          </button>
          <button onClick={() => router.push('/live')} style={{ padding: '12px 6px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '10px', cursor: 'pointer', borderRadius: '4px' }}>
            📡 LIVE
          </button>
          <button onClick={() => router.push('/dispatch')} style={{ padding: '12px 6px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '10px', cursor: 'pointer', borderRadius: '4px' }}>
            💬 DISPATCH
          </button>
          <button onClick={() => router.push('/vote')} style={{ padding: '12px 6px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', color: '#00f2fe', fontSize: '10px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
            🗳️ VOTING
          </button>
          <button onClick={() => router.push('/tickets')} style={{ padding: '12px 6px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '10px', cursor: 'pointer', borderRadius: '4px' }}>
            🎟️ TICKETS
          </button>
          <button onClick={() => router.push('/profile')} style={{ padding: '12px 6px', backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', fontSize: '10px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
            👤 PROFILE
          </button>
        </div>
      </div>

      {/* Live Intel Feed */}
      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '11px', color: '#d4af37', marginBottom: '10px' }}>// TRANSMISSIONS & INTEL FEED</h2>
        <div style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {intelFeed.map((item) => (
            <div key={item.id} style={{ fontSize: '11px', color: '#8e9bae', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <span style={{ color: '#00f2fe' }}>●</span> {item.message}
            </div>
          ))}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
