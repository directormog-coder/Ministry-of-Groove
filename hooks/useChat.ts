import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useChat = (conversationId: string, userId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!conversationId || !userId) return;

    // 1. Fetch initial message history
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // 2. Set up the Realtime Channel
    const channel = supabase.channel(`chat:${conversationId}`, {
      config: { presence: { key: userId } }
    });

    channel
      // A. Listen for new messages (DB Changes)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      
      // B. Listen for Typing Indicators (Broadcast)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers((prev) => {
          if (payload.isTyping) {
            return prev.includes(payload.userId) ? prev : [...prev, payload.userId];
          } else {
            return prev.filter((id) => id !== payload.userId);
          }
        });
      })

      // C. Listen for Online Presence (Sync)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(state);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  // Helper to send typing status
  const setTyping = (isTyping: boolean) => {
    supabase.channel(`chat:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping },
    });
  };

  return { messages, typingUsers, onlineUsers, setTyping };
};
