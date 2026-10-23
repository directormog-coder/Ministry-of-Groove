import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LineupSubmission() {
  const router = useRouter();
  const [djName, setDjName] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!djName || !trackTitle || !streamUrl) return;

    await supabase.from('transmission_logs').insert([{
      message: `NEW SUBMISSION: ${djName} - ${trackTitle} (${streamUrl})`
    }]);

    setSubmitted(true);
  };

  return (
    <div className="container">
      <Head>
        <title>M.O.G. | LINEUP SUBMISSIONS</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">LINEUP DEMO DROP</h1>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// SUBMIT MIXTAPE FOR BROADCAST</h2>
        </div>

        {submitted ? (
          <div style={{ color: '#00f2fe', textAlign: 'center', padding: '20px', fontFamily: 'monospace' }}>
            ✓ TRANSMISSION RECEIVED. DIRECTORATE IS REVIEWING YOUR SPECTRUM.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', color: '#8e9bae', fontSize: '12px' }}>OPERATIVE / DJ ALIAS</label>
              <input 
                type="text" 
                placeholder="e.g. DJ MOG" 
                value={djName}
                onChange={(e) => setDjName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#8e9bae', fontSize: '12px' }}>TRACK / SET TITLE</label>
              <input 
                type="text" 
                placeholder="e.g. Midnight Amapiano Session Vol. 1" 
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#8e9bae', fontSize: '12px' }}>STREAM / DEMO URL (SOUNDCLOUD / DRIVE / MIXCLOUD)</label>
              <input 
                type="url" 
                placeholder="https://..." 
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
              />
            </div>

            <button type="submit" className="card-btn cyan" style={{ padding: '12px', marginTop: '10px' }}>
              TRANSMIT DEMO TO DIRECTORATE
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
