import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function FrequencyLive() {
  const router = useRouter();
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const toggleAlerts = async () => {
    setAlertsEnabled(!alertsEnabled);
    await supabase.from('transmission_logs').insert([{
      message: `EVENT ALERTS TOGGLED: ${!alertsEnabled ? 'ENABLED' : 'DISABLED'}`
    }]);
    alert(!alertsEnabled ? '🔔 EVENT ALERTS ACTIVATED FOR INAUGURAL SESSION' : '🔕 EVENT ALERTS MUTED');
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | FREQUENCY BROADCAST</title>
      </Head>

      <div className="dispatch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
          <div>
            <h1 className="header-title" style={{ margin: 0 }}>FREQUENCY</h1>
            <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>GENESIS BROADCAST GRID</span>
          </div>
        </div>
        <span style={{ padding: '3px 8px', backgroundColor: '#1e293b', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', borderRadius: '4px' }}>
          STANDBY
        </span>
      </div>

      {/* Broadcast Standby Card */}
      <div className="panel" style={{ marginTop: '15px', textAlign: 'center', border: '1px solid #1e293b', padding: '30px 20px' }}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>📡</div>
        <h2 style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace', margin: '0 0 6px 0' }}>
          AWAITING INAUGURAL BROADCAST
        </h2>
        <p style={{ color: '#8e9bae', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
          NO ACTIVE TRANSMISSION — STANDBY OPERATIVE
        </p>
      </div>

      {/* Upcoming Operations */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// UPCOMING OPERATIONS</h2>
        </div>
        <div style={{ padding: '14px', backgroundColor: '#0a101d', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#d4af37', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              SESSION 01 — MAIDEN DROP
            </div>
            <div style={{ color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginTop: '2px' }}>
              📍 LOCATION & DATE: CLASSIFIED — INTEL INCOMING
            </div>
          </div>
          <span style={{ border: '1px solid #d4af37', color: '#d4af37', padding: '3px 8px', fontSize: '9px', fontFamily: 'monospace', borderRadius: '4px' }}>
            PENDING
          </span>
        </div>
      </div>

      {/* Alert Notification Button */}
      <button 
        onClick={toggleAlerts}
        style={{
          width: '100%',
          marginTop: '15px',
          padding: '12px',
          backgroundColor: alertsEnabled ? '#00f2fe' : '#0a101d',
          border: '1px solid #00f2fe',
          color: alertsEnabled ? '#050811' : '#00f2fe',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
      >
        {alertsEnabled ? '🔔 EVENT ALERTS ENABLED' : '🔔 ENABLE EVENT ALERTS'}
      </button>

      {/* Past Transmissions */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// PAST TRANSMISSIONS</h2>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#0a101d', border: '1px dashed #1e293b', textAlign: 'center', color: '#8e9bae', fontSize: '11px', fontFamily: 'monospace' }}>
          NO PRIOR TRANSMISSIONS RECORDED
          <div style={{ fontSize: '9px', color: '#00f2fe', marginTop: '4px' }}>GENESIS PHASE ACTIVE</div>
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
