import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteArtist, setFavoriteArtist] = useState('');
  const [rank, setRank] = useState('RECRUIT');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
      setFavoriteArtist(data.favorite_artist || '');
      setRank(data.rank || 'RECRUIT');
    } else {
      // Initialize default if not found
      setName(user.email?.split('@')[0] || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated operative found.');

      const updates = {
        id: user.id,
        name,
        email: user.email,
        phone,
        bio,
        favorite_artist: favoriteArtist,
        updated_at: new Date()
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await supabase.from('transmission_logs').insert([{
        message: `DOSSIER UPDATED: Operative alias saved as "${name}"`
      }]);

      alert('✓ DOSSIER SAVED & SYNCHRONIZED SUCCESSFULLY!');
      setIsEditing(false);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px', backgroundColor: '#050811', minHeight: '100vh', color: '#fff' }}>
      <Head>
        <title>M.O.G. | OPERATIVE DOSSIER</title>
      </Head>

      {/* Header */}
      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '15px', color: '#d4af37', margin: 0, fontFamily: 'monospace' }}>OPERATIVE DOSSIER</h1>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid #00f2fe', color: '#00f2fe', padding: '4px 8px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          ← HUB
        </button>
      </div>

      {!isEditing ? (
        /* Profile View Card */
        <div className="panel" style={{ margin: '16px', border: '1px solid #00f2fe', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0a101d', border: '2px solid #d4af37', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            🪖
          </div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontFamily: 'monospace', margin: '4px 0' }}>{name || 'OPERATIVE'}</h2>
          <div style={{ color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', marginBottom: '8px' }}>{email}</div>
          <div style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: '#0d2238', border: '1px solid #00f2fe', color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace', borderRadius: '4px', marginBottom: '16px' }}>
            GROOVE DIVISION // {rank}
          </div>

          {bio && <div style={{ color: '#8e9bae', fontSize: '12px', fontFamily: 'monospace', marginBottom: '16px', fontStyle: 'italic' }}>"{bio}"</div>}
          {favoriteArtist && <div style={{ color: '#d4af37', fontSize: '11px', fontFamily: 'monospace', marginBottom: '20px' }}>🎵 FAVOURITE ARTIST: {favoriteArtist}</div>}

          <button 
            onClick={() => setIsEditing(true)}
            style={{ width: '100%', padding: '12px', backgroundColor: '#00f2fe', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', marginBottom: '10px' }}
          >
            ✏️ EDIT OPERATIVE FILE
          </button>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}
          >
            → TERMINATE SESSION
          </button>
        </div>
      ) : (
        /* Edit Dossier Form */
        <form onSubmit={handleSave} className="panel" style={{ margin: '16px', border: '1px solid #d4af37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ color: '#d4af37', fontSize: '14px', fontFamily: 'monospace', margin: 0 }}>// EDIT DOSSIER</h2>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#8e9bae', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer' }}>✕ CLOSE</button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>OPERATIVE NAME *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', fontSize: '13px', fontFamily: 'monospace', borderRadius: '4px' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>PHONE NUMBER (OPTIONAL)</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0813874921" style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', fontSize: '13px', fontFamily: 'monospace', borderRadius: '4px' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>BIO / STATUS (OPTIONAL)</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Amapiano lover" style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', fontSize: '13px', fontFamily: 'monospace', borderRadius: '4px' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>FAVOURITE ARTIST (OPTIONAL)</label>
            <input type="text" value={favoriteArtist} onChange={(e) => setFavoriteArtist(e.target.value)} placeholder="Kabza De Small" style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', fontSize: '13px', fontFamily: 'monospace', borderRadius: '4px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '12px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#8e9bae', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}>
              CANCEL
            </button>
            <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#00f2fe', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}>
              {loading ? 'SAVING...' : '✓ SAVE'}
            </button>
          </div>
        </form>
      )}

      <AudioPlayer />
    </div>
  );
}
