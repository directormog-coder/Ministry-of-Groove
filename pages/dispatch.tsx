import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

interface Message {
  id: string;
  sender: string;
  content: string;
  media_url?: string;
  created_at: string;
}

export default function DispatchWhatsApp() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    const timer = setTimeout(() => {
      setConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
    setConnected(true);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      sender: 'Director',
      content: inputText,
    };

    setInputText('');
    await supabase.from('messages').insert([newMessage]);
    fetchMessages();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#050811' }}>
      <Head>
        <title>M.O.G. — Dispatch</title>
      </Head>

      <div style={{ padding: '12px 16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/directorate')} style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '18px', cursor: 'pointer' }}>←</button>
          <div>
            <h1 style={{ fontSize: '15px', color: '#fff', margin: 0, fontFamily: 'monospace' }}>DISPATCH COMMAND</h1>
            <span style={{ fontSize: '11px', color: '#00f2fe', fontFamily: 'monospace' }}>
              {connected ? '● ONLINE // ENCRYPTED' : '⚡ ESTABLISHING UPLINK...'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '90px' }}>
        {messages.map((msg) => {
          const isMine = msg.sender === 'Director';
          return (
            <div key={msg.id || Math.random()} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: isMine ? '#0d2238' : '#0a101d', border: isMine ? '1px solid #00f2fe' : '1px solid #1e293b', borderRadius: '12px', padding: '10px 14px', color: '#fff' }}>
              <div style={{ fontSize: '10px', color: isMine ? '#d4af37' : '#00f2fe', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'monospace' }}>{msg.sender}</div>
              <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{msg.content}</div>
              <div style={{ textAlign: 'right', fontSize: '9px', color: '#8e9bae', marginTop: '4px' }}>✓✓</div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '10px 16px', backgroundColor: '#0a101d', borderTop: '1px solid #1e293b', display: 'flex', gap: '10px', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 950 }}>
        <input 
          type="text" 
          placeholder="Transmit message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '20px', color: '#fff', fontSize: '13px', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#d4af37', border: 'none', color: '#050811', width: '38px', height: '38px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer' }}>➤</button>
      </form>

      <AudioPlayer />
    </div>
  );
}
