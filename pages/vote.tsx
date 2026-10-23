import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function VotePortal() {
  const router = useRouter();
  const [votedTrack, setVotedTrack] = useState<string | null>(null);

  const nominees = [
    { id: '1', title: 'Mnike', artist: 'Tyler ICU & Dj Maphorisa' },
        { id: '2', title: 'Tshwala Bam', artist: 'TitoM & Yuppe' },
        { id: '3', title: 'Imithandazo', artist: 'Nkosazana Daughter & Kabza De Small' },
        { id: '4', title: 'Amapiano Ke Life', artist: 'Focalistic & Mellow & Sleazy' },
        { id: '5', title: 'Waka', artist: 'Mellow & Sleazy & SjavasDaDeejay' }
  ];

  const handleVote = async (title: string) => {
    setVotedTrack(title);
    await supabase.from('transmission_logs').insert([{
      message: `TOP 10 VOTE CAST: Operative voted for "${title}"`
    }]);
    alert(`✓ VOTE RECORDED FOR: "${title}". Redirecting to external streaming link...`);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | TOP 10 AMAPIANO VOTE</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">TOP 10 AMAPIANO — WEEK 14</h1>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">VOTING ACTIVE</span>
        </div>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="panel" style={{ marginTop: '15px', border: '1px solid #d4af37', fontSize: '11px', color: '#8e9bae' }}>
        <div style={{ color: '#d4af37', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '4px' }}>
          ⚖️ MUSIC RIGHTS NOTICE
        </div>
        Fan voting poll only. No audio streamed or hosted. Protected as editorial commentary under SA Copyright Act 98 of 1978. Streaming links direct you to licensed third-party platforms (Spotify, Apple Music).
      </div>

      {/* Voting List */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// SELECT NOMINEE TO VOTE</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {nominees.map((n) => (
            <div key={n.id} style={{ padding: '12px', backgroundColor: '#0a101d', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>{n.title}</div>
                <div style={{ color: '#00f2fe', fontSize: '11px', marginTop: '2px' }}>{n.artist}</div>
              </div>
              <button 
                onClick={() => handleVote(n.title)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: votedTrack === n.title ? '#00f2fe' : '#0a101d',
                  border: '1px solid #00f2fe',
                  color: votedTrack === n.title ? '#050811' : '#00f2fe',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {votedTrack === n.title ? '✓ VOTED' : 'VOTE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
