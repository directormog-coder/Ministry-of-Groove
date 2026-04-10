import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function DirectoryPage() {
  const router = useRouter();
  const [operatives, setOperatives] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setCurrentUser(session.user);

      // Fetch all operatives from the profiles table we created
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session.user.id)
        .order('username', { ascending: true });
      
      setOperatives(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleStartChat = async (targetId: string) => {
    if (typeof (window as any).MOGApp?.establishUplink === 'function') {
      // Use the global function we integrated into app.js
      (window as any).MOGApp.establishUplink(targetId);
    }
  };

  return (
    <div className="directory-container">
      <Head><title>M.O.G. | OPERATIVE DIRECTORY</title></Head>
      <div className="circuit-grid"></div>
      
      <div className="top-bar">
        <button onClick={() => router.back()} className="back-btn">←</button>
        <div className="top-title">OPERATIVE DIRECTORY</div>
      </div>

      <main style={{ padding: '20px' }}>
        <div className="section-hdr">
          <h2>ACTIVE PERSONNEL</h2>
          <div className="line"></div>
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: '40px auto' }}></div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {operatives.map(op => (
              <div key={op.id} className="hero-card">
                <div className="hero-avatar">
                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${op.username}`} alt="avatar" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-cyber" style={{ color: 'var(--gold)', fontSize: '13px' }}>{op.username.toUpperCase()}</div>
                  <div className="rank-tag rank-operative" style={{ marginTop: '4px', display: 'inline-block' }}>{op.rank}</div>
                </div>
                <button className="btn btn-teal btn-sm" onClick={() => handleStartChat(op.id)}>
                  ESTABLISH UPLINK
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <div className="scanlines"></div>
    </div>
  );
}
