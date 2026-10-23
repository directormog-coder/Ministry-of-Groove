import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

interface Message {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function Dispatch() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [uplinkState, setUplinkState] = useState('ESTABLISHING UPLINK');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time chat updates
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setUplinkState('ONLINE');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      setUplinkState('ONLINE');
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  };

  return (
    <div className="dispatch-container">
      <Head>
        <title>M.O.G. — Dispatch</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">DISPATCH</h1>
        <div className="status-indicator">
          <span className={`status-dot ${uplinkState === 'ONLINE' ? 'online' : 'connecting'}`}></span>
          <span className="status-text">{uplinkState}</span>
        </div>
      </div>

      <div className="message-area">
        {messages.length === 0 ? (
          <div className="uplink-loading">
            {uplinkState === 'ONLINE' ? 'NO TRANSMISSIONS YET' : 'ESTABLISHING UPLINK'}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`msg-bubble ${msg.sender === 'Director' ? 'mine' : 'theirs'}`}>
              <div className="msg-sender">{msg.sender}</div>
              <div className="msg-content">{msg.content}</div>
              <div className="msg-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="dispatch-input-bar" onSubmit={handleSendMessage}>
        <button type="button" className="attach-btn">📎</button>
        <input 
          type="text" 
          placeholder="TRANSMIT MESSAGE..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="send-btn">➤</button>
      </form>
    </div>
  );
}
