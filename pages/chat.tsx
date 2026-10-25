import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useChat } from '../hooks/useChat';

export default function Chat() {
  // Using a default conversation and user ID for the main community cabinet room
  const conversationId = 'cabinet-main';
  const userId = 'pogiso-' + Math.floor(Math.random() * 1000);

  const { messages, typingUsers, onlineUsers, setTyping } = useChat(conversationId, userId);
  const [inputText, setInputText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      // Import client dynamically or use standard fetch/supabase insert
      const { supabase } = await import('../lib/supabaseClient');
      await supabase.from('messages').insert([
        {
          conversation_id: conversationId,
          user_id: userId,
          content: inputText,
        },
      ]);
      setInputText('');
      setTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#ffffff', fontFamily: 'monospace', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>M.O.G. | LIVE CHAT</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          ← HOME
        </Link>
        <div style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' }}>
          THE CABINET LIVE CHAT
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '550px', width: '100%', margin: '0 auto', backgroundColor: '#0a101d', border: '1px solid #d4af37', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        
        {/* Room Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
          <span>ONLINE: {Object.keys(onlineUsers).length || 1} MEMBER(S)</span>
          <span>ROOM: {conversationId}</span>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, minHeight: '320px', maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '10px', marginTop: '40px' }}>
              No messages yet. Start the conversation below.
            </div>
          ) : (
            messages.map((msg: any, idx: number) => {
              const isMe = msg.user_id === userId;
              return (
                <div key={msg.id || idx} style={{ backgroundColor: '#050811', border: isMe ? '1px solid #d4af37' : '1px solid #1e293b', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: isMe ? '#d4af37' : '#00f2fe', fontWeight: 'bold' }}>
                      {msg.user_id || 'MEMBER'} {isMe && '(YOU)'}
                    </span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>
                      {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#ffffff', wordBreak: 'break-word' }}>
                    {msg.content || msg.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div style={{ fontSize: '9px', color: '#d4af37', fontStyle: 'italic' }}>
            Someone is typing...
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <input
            type="text"
            placeholder="Type your message to the cabinet..."
            value={inputText}
            onChange={handleInputChange}
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
