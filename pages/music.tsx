import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function MusicVault() {
  const router = useRouter();
  const [likedTracks, setLikedTracks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const tracks = [
    { id: 'track_1', title: 'Private School Sunset (Original Mix)', artist: 'Director MOG', duration: '06:45', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'track_2', title: 'Witbank Industrial Bassline', artist: 'Soweto Groove Unit', duration: '05:12', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'track_3', title: 'Acid Recovery Plant Dub', artist: 'Cold Mill Residue', duration: '07:30', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  ];

  const toggleLike = async (id: string, title: string) => {
    let updated;
    if (likedTracks.includes(id)) {
      updated = likedTracks.filter(t => t !== id);
    } else {
      updated = [...likedTracks, id];
      await supabase.from('transmission_logs').insert([{ message: `TRACK LIKED TO VAULT: ${title}` }]);
    }
    setLikedTracks(updated);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | ENCRYPTED MUSIC VAULT</title>
      </Head>

      <div className="dispatch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="header-title" style={{ margin: 0 }}>ENCRYPTED MUSIC VAULT</h1>
          <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>CLASSIFIED AUDIO STREAMING GRID</span>
        </div>
        <button onClick={() => router.push('/directorate')} style={{ background: 'none', border: '1px solid #d4af37', color: '#d4af37', padding: '6px 12px', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          👑 DIRECTORATE
        </button>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// ARCHIVED GROOVE MASTERPIECES</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tracks.map((tr) => {
            const isLiked = likedTracks.includes(tr.id);
            return (
              <div key={tr.id} style={{ padding: '14px', backgroundColor: '#0a101d', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold' }}>{tr.title}</div>
                  <div style={{ color: '#00f2fe', fontSize: '11px', marginTop: '3px' }}>{tr.artist} • {tr.duration}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleLike(tr.id, tr.title)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
