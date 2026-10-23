import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [artist, setArtist] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setName(data.name || user.email?.split('@')[0] || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setArtist(data.artist || '');
      } else {
        setName(user.email?.split('@')[0] || 'Operative');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const updates = {
        id: user.id,
        name,
        email,
        phone,
        bio,
        artist,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await supabase.from('transmission_logs').insert([{
        message: `OPERATIVE DOSSIER SAVED TO GRID: ${name} (${email})`
      }]);

      alert('✓ DOSSIER PERMANENTLY SAVED.');
      router.push('/directorate');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px', color: '#00f2fe', fontFamily: 'monospace' }}>
        LOADING SECURE DOSSIER...
      </div>
    );
  }

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
            disabled
            style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#8e9bae' }}
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
