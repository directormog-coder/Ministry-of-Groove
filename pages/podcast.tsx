import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

interface PodcastEpisode {
  id: string;
  title: string;
  episode_number: number;
  description: string;
  audio_url: string;
  duration: string;
  created_at: string;
}

export default function PodcastHub() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    const { data } = await supabase.from('podcasts').select('*').order('episode_number', { ascending: false });
    if (data && data.length > 0) {
      setEpisodes(data);
      setActiveEpisode(data[0]);
    } else {
      // Default placeholder episode if database table is fresh
      const mock: PodcastEpisode = {
        id: '1',
        title: 'EP. 001: DECRYPTING THE AMAPIANO SOUNDSCAPE',
        episode_number: 1,
        description: 'Host: Director MOG // Diving deep into sub-bass frequencies, street culture origins, and the future of South African electronic music.',
        audio_url: 'https://stream.zeno.fm/f3wvbb1428uvv',
        duration: '45:20',
        created_at: new Date().toISOString(),
      };
      setEpisodes([mock]);
      setActiveEpisode(mock);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | DIRECTOR'S PODCAST</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">THE DIRECTOR'S PODCAST</h1>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">TRANSMITTING</span>
        </div>
      </div>

      {activeEpisode && (
        <div className="panel" style={{ marginTop: '20px', border: '1px solid #d4af37' }}>
          <div className="panel-hdr">
            <h2 style={{ color: '#d4af37' }}>// FEATURED TRANSMISSION</h2>
            <span style={{ fontSize: '12px', color: '#00f2fe', fontFamily: 'monospace' }}>
              DURATION: {activeEpisode.duration}
            </span>
          </div>

          <h3 style={{ color: '#fff', margin: '10px 0', fontSize: '18px', fontFamily: 'monospace' }}>
            {activeEpisode.title}
          </h3>
          <p style={{ color: '#8e9bae', fontSize: '13px', lineHeight: '1.5', marginBottom: '15px' }}>
            {activeEpisode.description}
          </p>

          <audio 
            controls 
            src={activeEpisode.audio_url} 
            style={{ width: '100%', accentColor: '#d4af37', borderRadius: '4px' }}
          />
        </div>
      )}

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// ARCHIVED EPISODES</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {episodes.map((ep) => (
            <div 
              key={ep.id} 
              onClick={() => setActiveEpisode(ep)}
              style={{
                padding: '12px',
                backgroundColor: activeEpisode?.id === ep.id ? 'rgba(0, 242, 254, 0.1)' : '#0a101d',
                border: activeEpisode?.id === ep.id ? '1px solid #00f2fe' : '1px solid #1e293b',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ color: '#d4af37', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {ep.title}
                </div>
                <div style={{ color: '#8e9bae', fontSize: '11px', marginTop: '4px' }}>
                  {new Date(ep.created_at).toLocaleDateString()}
                </div>
              </div>
              <span style={{ color: '#00f2fe', fontSize: '12px', fontFamily: 'monospace' }}>
                ▶ PLAY
              </span>
            </div>
          ))}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
