import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function DirectorateBroadcastControl() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'broadcast'>('broadcast');
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // WebRTC Camera Video Ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchLogs();

    // Subscribe to real-time logs
    const channel = supabase
      .channel('public:transmission_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transmission_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      stopCamera();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('transmission_logs').select('*').order('created_at', { ascending: false }).limit(6);
    if (data) setLogs(data);
  };

  // Start Mobile Camera Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLive(true);
      setViewerCount(Math.floor(12 + Math.random() * 45));

      await supabase.from('transmission_logs').insert([{
        message: '🔴 DIRECTORATE HAS GONE LIVE ON MOG_PRIME_STREAM'
      }]);
      alert('✓ BROADCAST ACTIVE — CAMERA & MIC ONLINE');
    } catch (err: any) {
      alert('Camera access failed or denied: ' + err.message);
    }
  };

  // Stop Mobile Camera Stream
  const stopCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
    setViewerCount(0);

    await supabase.from('transmission_logs').insert([{
      message: '⬛ BROADCAST TERMINATED — STANDBY MODE ACTIVATED'
    }]);
  };

  // Quick Push Alert
  const handleQuickPushAlert = async () => {
    const msg = prompt('ENTER QUICK PUSH ALERT MESSAGE TO OPERATIVES:');
    if (!msg) return;

    await supabase.from('transmission_logs').insert([{
      message: `🚨 QUICK PUSH ALERT: ${msg}`
    }]);
    alert('✓ PUSH ALERT TRANSMITTED TO NETWORK');
  };

  // Protocol Zero Trigger
  const handleProtocolZero = async () => {
    if (confirm('⚠️ WARNING: INITIATE PROTOCOL ZERO EMERGENCY SHUTDOWN?')) {
      await stopCamera();
      await supabase.from('transmission_logs').insert([{
        message: '⚡ PROTOCOL ZERO EXECUTED BY DIRECTORATE — ALL STREAMS PURGED'
      }]);
      alert('⚡ PROTOCOL ZERO EXECUTED: Network reset to zero state.');
    }
  };

  // Schedule Session
  const handleScheduleSession = async () => {
    const title = prompt('ENTER SESSION TITLE:', 'AMAPIANO SESSIONS VOL.1');
    if (!title) return;

    const eventDate = prompt('ENTER EVENT DATE:', '2026-11-15');
    
    await supabase.from('events').insert([{
      title,
      event_date: eventDate || 'TBA',
      doors_open: '18:00',
      public_location: 'EMALAHLENI // CLASSIFIED',
      general_price: 150,
      vip_price: 350
    }]);

    await supabase.from('transmission_logs').insert([{
      message: `📅 SESSION SCHEDULED: ${title} (${eventDate})`
    }]);

    fetchEvents();
    alert(`✓ SESSION SCHEDULED: ${title}`);
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (confirm(`Remove event "${title}"?`)) {
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | DIRECTORATE BROADCAST COMMAND</title>
      </Head>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '15px', color: '#d4af37', fontFamily: 'monospace', margin: 0 }}>DIRECTORATE COMMAND</h1>
          <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>UPLINK: SECURE // {new Date().toLocaleTimeString()}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ border: '1px solid #d4af37', color: '#d4af37', padding: '3px 8px', fontSize: '10px', fontFamily: 'monospace', borderRadius: '4px' }}>👑 DIRECTOR</span>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '3px 8px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>→ EXIT</button>
        </div>
      </div>

      {/* Top Nav Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '15px' }}>
        <button onClick={() => router.push('/directorate')} style={{ padding: '8px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#8e9bae', cursor: 'pointer' }}>📊 OVERVIEW</button>
        <button onClick={() => router.push('/directorate')} style={{ padding: '8px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#8e9bae', cursor: 'pointer' }}>↑ UPLOAD CENTRE</button>
        <button style={{ padding: '8px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: '#0d2238', border: '1px solid #00f2fe', color: '#00f2fe', fontWeight: 'bold', cursor: 'pointer' }}>📡 BROADCAST</button>
      </div>

      {/* Live Broadcast Monitor */}
      <div className="panel" style={{ border: isLive ? '2px solid #ef4444' : '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>// LIVE BROADCAST CONTROL</span>
          <span style={{ color: isLive ? '#ef4444' : '#00f2fe', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {isLive ? `● BROADCASTING LIVE (${viewerCount} WATCHING)` : '● STANDBY'}
          </span>
        </div>

        {/* Video Monitor Box */}
        <div style={{ width: '100%', height: '200px', backgroundColor: '#000', borderRadius: '4px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
          {isLive ? (
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#8e9bae', fontFamily: 'monospace' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>📡</div>
              <div style={{ fontSize: '11px', color: '#00f2fe' }}>FEED: MOG_PRIME_STREAM</div>
              <div style={{ fontSize: '9px', color: '#8e9bae', marginTop: '2px' }}>CAMERA STANDBY</div>
            </div>
          )}
        </div>

        {/* Control Grid Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={isLive ? stopCamera : startCamera}
            style={{ padding: '12px', backgroundColor: isLive ? '#ef4444' : '#0a101d', border: '1px solid #ef4444', color: isLive ? '#fff' : '#ef4444', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
          >
            {isLive ? '⬛ END BROADCAST' : '📡 GO LIVE'}
          </button>
          <button 
            onClick={handleQuickPushAlert}
            style={{ padding: '12px', backgroundColor: '#d4af37', border: 'none', color: '#050811', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
          >
            📣 QUICK PUSH ALERT
          </button>
          <button 
            onClick={handleProtocolZero}
            style={{ padding: '12px', backgroundColor: '#0a101d', border: '1px solid #ef4444', color: '#ef4444', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
          >
            ⚡ PROTOCOL ZERO
          </button>
          <button 
            onClick={handleScheduleSession}
            style={{ padding: '12px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', color: '#00f2fe', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
          >
            📅 SCHEDULE SESSION
          </button>
        </div>
      </div>

      {/* Manage Events Table */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '12px', color: '#00f2fe', fontFamily: 'monospace', margin: 0 }}>// MANAGE EVENTS</h2>
          <button onClick={handleScheduleSession} style={{ padding: '4px 8px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer' }}>
            + NEW EVENT
          </button>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: '15px', textAlign: 'center', color: '#8e9bae', fontSize: '11px', fontFamily: 'monospace', backgroundColor: '#0a101d', border: '1px solid #1e293b' }}>
            NO SCHEDULED EVENTS (OFFLINE)
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{ev.title}</div>
                  <div style={{ color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace' }}>📅 {ev.event_date} · R{ev.general_price}</div>
                </div>
                <button onClick={() => handleDeleteEvent(ev.id, ev.title)} style={{ backgroundColor: '#050811', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 8px', fontSize: '9px', fontFamily: 'monospace', cursor: 'pointer' }}>
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transmission Logs */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '12px', color: '#d4af37', fontFamily: 'monospace', margin: 0 }}>// TRANSMISSION LOGS</h2>
          <button onClick={fetchLogs} style={{ background: 'none', border: '1px solid #1e293b', color: '#00f2fe', padding: '2px 6px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer' }}>
            🔄 REFRESH
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map((log) => (
            <div key={log.id || Math.random()} style={{ fontSize: '10px', fontFamily: 'monospace', color: '#8e9bae', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
              <span style={{ color: '#00f2fe' }}>[{new Date(log.created_at || Date.now()).toLocaleTimeString()}]:</span> {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
