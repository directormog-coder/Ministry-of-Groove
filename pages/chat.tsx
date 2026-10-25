import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'SYSTEM', text: 'Welcome to The Cabinet Chatroom.', time: '08:00' },
    { id: 2, sender: 'DIRECTOR_MOG', text: 'Ministry of Groove is officially live.', time: '08:05' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'POGISO', text: inputText, time: 'NOW' },
    ]);
    setInputText('');
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>M.O.G. | CHAT & MESSAGES</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          CHAT & MESSAGES
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '500px', width: '100%', margin: '0 auto', backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ flex: 1, minHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ backgroundColor: '#050811', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#d4af37', fontWeight: 'bold' }}>{msg.sender}</span>
                <span style={{ fontSize: '9px', color: '#64748b' }}>{msg.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#00f2fe' }}>{msg.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '4px', padding: '10px', color: '#ffffff', fontSize: '11px', fontFamily: 'monospace' }}
          />
          <button
            type="submit"
            style={{ backgroundColor: '#d4af37', border: 'none', color: '#050811', padding: '10px 16px', fontWeight: 'bold', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
