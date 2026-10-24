import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function Hub() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({ name: 'OPERATIVE', email: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          name: session.user.email?.split('@')[0].toUpperCase() || 'OPERATIVE',
          email: session.user.email
        });
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. // OPERATIVE HUB</title>
      </Head>

      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#050811', fontWeight: 'bold' }}>M</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d4af37' }}>MINISTRY OF GROOVE</div>
            <div style={{ fontSize: '9px', color: '#8e9bae' }}>DECRYPTING THE CULTURE. SYNCHRONIZING THE GRID.</div>
          </div>
        </div>
        <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '12px' }}>DOSSIER →</button>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Operative Card */}
        <div style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', color: '#8e9bae', marginBottom: '4px' }}>OPERATIVE HUB</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{profile.name}</div>
          <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '2px' }}>GROOVE DIVISION // RECRUIT</div>
        </div>

        {/* Command Centre Grid */}
        <div>
          <div style={{ fontSize: '11px', color: '#8e9bae', marginBottom: '10px', letterSpacing: '1px' }}>// COMMAND CENTRE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button onClick={() => router.push('/gallery')} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px 8px', borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎬</div>
              <div style={{ fontSize: '11px' }}>GALLERY</div>
            </button>
            <button onClick={() => router.push('/live')} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px 8px', borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📡</div>
              <div style={{ fontSize: '11px' }}>LIVE</div>
            </button>
            <button onClick={() => router.push('/dispatch')} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px 8px', borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
              <div style={{ fontSize: '11px' }}>DISPATCH</div>
            </button>
            <button onClick={() => router.push('/vote')} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px 8px', borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🗳️</div>
              <div style={{ fontSize: '11px' }}>VOTE</div>
            </button>
            <button onClick={() => router.push('/tickets')} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px 8px', borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎟️</div>
              <div style={{ fontSize: '11px' }}>TICKETS</div>
            </button>
            <button onClick={() => router.push('/profile')} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '16px 8px', borderRadius: '6px', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>👤</div>
              <div style={{ fontSize: '11px' }}>DOSSIER</div>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#0a101d', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 100 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#d4af37', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span>🏠</span> HUB
        </button>
        <button onClick={() => router.push('/gallery')} style={{ background: 'none', border: 'none', color: '#8e9bae', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span>🎬</span> GALLERY
        </button>
        <button onClick={() => router.push('/live')} style={{ background: 'none', border: 'none', color: '#8e9bae', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span>📡</span> LIVE
        </button>
        <button onClick={() => router.push('/dispatch')} style={{ background: 'none', border: 'none', color: '#8e9bae', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span>💬</span> CHAT
        </button>
        <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', color: '#8e9bae', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span>👤</span> PROFILE
        </button>
      </div>

      <AudioPlayer />
    </div>
  );
}
