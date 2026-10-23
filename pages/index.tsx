import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function Home() {
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
    alert(`✓ VOTE RECORDED FOR: "${title}" (Fan-voting editorial commentary recorded).`);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | TOP 10 AMAPIANO VOTE</title>
      </Head>

      <div className="dispatch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="header-title" style={{ margin: 0 }}>TOP 10 AMAPIANO — WEEK 14</h1>
          <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>CLASSIFIED MUSIC INTELLIGENCE // FAN VOTE ONLY</span>
        </div>
        <button onClick={() => router.push('/directorate')} style={{ background: 'none', border: '1px solid #d4af37', color: '#d4af37', padding: '6px 12px', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          👑 DIRECTORATE
        </button>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="panel" style={{ marginTop: '15px', border: '1px solid #d4af37', fontSize: '11px', color: '#8e9bae', lineHeight: '1.4' }}>
        <div style={{ color: '#d4af37', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '6px' }}>
          ⚖️ MUSIC RIGHTS NOTICE
        </div>
        Fan voting poll only. No audio streamed or hosted. All rights belong to original artists & labels.<br/><br/>
        <strong style={{ color: '#fff' }}>✓ THIS POLL IS:</strong> A fan vote listing song titles & artist names only. Protected as <strong>editorial commentary</strong> under SA Copyright Act 98 of 1978.<br/><br/>
        <strong style={{ color: '#fff' }}>🚫 NOT:</strong> A streaming service, download platform, or claim of ownership.<br/><br/>
        <strong style={{ color: '#fff' }}>🎵 STREAMING LINKS</strong> direct you to <strong>licensed third-party platforms</strong> (Spotify, Apple Music, YouTube Music). M.O.G. earns no revenue from those platforms and does not host any audio.<br/><br/>
        <strong style={{ color: '#fff' }}>📬 TAKEDOWN:</strong> director.mog@gmail.com · +27 81 387 4921 — actioned within 24hrs.<br/><br/>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
          <span style={{ border: '1px solid #1e293b', padding: '2px 6px', fontSize: '10px' }}>SAMRO</span>
          <span style={{ border: '1px solid #1e293b', padding: '2px 6px', fontSize: '10px' }}>CAPASSO</span>
          <span style={{ border: '1px solid #1e293b', padding: '2px 6px', fontSize: '10px'<span>RISA</span></span>
          <span style={{ border: '1px solid #1e293b', padding: '2px 6px', fontSize: '10px' }}>CIPC</span>
        </div>
      </div>

      {/* Voting List */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// ACTIVE NOMINEES — CAST YOUR VOTE</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {nominees.map((n) => (
            <div key={n.id} style={{ padding: '12px', backgroundColor: '#0a101d', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>{n.title}</div>
                <div style={{ color: '#00f2fe', fontSize: '11px', marginTop: '2px' }}>{n.artist}</div>
              </div>
              <button 
                onClick={() => handleVote(n.title)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: votedTrack === n.title ? '#00f2fe' : '#0a101d',
                  border: '1px solid #00f2fe',
                  color: votedTrack === n.title ? '#050811' : '#00f2fe',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '4px'
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
