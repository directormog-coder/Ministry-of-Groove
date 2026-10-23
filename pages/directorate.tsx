import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function Directorate() {
  const router = useRouter();
  const [profileName, setProfileName] = useState('OPERATIVE');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchLogs();

    const channel = supabase
      .channel('public:transmission_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transmission_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    if (data && data.name) {
      setProfileName(data.name);
    } else if (user.email) {
      setProfileName(user.email.split('@')[0]);
    }
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('transmission_logs').select('*').order('created_at', { ascending: false }).limit(5);
    if (data) setLogs(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | DIRECTORATE COMMAND</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '15px', color: '#d4af37', fontFamily: 'monospace', margin: 0 }}>MINISTRY OF GROOVE</h1>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          → EXIT
        </button>
      </div>

      {/* Operative Hub Card */}
      <div className="panel" style={{ border: '1px solid #00f2fe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8e9bae', fontFamily: 'monospace' }}>OPERATIVE HUB</div>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', margin: '4px 0' }}>
              {profileName}
            </div>
            <div style={{ fontSize: '11px', color: '#00f2fe', fontFamily: 'monospace' }}>● NETWORK STATUS: GENESIS PHASE</div>
          </div>
          <button onClick={() => router.push('/profile')} style={{ background: 'none', border: '1px solid #1e293b', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}>
            ✏️
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
          <div style={{ padding: '10px', backgroundColor: '#0a101d', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '9px', color: '#8e9bae', fontFamily: 'monospace' }}>NETWORK SESSIONS</div>
            <div style={{ fontSize: '16px', color: '#d4af37', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '2px' }}>0</div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#0a101d', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '9px', color: '#8e9bae', fontFamily: 'monospace' }}>GROOVE SYNC</div>
            <div style={{ fontSize: '16px', color: '#00f2fe', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '2px' }}>INITIALIZING</div>
          </div>
        </div>
      </div>

      {/* Command Centre Grid */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// COMMAND CENTRE</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <button onClick={() => router.push('/stories')} className="card-btn cyan" style={{ padding: '16px 8px', textAlign: 'center' }}>📸 STORIES</button>
          <button onClick={() => router.push('/live')} className="card-btn cyan" style={{ padding: '16px 8px', textAlign: 'center' }}>📡 LIVE</button>
          <button onClick={() => router.push('/dispatch')} className="card-btn cyan" style={{ padding: '16px 8px', textAlign: 'center' }}>💬 DISPATCH</button>
          <button onClick={() => router.push('/music')} className="card-btn cyan" style={{ padding: '16px 8px', textAlign: 'center' }}>🎧 VAULT</button>
          <button onClick={() => router.push('/tickets')} className="card-btn cyan" style={{ padding: '16px 8px', textAlign: 'center' }}>🎟️ TICKETS</button>
          <button onClick={() => router.push('/channels')} className="card-btn cyan" style={{ padding: '16px 8px', textAlign: 'center' }}>🛡️ CHANNELS</button>
        </div>
      </div>

      {/* Upcoming Session - Genesis Notice */}
      <div className="panel" style={{ marginTop: '20px', border: '1px dashed #d4af37' }}>
        <div style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace', marginBottom: '6px' }}>
          📡 MAIDEN OPERATION STATUS
        </div>
        <h3 style={{ color: '#fff', fontSize: '14px', fontFamily: 'monospace', margin: '4px 0' }}>
          PLATFORM IN GENESIS DEPLOYMENT
        </h3>
        <p style={{ color: '#8e9bae', fontSize: '11px', lineHeight: '1.4', margin: '8px 0 0 0' }}>
          No live sessions have been initiated yet. The grid is active and awaiting the Director's inaugural transmission and event drop. Stay tuned.
        </p>
      </div>

      {/* Transmissions Intel Feed */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// INTEL FEED</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.map((log) => (
            <div key={log.id || Math.random()} style={{ fontSize: '11px', fontFamily: 'monospace', color: '#8e9bae', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <span style={{ color: '#00f2fe' }}>[{new Date(log.created_at || Date.now()).toLocaleTimeString()}]:</span> {log.message}
            </div>
          ))}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
