import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'POGISO_JAN_MOLOTO',
    email: '',
    phone: '',
    bio: '',
    favorite_artist: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // If not logged in, use local state or default test user
      setUser({ id: 'local-test-user', email: 'pgmoloto9098@gmail.com' });
      return;
    }

    const currentUser = session.user;
    setUser(currentUser);

    // Fetch from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (data) {
      setFormData({
        name: data.name || currentUser.email?.split('@')[0].toUpperCase() || 'OPERATIVE',
        email: data.email || currentUser.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        favorite_artist: data.favorite_artist || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        name: currentUser.email?.split('@')[0].toUpperCase() || 'OPERATIVE'
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userId = user?.id || 'local-test-user';

    const profilePayload = {
      id: userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      favorite_artist: formData.favorite_artist,
      updated_at: new Date()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profilePayload);

    if (error) {
      console.error('Error saving profile:', error.message);
      alert('Error saving dossier: ' + error.message);
    } else {
      alert('✓ DOSSIER SAVED & SYNCHRONIZED SUCCESSFULLY!');
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | OPERATIVE DOSSIER</title>
      </Head>

      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '14px' }}>← HUB</button>
        <h1 style={{ fontSize: '14px', color: '#d4af37', margin: 0 }}>OPERATIVE DOSSIER</h1>
        <span style={{ fontSize: '10px', color: '#00f2fe' }}>● ACTIVE</span>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {!isEditing ? (
          <div style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #d4af37', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#d4af37', backgroundColor: '#050811' }}>
              👤
            </div>
            
            <h2 style={{ fontSize: '18px', color: '#fff', margin: '0 0 4px 0', letterSpacing: '1px' }}>{formData.name}</h2>
            <div style={{ fontSize: '12px', color: '#00f2fe', marginBottom: '16px' }}>{formData.email}</div>
            
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#050811', border: '1px solid #d4af37', borderRadius: '4px', fontSize: '11px', color: '#d4af37', marginBottom: '20px' }}>
              GROOVE DIVISION // RECRUIT
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px', backgroundColor: '#050811', padding: '12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#8e9bae' }}>SESSIONS</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>2</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#8e9bae' }}>LIKES</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>0</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#8e9bae' }}>LOYALTY</div>
                <div style={{ fontSize: '16px', color: '#d4af37', fontWeight: 'bold' }}>100%</div>
              </div>
            </div>

            {formData.bio && (
              <div style={{ textAlign: 'left', marginBottom: '16px', padding: '10px', backgroundColor: '#050811', borderRadius: '4px', border: '1px solid #1e293b', fontSize: '12px' }}>
                <span style={{ color: '#8e9bae', display: 'block', fontSize: '10px', marginBottom: '2px' }}>BIO / STATUS:</span>
                {formData.bio}
              </div>
            )}

            {formData.favorite_artist && (
              <div style={{ textAlign: 'left', marginBottom: '20px', padding: '10px', backgroundColor: '#050811', borderRadius: '4px', border: '1px solid #1e293b', fontSize: '12px' }}>
                <span style={{ color: '#8e9bae', display: 'block', fontSize: '10px', marginBottom: '2px' }}>FAVORITE ARTIST:</span>
                {formData.favorite_artist}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ backgroundColor: '#00f2fe', border: 'none', color: '#050811', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                ✏️ EDIT OPERATIVE FILE
              </button>
              <button 
                onClick={handleSignOut} 
                style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                TERMINATE SESSION
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '13px', color: '#d4af37', margin: 0 }}>// EDIT DOSSIER</h3>
              <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#8e9bae', cursor: 'pointer', fontSize: '12px' }}>✕ CLOSE</button>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>OPERATIVE NAME *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }} 
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={formData.email} 
                disabled 
                style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#8e9bae', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>PHONE NUMBER (OPTIONAL)</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>BIO / STATUS (OPTIONAL)</label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                rows={3}
                style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>FAVORITE ARTIST (OPTIONAL)</label>
              <input 
                type="text" 
                value={formData.favorite_artist} 
                onChange={e => setFormData({ ...formData, favorite_artist: e.target.value })} 
                style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#8e9bae', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ flex: 1, backgroundColor: '#00f2fe', border: 'none', color: '#050811', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                {loading ? 'SAVING...' : '✓ SAVE'}
              </button>
            </div>
          </form>
        )}
      </div>

      <AudioPlayer />
    </div>
  );
}
