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
  const [streamUrl, setStreamUrl] = useState('https://stream.zeno.fm/f3wvbb1428uvv');
  const [inputUrl, setInputUrl] = useState('');
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [listenerCount, setListenerCount] = useState(142);
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

  const toggleLiveState = async () => {
    const newState = !isLive;
    setIsLive(newState);

    const alertMessage = newState
      ? '🔴 DIRECTORATE HAS GONE LIVE! SYNCING BROADCAST STREAM.'
      : '⏹ LIVE TRANSMISSION CONCLUDED BY DIRECTORATE.';

    await supabase.from('transmission_logs').insert([{ message: alertMessage }]);
    await supabase.from('messages').insert([{
      sender: 'SYSTEM // BROADCAST',
      content: alertMessage
    }]);
  };

  const updateStreamSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setStreamUrl(inputUrl);
      setInputUrl('');
    }
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
          <h2 style={{ color: isLive ? '#ef4444' : '#00f2fe' }}>// MAIN FEED FEEDBACK</h2>
          <span style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '12px' }}>
            👥 OPERATIVES TUNED IN: {isLive ? listenerCount : 0}
          </span>
        </div>

        <div className="stream-player-box" style={{ padding: '20px', backgroundColor: '#050811', textAlign: 'center', marginBottom: '15px' }}>
          {streamUrl.includes('youtube') || streamUrl.includes('embed') ? (
            <iframe 
              src={streamUrl} 
              style={{ width: '100%', height: '220px', border: 'none' }}
              allow="autoplay; encrypted-media" 
              allowFullScreen
            />
          ) : (
            <div style={{ padding: '20px 0' }}>
              <div style={{ fontSize: '14px', color: '#d4af37', fontFamily: 'monospace', marginBottom: '10px' }}>
                AUDIO STREAM SOURCE: {streamUrl}
              </div>
              <audio controls src={streamUrl} style={{ width: '100%', accentColor: '#d4af37' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={toggleLiveState}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: isLive ? '#ef4444' : '#0a101d',
              border: isLive ? '1px solid #ef4444' : '1px solid #00f2fe',
              color: isLive ? '#fff' : '#00f2fe',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isLive ? '⏹ TERMINATE LIVE TRANSMISSION' : '📡 START BROADCAST & ALERT OPERATIVES'}
          </button>
        </div>

        <form onSubmit={updateStreamSource} style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
          <input 
            type="url" 
            placeholder="PASTE CUSTOM HLS / YOUTUBE EMBED URL..." 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          />
          <button type="submit" className="btn-sm" style={{ padding: '8px 12px' }}>
            UPDATE SOURCE
          </button>
        </form>
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
