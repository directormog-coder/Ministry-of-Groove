import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { useChat } from '@/hooks/useChat';

export default function ChatPage() {
  const router = useRouter();
  const { id: conversationId } = router.query; // e.g., /chat?id=UUID
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recipientName, setRecipientName] = useState<string>("OPERATIVE");
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Auth and find Recipient Name
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setCurrentUser(session.user);

      // Fetch recipient's name from profiles if it's a DM
      if (conversationId) {
        const { data: participants } = await supabase
          .from('participants')
          .select('user_id, profiles(username)')
          .eq('conversation_id', conversationId)
          .neq('user_id', session.user.id)
          .single();
        
        if (participants?.profiles) {
          setRecipientName(participants.profiles.username || "UNKNOWN OPERATIVE");
        }
      }
    };
    getSession();
  }, [conversationId]);

  // 2. Use the Custom Hook we created
  const { messages, typingUsers, setTyping } = useChat(
    conversationId as string, 
    currentUser?.id
  );

  // 3. Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0 && conversationId && currentUser) {
      supabase.rpc('mark_all_as_read', { 
        target_conversation_id: conversationId, 
        current_user_id: currentUser.id 
      });
    }
  }, [messages]);

  // 4. Action: Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      content: newMessage,
      sender_id: currentUser.id
    });

    if (!error) {
      setNewMessage("");
      setTyping(false);
    }
  };

  if (!conversationId) return <div className="empty-state">INITIALIZING ENCRYPTED CHANNEL...</div>;

  return (
    <div className="chat-page-container">
      <Head>
        <title>M.O.G. | SECURE UPLINK: {recipientName}</title>
      </Head>

      <div className="circuit-grid"></div>
      
      {/* Top Status Bar */}
      <div className="top-bar">
        <button onClick={() => router.back()} className="back-btn">←</button>
        <div className="top-title">UPLINK: {recipientName.toUpperCase()}</div>
        <div className="dot dot-teal"></div>
      </div>

      <main className="chat-container" style={{ padding: '20px', paddingBottom: '100px' }}>
        <div className="messages-list">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className={`msg-bubble ${isMe ? 'msg-sent' : 'msg-received'}`}>
                <div className="msg-content">{msg.content}</div>
                <div className="msg-meta">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span className={`read-receipt ${msg.read_by?.length > 1 ? 'read' : 'unread'}`}>
                      {msg.read_by?.length > 1 ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Fixed Bottom Input Area */}
      <div className="chat-input-area" style={{ position: 'fixed', bottom: 0, width: '100%', padding: '16px', background: 'var(--black)' }}>
        {typingUsers.length > 0 && (
          <div className="typing-ghost">OPERATIVE IS TYPING...</div>
        )}
        
        <form onSubmit={handleSendMessage} className="chat-input-wrap">
          <input
            className="inp"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setTyping(true);
            }}
            placeholder="ENTER ENCRYPTED DATA..."
            autoComplete="off"
          />
          <button type="submit" className="btn btn-gold btn-sm">SEND</button>
        </form>
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

