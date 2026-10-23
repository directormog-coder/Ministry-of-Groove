import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function StoriesHub() {
  const router = useRouter();
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState({ a: 124, b: 89 });

  const handleVote = async (option: 'a' | 'b') => {
    if (voted) return;
    if (option === 'a') setVoteCount(prev => ({ ...prev, a: prev.a + 1 }));
    else setVoteCount(prev => ({ ...prev, b: prev.b + 1 }));
    setVoted(true);

    await supabase.from('transmission_logs').insert([{
      message: `STORY POLL VOTED: Option ${option.toUpperCase()} selected`
    }]);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | GROOVE STORIES</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">GROOVE STORIES // 24H DROP</h1>
      </div>

      <div className="panel" style={{ marginTop: '20px', position: 'relative', height: '400px', backgroundColor: '#000', border: '1px solid #d4af37', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', borderRadius: '8px' }}>
        {/* Story Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: '#050811' }}>
            DIR
          </div>
          <div>
            <span style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>DIRECTORATE_MOG</span>
            <span style={{ color: '#8e9bae', fontSize: '10px', display: 'block' }}>2h ago // Backstage Teaser</span>
          </div>
        </div>

        {/* Story Content / Poll Sticker */}
        <div style={{ zIndex: 2, backgroundColor: 'rgba(5, 8, 17, 0.85)', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ color: '#d4af37', fontSize: '13px', fontFamily: 'monospace', marginBottom: '10px', textAlign: 'center' }}>
            ⚡ LIVE POLL: WHICH AMAPIANO SUB-GENRE NEXT?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => handleVote('a')}
              style={{ padding: '10px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', color: '#00f2fe', fontFamily: 'monospace', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>1. Private School Piano</span>
              <span>{voted ? `${voteCount.a} votes` : ''}</span>
            </button>
            <button 
              onClick={() => handleVote('b')}
              style={{ padding: '10px', backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', fontFamily: 'monospace', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>2. Quantum & Bacardi</span>
              <span>{voted ? `${voteCount.b} votes` : ''}</span>
            </button>
          </div>
        </div>

        {/* Story Footer */}
        <div style={{ textAlign: 'center', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', zIndex: 2 }}>
          TAP LEFT/RIGHT TO NAVIGATE DROPS
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
