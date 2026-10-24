import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

interface PollSong {
  id: string;
  song_title: string;
  artist_name: string;
  votes_count: number;
}

export default function VotePortal() {
  const router = useRouter();
  const [songs, setSongs] = useState<PollSong[]>([]);
  const [votedSongId, setVotedSongId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_songs')
        .select('*')
        .order('votes_count', { ascending: false });

      if (data && data.length > 0) {
        setSongs(data);
      } else {
        // Fallback default list if database table is initializing
        setSongs([
          { id: '1', song_title: 'Mnike', artist_name: 'Tyler ICU & DJ Maphorisa', votes_count: 120 },
          { id: '2', song_title: 'Tshwala Bam', artist_name: 'TitoM & Yuppe', votes_count: 98 },
          { id: '3', song_title: 'Imithandazo', artist_name: 'Nkosazana Daughter & Kabza De Small', votes_count: 85 },
          { id: '4', song_title: 'Amapiano Ke Life', artist_name: 'Focalistic & Mellow & Sleazy', votes_count: 64 },
          { id: '5', song_title: 'Waka', artist_name: 'Mellow & Sleazy & SjavasDaDeejay', votes_count: 52 }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async (song: PollSong) => {
    if (votedSongId === song.id) return;
    setVotedSongId(song.id);

    // Increment local state UI
    setSongs(prev => prev.map(s => s.id === song.id ? { ...s, votes_count: s.votes_count + 1 } : s));

    // Persist vote increment to Supabase
    try {
      await supabase.from('poll_songs').update({ votes_count: song.votes_count + 1 }).eq('id', song.id);
      await supabase.from('transmission_logs').insert([{ message: `VOTE CAST: "${song.song_title}" by ${song.artist_name}` }]);
      alert(`✓ VOTE RECORDED FOR "${song.song_title.toUpperCase()}"!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px', backgroundColor: '#050811', minHeight: '100vh', color: '#fff' }}>
      <Head>
        <title>M.O.G. | TOP 10 AMAPIANO VOTING</title>
      </Head>

      {/* Header */}
      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '15px', color: '#d4af37', margin: 0, fontFamily: 'monospace' }}>TOP 10 AMAPIANO — WEEK 14</h1>
          <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>CLASSIFIED MUSIC INTELLIGENCE // FAN VOTE ONLY</span>
        </div>
        <button onClick={() => router.push('/directorate')} style={{ background: 'none', border: '1px solid #d4af37', color: '#d4af37', padding: '4px 8px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          👑 DIRECTORATE
        </button>
      </div>

      {/* Music Rights Notice */}
      <div style={{ margin: '16px', padding: '12px', backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '6px', fontSize: '11px', color: '#8e9bae', fontFamily: 'monospace', lineHeight: '1.4' }}>
        <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>⚖️ MUSIC RIGHTS NOTICE</div>
        Fan voting poll only. No audio hosted. Listing protected as editorial commentary under SA Copyright Act 98 of 1978.
      </div>

      {/* Nominees Voting List */}
      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '12px', color: '#00f2fe', fontFamily: 'monospace', marginBottom: '12px' }}>// ACTIVE HITLIST NOMINEES</h2>

        {loading ? (
          <div style={{ color: '#8e9bae', fontFamily: 'monospace', fontSize: '12px', textAlign: 'center', padding: '20px' }}>FETCHING LIVE NOMINEES...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {songs.map((song, idx) => {
              const isVoted = votedSongId === song.id;
              return (
                <div key={song.id} style={{ padding: '12px', backgroundColor: '#0a101d', border: isVoted ? '1px solid #00f2fe' : '1px solid #1e293b', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', color: '#d4af37', fontWeight: 'bold', fontFamily: 'monospace', width: '20px' }}>#{idx + 1}</span>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' }}>{song.song_title}</div>
                      <div style={{ color: '#00f2fe', fontSize: '11px', marginTop: '2px', fontFamily: 'monospace' }}>{song.artist_name}</div>
                      <div style={{ color: '#8e9bae', fontSize: '9px', marginTop: '2px', fontFamily: 'monospace' }}>📊 {song.votes_count} VOTES RECORDED</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCastVote(song)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: isVoted ? '#00f2fe' : '#050811',
                      border: '1px solid #00f2fe',
                      color: isVoted ? '#050811' : '#00f2fe',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    {isVoted ? '✓ VOTED' : 'VOTE'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AudioPlayer />
    </div>
  );
}
