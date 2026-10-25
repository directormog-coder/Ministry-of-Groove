import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('POGISO_JAN_MOLOTO');
  const [handle, setHandle] = useState('@director_mog');

  const handleSave = () => {
    alert('PROFILE SAVED & SYNCHRONIZED SUCCESSFULLY!');
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '20px' }}>
      <Head><title>M.O.G. | USER PROFILE</title></Head>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '14px' }}>← HOME</button>
        <h1 style={{ fontSize: '14px', color: '#d4af37', margin: 0 }}>USER PROFILE</h1>
        <span></span>
      </div>

      <div style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '13px', color: '#d4af37', marginTop: 0 }}>EDIT PROFILE</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>FULL NAME</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', color: '#8e9bae', display: 'block', marginBottom: '4px' }}>HANDLE</label>
          <input 
            type="text" 
            value={handle} 
            onChange={(e) => setHandle(e.target.value)} 
            style={{ width: '100%', padding: '10px', backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          onClick={handleSave}
          style={{ width: '100%', backgroundColor: '#00f2fe', border: 'none', color: '#050811', padding: '12px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
        >
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
