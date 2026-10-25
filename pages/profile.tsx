import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Profile() {
  const [fullName, setFullName] = useState('POGISO JAN MOLOTO');
  const [handle, setHandle] = useState('@director_mog');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px' }}>
      <Head>
        <title>M.O.G. | USER PROFILE</title>
      </Head>

      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          USER PROFILE
        </div>
      </div>

      {/* Profile Card Container */}
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        
        {/* User Crest / Avatar Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 10px auto', borderRadius: '50%', overflow: 'hidden', border: '2px solid #d4af37' }}>
            <img src="/logo.png" alt="Profile Crest" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '1px' }}>THE CABINET MEMBER</div>
          <div style={{ fontSize: '9px', color: '#00f2fe', marginTop: '2px' }}>EST. 2026</div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#d4af37', marginBottom: '6px', letterSpacing: '1px' }}>
              FULL NAME
            </label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '4px', padding: '10px', color: '#ffffff', fontSize: '12px', fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#d4af37', marginBottom: '6px', letterSpacing: '1px' }}>
              HANDLE
            </label>
            <input 
              type="text" 
              value={handle} 
              onChange={(e) => setHandle(e.target.value)}
              style={{ width: '100%', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '4px', padding: '10px', color: '#ffffff', fontSize: '12px', fontFamily: 'monospace' }}
            />
          </div>

          {saved && (
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
              ✓ PROFILE UPDATED SUCCESSFULLY
            </div>
          )}

          <button 
            type="submit"
            style={{ backgroundColor: '#d4af37', border: 'none', color: '#050811', padding: '12px', fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace', borderRadius: '4px', cursor: 'pointer', letterSpacing: '1px', marginTop: '5px' }}
          >
            SAVE CHANGES
          </button>
        </form>

      </div>
    </div>
  );
}
