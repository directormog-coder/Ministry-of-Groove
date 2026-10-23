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
  status?: string;
  created_at: string;
}

export default function DispatchWhatsApp() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uplinkState, setUplinkState] = useState('ONLINE');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to live broadcast & database changes
    const channel = supabase
      .channel('public:dispatch_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender !== 'Director') {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Broadcast typing indicator to channel
    supabase.channel('public:dispatch_chat').send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender: 'Director' },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let mediaUrl = undefined;

    if (selectedFile) {
      setUploading(true);
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { data, error } = await supabase.storage.from('dispatch-assets').upload(fileName, selectedFile);
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('dispatch-assets').getPublicUrl(fileName);
        mediaUrl = publicUrlData.publicUrl;
      }
      setUploading(false);
      setSelectedFile(null);
      setPreviewImage(null);
    }

    const newMessage = {
      sender: 'Director',
      content: inputText,
      media_url: mediaUrl,
      status: 'read'
    };

    setInputText('');
    await supabase.from('messages').insert([newMessage]);
    scrollToBottom();
  };

  return (
    <div className="dispatch-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#050811' }}>
      <Head>
        <title>M.O.G. — Dispatch WhatsApp Studio</title>
      </Head>

      {/* WhatsApp Header */}
      <div className="dispatch-header" style={{
        padding: '12px 16px',
        backgroundColor: '#0a101d',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn" onClick={() => router.push('/directorate')} style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '18px', cursor: 'pointer' }}>←</button>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#050811' }}>
            MOG
          </div>
          <div>
            <h1 className="header-title" style={{ fontSize: '15px', color: '#fff', margin: 0 }}>DISPATCH COMMAND</h1>
            <span style={{ fontSize: '11px', color: '#00f2fe', fontFamily: 'monospace' }}>
              {isTyping ? '⚡ OPERATIVE IS TYPING...' : '● ONLINE // ENCRYPTED'}
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp Message Feed */}
      <div className="message-area" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        paddingBottom: '100px'
      }}>
        {messages.map((msg) => {
          const isMine = msg.sender === 'Director';
          return (
            <div 
              key={msg.id} 
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor: isMine ? '#0d2238' : '#0a101d',
                border: isMine ? '1px solid #00f2fe' : '1px solid #1e293b',
                borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                padding: '10px 14px',
                color: '#fff',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '10px', color: isMine ? '#d4af37' : '#00f2fe', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'monospace' }}>
                {msg.sender}
              </div>

              {msg.media_url && (
                <div style={{ marginBottom: '8px' }}>
                  <img 
                    src={msg.media_url} 
                    alt="Attachment" 
                    style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} 
                  />
                </div>
              )}

              <div style={{ fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                {msg.content}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
                marginTop: '4px',
                fontSize: '10px',
                color: '#8e9bae'
              }}>
                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isMine && <span style={{ color: '#00f2fe' }}>✓✓</span>}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Image Preview Banner */}
      {previewImage && (
        <div style={{ padding: '8px 16px', backgroundColor: '#0a101d', borderTop: '1px solid #00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src={previewImage} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
          <span style={{ color: '#00f2fe', fontSize: '11px', fontFamily: 'monospace' }}>ATTACHMENT READY</span>
          <button onClick={() => { setPreviewImage(null); setSelectedFile(null); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* WhatsApp Input Bar */}
      <form onSubmit={handleSendMessage} style={{
        padding: '10px 16px',
        backgroundColor: '#0a101d',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'fixed',
        bottom: '50px',
        left: 0,
        right: 0,
        zIndex: 950
      }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*,audio/*"
          style={{ display: 'none' }} 
          onChange={handleFileSelect} 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '20px', cursor: 'pointer' }}
        >
          📎
        </button>

        <input 
          type="text" 
          placeholder="Message Dispatch..." 
          value={inputText}
          onChange={handleInputChange}
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: '#050811',
            border: '1px solid #1e293b',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none'
          }}
        />

        <button 
          type="submit" 
          disabled={uploading}
          style={{
            backgroundColor: '#d4af37',
            border: 'none',
            color: '#050811',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {uploading ? '⏳' : '➤'}
        </button>
      </form>

      <AudioPlayer />
    </div>
  );
}
