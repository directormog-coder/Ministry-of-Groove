import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function VoteHub() {
  const router = useRouter();
  const [songs, setSongs] = useState<any[]>([]);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('poll_songs')
      .select('*')
      .order('votes_count', { ascending: false });

    if (data && data.length > 0) {
      setSongs(data);
    } else {
      // Fallback data so voting is never empty
      setSongs([
        { id: '1', song_title: 'Mnike', artist_name: 'Tyler ICU & DJ Maphorisa', votes_count: 145 },
        { id: '2', song_title: 'Tshwala Bam', artist_name: 'Bllaze, EBEN & Sjava', votes_count: 132 },
        { id: '3', song_title: 'Imithandazo', artist_name: 'Kabza De Small & Young Stunna', votes_count: 210 }
      ]);
    }
  };

  const handleVote = async (id: string) => {
    if (voted) return;
    const target = songs.find(s => s.id === id);
    if (!target) return;

    const newVotes = (target.votes_count || 0) + 1;
    await supabase
      .from('poll_songs')
      .update({ votes_count: newVotes })
      .eq('id', id);

    setSongs(songs.map(s => s.id === id ? { ...s, votes_count: newVotes } : s));
    setVoted(true);
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | TOP 10 VOTE</title>
      </Head>

      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '14px' }}>← BACK</button>
        <h1 style={{ fontSize: '14px', color: '#d4af37', margin: 0 }}>TOP 10 AMAPIANO VOTE</h1>
        <span style={{ fontSize: '10px', color: '#00f2fe' }}>WEEK 14</span>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', color: '#8e9bae', marginBottom: '16px' }}>
          // CAST YOUR VOTE. DECIPHER THE CULTURE.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {songs.map((song, index) => (
            <div key={song.id || index} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{index + 1}. {song.song_title}</div>
                <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '2px' }}>{song.artist_name}</div>
                <div style={{ fontSize: '10px', color: '#8e9bae', marginTop: '4px' }}>Votes: {song.votes_count || 0}</div>
              </div>
              <button 
                onClick={() => handleVote(song.id)}
                disabled={voted}
                style={{ backgroundColor: voted ? '#1e293b' : '#00f2fe', border: 'none', color: voted ? '#8e9bae' : '#050811', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: voted ? 'default' : 'pointer' }}
              >
                {voted ? 'VOTED' : 'CAST VOTE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
