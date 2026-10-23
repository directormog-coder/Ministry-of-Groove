import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('PGMOLOTO9098');
  const [email, setEmail] = useState('pgmoloto9098@gmail.com');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('Amapiano lover · Emalahleni · Est. 2026');
  const [artist, setArtist] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Log profile update action to Supabase transmission logs
      await supabase.from('transmission_logs').insert([{
        message: `OPERATIVE DOSSIER UPDATED: ${name} (${email})`
      }]);

      alert('✓ DOSSIER SAVED SUCCESSFULLY.');
      router.push('/directorate');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | EDIT DOSSIER</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">EDIT DOSSIER</h1>
      </div>

      <form onSubmit={handleSave} className="panel" style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
            OPERATIVE NAME *
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
            EMAIL ADDRESS *
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
            PHONE NUMBER (OPTIONAL)
          </label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+27 81 000 0000"
            style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
            BIO / STATUS (OPTIONAL)
          </label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '6px' }}>
            FAVOURITE ARTIST (OPTIONAL)
          </label>
          <input 
            type="text" 
            value={artist} 
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Kabza De Small"
            style={{ width: '100%', padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => router.push('/directorate')}
            style={{ flex: 1, padding: '12px', backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' }}
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            disabled={saving}
            style={{ flex: 1, padding: '12px', backgroundColor: '#00f2fe', border: 'none', color: '#050811', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {saving ? 'SAVING...' : '✓ SAVE'}
          </button>
        </div>
      </form>

      <AudioPlayer />
    </div>
  );
}
