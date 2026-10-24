import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function DispatchHub() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setMessages(data);
    } else {
      setMessages([
        { id: '1', sender: 'DIRECTORATE', content: 'Secure uplink active. Transmit intelligence.' }
      ]);
    }
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    const senderName = user?.email ? user.email.split('@')[0].toUpperCase() : 'OPERATIVE';

    const newMsg = { sender: senderName, content: inputText };
    const { error } = await supabase.from('messages').insert([newMsg]);

    if (!error) {
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
    }
  };

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | DISPATCH</title>
      </Head>

      <div style={{ padding: '16px', backgroundColor: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '14px' }}>← BACK</button>
        <h1 style={{ fontSize: '14px', color: '#d4af37', margin: 0 }}>DISPATCH UPLINK</h1>
        <span style={{ fontSize: '10px', color: '#00f2fe' }}>● ONLINE</span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e9bae', marginTop: '40px' }}>ESTABLISHING UPLINK...</div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id || index} style={{ backgroundColor: '#0a101d', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: '#00f2fe', marginBottom: '4px' }}>{msg.sender || 'OPERATIVE'}</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>{msg.content}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} style={{ position: 'fixed', bottom: '60px', left: 0, right: 0, padding: '10px 16px', backgroundColor: '#0a101d', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
        <input 
          type="text" 
          value={inputText} 
          onChange={e => setInputText(e.target.value)} 
          placeholder="TRANSMIT MESSAGE..." 
          style={{ flex: 1, backgroundColor: '#050811', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }} 
        />
        <button type="submit" style={{ backgroundColor: '#d4af37', border: 'none', color: '#050811', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>TRANSMIT</button>
      </form>

      <AudioPlayer />
    </div>
  );
}
