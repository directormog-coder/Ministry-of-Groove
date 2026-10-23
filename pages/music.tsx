import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function MusicVault() {
  const router = useRouter();
  const [likedTracks, setLikedTracks] = useState<string[]>(['track_1', 'track_3']);

  const toggleLike = async (id: string) => {
    if (likedTracks.includes(id)) {
      setLikedTracks(likedTracks.filter(t => t !== id));
    } else {
      setLikedTracks([...likedTracks, id]);
      await supabase.from('transmission_logs').insert([{ message: `TRACK LIKED TO VAULT: ${id}` }]);
    }
  };

  const tracks = [
    { id: 'track_1', title: 'Private School Sunset (Original Mix)', artist: 'Director MOG', duration: '06:45' },
    { id: 'track_2', title: 'Witbank Industrial Bassline', artist: 'Soweto Groove Unit', duration: '05:12' },
    { id: 'track_3', title: 'Acid Recovery Plant Dub', artist: 'Cold Mill Residue', duration: '07:30' },
  ];

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | ENCRYPTED MUSIC VAULT</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">ENCRYPTED MUSIC VAULT</h1>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// LIKED TRACKS & TRENDING CHARTS</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tracks.map((tr) => {
            const isLiked = likedTracks.includes(tr.id);
            return (
              <div key={tr.id} style={{ padding: '12px', backgroundColor: '#0a101d', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold' }}>{tr.title}</div>
                  <div style={{ color: '#8e9bae', fontSize: '11px', marginTop: '2px' }}>{tr.artist} • {tr.duration}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => toggleLike(tr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
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
