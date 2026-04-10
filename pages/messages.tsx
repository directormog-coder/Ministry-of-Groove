import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function MessagesHub() {
  const [chats, setChats] = useState<any[]>([]);
  const [operatives, setOperatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Active Chats
    const { data: partData } = await supabase
      .from('participants')
      .select(`conversation_id, conversations(id, type, messages(content, created_at))`)
      .eq('user_id', user.id);

    if (partData) {
      const formatted = await Promise.all(partData.map(async (item: any) => {
        const { data: other } = await supabase
          .from('participants')
          .select('profiles(username)')
          .eq('conversation_id', item.conversation_id)
          .neq('user_id', user.id)
          .single();
        
        return {
          id: item.conversation_id,
          name: other?.profiles?.username || "Unknown",
          lastMsg: item.conversations.messages[0]?.content || "No transmissions..."
        };
      }));
      setChats(formatted);
    }

    // 2. Fetch Potential Operatives (Directory Quick-Bar)
    const { data: opData } = await supabase.from('profiles').select('id, username').neq('id', user.id).limit(5);
    setOperatives(opData || []);
    
    setLoading(false);
  };

  return (
    <div className="hub-container">
      <Head><title>M.O.G. | SECURE CHANNELS</title></Head>
      <div className="circuit-grid"></div>
      <div className="top-bar"><div class="top-title">ENCRYPTED CHANNELS</div></div>

      <main style={{ padding: '20px' }}>
        <div className="section-hdr"><h2>QUICK UPLINK</h2><div class="line"></div></div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '15px' }}>
          {operatives.map(op => (
            <button key={op.id} className="btn btn-sm btn-teal" onClick={() => (window as any).MOGApp.establishUplink(op.id)}>
              + {op.username}
            </button>
          ))}
          <Link href="/directory" className="btn btn-sm">VIEW ALL</Link>
        </div>

        <div className="section-hdr"><h2>ACTIVE UPLINKS</h2><div class="line"></div></div>
        {loading ? <div className="spinner"></div> : chats.map(chat => (
          <Link href={`/chat?id=${chat.id}`} key={chat.id} style={{ textDecoration: 'none' }}>
            <div className="hero-card" style={{ marginBottom: '10px' }}>
              <div className="hero-avatar"><img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${chat.name}`} /></div>
              <div style={{ flex: 1 }}>
                <div className="font-cyber" style={{ color: 'var(--gold)' }}>{chat.name.toUpperCase()}</div>
                <div className="font-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{chat.lastMsg}</div>
              </div>
            </div>
          </Link>
        ))}
      </main>
      <div className="scanlines"></div>
    </div>
  );
}
