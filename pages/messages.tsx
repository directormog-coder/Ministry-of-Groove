import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function MessagesHub() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch conversations where the user is a participant
    const { data, error } = await supabase
      .from('participants')
      .select(`
        conversation_id,
        conversations (
          id,
          type,
          messages ( content, created_at )
        )
      `)
      .eq('user_id', user.id);

    if (data) {
      // Map data to get the "other" participant's name for each chat
      const formattedChats = await Promise.all(data.map(async (item: any) => {
        const { data: otherPart } = await supabase
          .from('participants')
          .select('profiles(username)')
          .eq('conversation_id', item.conversation_id)
          .neq('user_id', user.id)
          .single();
        
        return {
          id: item.conversation_id,
          name: otherPart?.profiles?.username || "Unknown Operative",
          lastMsg: item.conversations.messages[0]?.content || "No transmissions yet..."
        };
      }));
      setChats(formattedChats);
    }
    setLoading(false);
  };

  return (
    <div className="hub-container">
      <Head><title>M.O.G. | SECURE CHANNELS</title></Head>
      <div className="circuit-grid"></div>
      
      <div className="top-bar">
        <div className="top-title">ENCRYPTED CHANNELS</div>
      </div>

      <main style={{ padding: '20px' }}>
        <div className="section-hdr">
          <h2>ACTIVE UPLINKS</h2>
          <div className="line"></div>
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: '40px auto' }}></div>
        ) : chats.length === 0 ? (
          <div className="empty-state">NO ACTIVE TRANSMISSIONS FOUND.</div>
        ) : (
          <div className="chat-list" style={{ display: 'grid', gap: '12px' }}>
            {chats.map(chat => (
              <Link href={`/chat?id=${chat.id}`} key={chat.id} style={{ textDecoration: 'none' }}>
                <div className="hero-card" style={{ cursor: 'pointer' }}>
                  <div className="presence-indicator">
                    <div className="hero-avatar">
                      <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${chat.name}`} alt="avatar" />
                    </div>
                    <div className="dot dot-teal"></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-cyber" style={{ color: 'var(--gold)', fontSize: '12px' }}>{chat.name.toUpperCase()}</div>
                    <div className="font-mono" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{chat.lastMsg}</div>
                  </div>
                  <div className="rank-tag rank-operative">OPEN</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <div className="scanlines"></div>
    </div>
  );
}
