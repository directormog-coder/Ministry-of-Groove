import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

interface LiveMessage {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function LiveStudio() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);
  const [usePhoneCam, setUsePhoneCam] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [listenerCount, setListenerCount] = useState(142);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLiveChat();

    const channel = supabase
      .channel('public:live_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as LiveMessage]);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveChat = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(20);
    if (data) setMessages(data);
  };

  const startPhoneBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUsePhoneCam(true);
      setIsLive(true);

      const alertMessage = '🔴 DIRECTOR HAS STARTED A LIVE PHONE CAMERA BROADCAST!';
      await supabase.from('transmission_logs').insert([{ message: alertMessage }]);
      await supabase.from('messages').insert([{
        sender: 'SYSTEM // BROADCAST',
        content: alertMessage
      }]);
    } catch (err) {
      alert('Camera/Microphone permission denied or unavailable.');
    }
  };

  const stopPhoneBroadcast = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setUsePhoneCam(false);
    setIsLive(false);

    const alertMessage = '⏹ LIVE PHONE BROADCAST CONCLUDED.';
    await supabase.from('transmission_logs').insert([{ message: alertMessage }]);
    await supabase.from('messages').insert([{
      sender: 'SYSTEM // BROADCAST',
      content: alertMessage
    }]);
  };

  const sendLiveChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    await supabase.from('messages').insert([{
      sender: 'Director',
      content: chatInput
    }]);
    setChatInput('');
  };

  return (
    <div className="container" style={{ paddingBottom: '30px' }}>
      <Head>
        <title>M.O.G. | LIVE BROADCAST STUDIO</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">LIVE BROADCAST STUDIO</h1>
        <div className="status-indicator">
          <span className={`status-dot ${isLive ? 'online' : 'offline'}`} style={{ backgroundColor: isLive ? '#ef4444' : '#64748b' }}></span>
          <span className="status-text" style={{ color: isLive ? '#ef4444' : '#64748b' }}>
            {isLive ? '● ON AIR' : '○ STANDBY'}
          </span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', border: isLive ? '1px solid #ef4444' : '1px solid #1e293b' }}>
        <div className="panel-hdr">
          <h2 style={{ color: isLive ? '#ef4444' : '#00f2fe' }}>// LIVE TRANSMISSION FEED</h2>
          <span style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '12px' }}>
            👥 OPERATIVES TUNED IN: {isLive ? listenerCount : 0}
          </span>
        </div>

        <div className="stream-player-box" style={{ padding: '10px', backgroundColor: '#050811', textAlign: 'center', marginBottom: '15px' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{
              width: '100%',
              maxHeight: '280px',
              backgroundColor: '#000',
              border: usePhoneCam ? '1px solid #ef4444' : '1px solid #1e293b',
              objectFit: 'cover'
            }}
          />
          {!usePhoneCam && (
            <p style={{ color: '#8e9bae', fontSize: '12px', marginTop: '8px', fontFamily: 'monospace' }}>
              CAMERA OFFLINE // TAP BELOW TO TRANSMIT FROM PHONE
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {!isLive ? (
            <button 
              onClick={startPhoneBroadcast}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#ef4444',
                border: 'none',
                color: '#fff',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              📹 START PHONE CAMERA / MIC BROADCAST
            </button>
          ) : (
            <button 
              onClick={stopPhoneBroadcast}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#0a101d',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              ⏹ STOP BROADCAST & DISCONNECT PHONE
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// LIVE FEED CHAT & CHATTER</h2>
        </div>

        <div style={{ height: '200px', overflowY: 'auto', backgroundColor: '#050811', padding: '10px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              <span style={{ color: msg.sender === 'Director' ? '#d4af37' : '#00f2fe', fontWeight: 'bold' }}>
                [{msg.sender}]:
              </span>{' '}
              <span style={{ color: '#e2e8f0' }}>{msg.content}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendLiveChat} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="TRANSMIT TO LIVE FEED..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={{ flex: 1, padding: '10px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontFamily: 'monospace' }}
          />
          <button type="submit" className="card-btn gold" style={{ padding: '10px 16px' }}>
            TRANSMIT
          </button>
        </form>
      </div>
    </div>
  );
}
