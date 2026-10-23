import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AudioPlayer from '../components/AudioPlayer';

export default function ChannelsHub() {
  const router = useRouter();
  const [activeChannel, setActiveChannel] = useState('#general-chatter');

  const rooms = [
    { id: '#general-chatter', desc: 'Main community frequency' },
    { id: '#dj-lineups', desc: 'Track IDs and artist schedules' },
    { id: '#carpool-shuttles', desc: 'Ride sharing & transport coordination' },
    { id: '#vip-lounge', desc: 'Restricted high-tier operative room' },
  ];

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | TACTICAL CHANNELS</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">TACTICAL CHANNELS</h1>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// SELECT FREQUENCY ROOM</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rooms.map((r) => (
            <div 
              key={r.id}
              onClick={() => setActiveChannel(r.id)}
              style={{
                padding: '12px',
                backgroundColor: activeChannel === r.id ? 'rgba(0, 242, 254, 0.15)' : '#0a101d',
                border: activeChannel === r.id ? '1px solid #00f2fe' : '1px solid #1e293b',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ color: '#00f2fe', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px' }}>{r.id}</div>
                <div style={{ color: '#8e9bae', fontSize: '11px', marginTop: '2px' }}>{r.desc}</div>
              </div>
              <button 
                onClick={() => router.push('/dispatch')} 
                style={{ padding: '6px 12px', backgroundColor: '#0a101d', border: '1px solid #d4af37', color: '#d4af37', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer' }}
              >
                JOIN ROOM
              </button>
            </div>
          ))}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
