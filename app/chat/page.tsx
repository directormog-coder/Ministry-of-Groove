"use client";

import { useEffect, useState, useRef } from "react";
import { supabase, Profile, Message } from "@/lib/supabase";
import { useToast } from "@/lib/toast";
import { registerPushNotifications } from "@/lib/notifications";
import {
  Send, Search, Settings, Smile, Paperclip, X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const EMOJIS = ["❤️", "🔥", "👏", "😂", "😮", "🙏"];

type Reaction = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

export default function ChatPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [unreadByUser, setUnreadByUser] = useState<Record<string, number>>({});
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Init current user and load users
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);

      const { data: allUsers } = await supabase
        .from("profiles").select("*").neq("id", user.id).order("full_name");
      setUsers(allUsers || []);

      // Register push notifications
      if (profile) registerPushNotifications(profile.id);
    };
    init();
  }, []);

  // Presence tracking
  useEffect(() => {
    if (!currentUser) return;

    const updatePresence = async () => {
      await supabase.from("presence").upsert({
        user_id: currentUser.id,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    const handleOffline = async () => {
      await supabase.from("presence").upsert({
        user_id: currentUser.id,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
    };

    window.addEventListener("beforeunload", handleOffline);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleOffline);
      handleOffline();
    };
  }, [currentUser]);

  // Fetch presence map
  useEffect(() => {
    const fetchPresence = async () => {
      const { data } = await supabase.from("presence").select("*");
      const map: Record<string, boolean> = {};
      data?.forEach((p) => { map[p.user_id] = p.is_online; });
      setPresenceMap(map);
    };

    fetchPresence();

    const channel = supabase.channel("presence-updates")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "presence" },
        () => fetchPresence()
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch unread counts per user
  useEffect(() => {
    if (!currentUser || users.length === 0) return;

    const fetchUnreadPerUser = async () => {
      const { data } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", currentUser.id)
        .eq("read", false);

      const counts: Record<string, number> = {};
      data?.forEach((msg) => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadByUser(counts);
    };

    fetchUnreadPerUser();

    const channel = supabase.channel("unread-per-user")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchUnreadPerUser()
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, users]);

  // Load messages and subscribe to real-time
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(data || []);
      fetchReactions(data?.map((m) => m.id) || []);
    };

    const markAsRead = async () => {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("receiver_id", currentUser.id)
        .eq("sender_id", selectedUser.id)
        .eq("read", false);
    };

    fetchMessages();
    markAsRead();

    const channel = supabase
      .channel(`chat-${currentUser.id}-${selectedUser.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, msg]);
            fetchReactions([...messages.map(m => m.id), msg.id]);

            // Show toast for incoming messages
            if (msg.sender_id !== currentUser.id) {
              const sender = users.find((u) => u.id === msg.sender_id);
              showToast({
                senderName: sender?.full_name || "Someone",
                senderAvatar: sender?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${sender?.full_name}`,
                message: msg.content,
                chatUrl: "/chat",
              });
              markAsRead();
            }
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, currentUser]);

  const fetchReactions = async (messageIds: string[]) => {
    if (!messageIds.length || !currentUser) return;
    const { data } = await supabase
      .from("reactions")
      .select("*")
      .in("message_id", messageIds);

    const map: Record<string, Reaction[]> = {};
    messageIds.forEach((id) => { map[id] = []; });
    data?.forEach((r) => {
      if (!map[r.message_id]) map[r.message_id] = [];
      const existing = map[r.message_id].find((x) => x.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === currentUser.id) existing.userReacted = true;
      } else {
        map[r.message_id].push({
          emoji: r.emoji,
          count: 1,
          userReacted: r.user_id === currentUser.id,
        });
      }
    });
    setReactions(map);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const existing = reactions[messageId]?.find(
      (r) => r.emoji === emoji && r.userReacted
    );
    if (existing) {
      await supabase.from("reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", currentUser.id)
        .eq("emoji", emoji);
    } else {
      await supabase.from("reactions").upsert({
        message_id: messageId,
        user_id: currentUser.id,
        emoji,
      });
    }
    setShowEmojiFor(null);
    fetchReactions(messages.map((m) => m.id));
  };
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;
    await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !selectedUser) return;
    setUploading(true);

    const path = `${currentUser.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("messages").insert({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: file.type.startsWith("image/")
          ? `📷 ${file.name}`
          : `📎 ${file.name}`,
        file_url: data.publicUrl,
        file_type: file.type,
      });
    }
    setUploading(false);
  };

  const getAvatar = (profile: Profile) =>
    profile.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`;

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen pt-16 bg-[var(--cream)]">
      {/* Sidebar */}
      <div className="w-80 border-r border-[var(--gold)]/20 bg-[var(--charcoal)] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-lg text-[var(--cream)] uppercase tracking-widest">
              {currentUser?.role === "director" ? "🎯 Director" : "⚡ Operative"}
            </span>
            <Link href="/profile/settings">
              <Settings size={18} className="text-[var(--gold)] hover:text-white transition-colors" />
            </Link>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={getAvatar(currentUser)}
                  alt="You"
                  width={40}
                  height={40}
                  className="rounded-full border border-[var(--gold)]/40 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[var(--charcoal)]" />
              </div>
              <div>
                <p className="text-[var(--cream)] text-sm font-semibold">{currentUser.full_name}</p>
                <p className="text-[var(--gold)] text-[10px] uppercase tracking-widest">{currentUser.role}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 bg-white/5 rounded px-3 py-2">
            <Search size={14} className="text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-white/80 text-sm outline-none flex-1 placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                selectedUser?.id === user.id
                  ? "bg-white/10 border-l-2 border-[var(--gold)]"
                  : ""
              }`}
            >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <Image
                  src={getAvatar(user)}
                  alt={user.full_name || "User"}
                  width={38}
                  height={38}
                  className="rounded-full object-cover border border-white/10"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--charcoal)] ${
                  presenceMap[user.id] ? "bg-green-400" : "bg-white/20"
                }`} />
                {unreadByUser[user.id] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                    {unreadByUser[user.id]}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  unreadByUser[user.id] > 0 ? "text-white" : "text-[var(--cream)]"
                }`}>
                  {user.full_name}
                </p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                    presenceMap[user.id] ? "bg-green-400" : "bg-white/20"
                  }`} />
                  {presenceMap[user.id] ? "Online" : user.role}
                </p>
              </div>

              {unreadByUser[user.id] > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/chat/rooms"
            className="flex items-center gap-2 text-white/40 hover:text-[var(--gold)] text-xs font-serif transition-colors"
          >
            # Browse Channels
          </Link>
        </div>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[var(--gold)]/20 bg-white/50 backdrop-blur flex items-center gap-3">
            <div className="relative">
              <Image
                src={getAvatar(selectedUser)}
                alt={selectedUser.full_name || ""}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                presenceMap[selectedUser.id] ? "bg-green-400" : "bg-gray-300"
              }`} />
            </div>
            <div>
              <p className="font-serif font-semibold text-[var(--charcoal)]">{selectedUser.full_name}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--gold)]">
                {presenceMap[selectedUser.id] ? "🟢 Online" : selectedUser.role}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              const msgReactions = reactions[msg.id] || [];

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                  <div className="relative max-w-xs lg:max-w-md">
                    <div className={`px-4 py-2 rounded-2xl text-sm font-serif ${
                      isMe
                        ? "bg-[var(--charcoal)] text-[var(--cream)] rounded-br-none"
                        : "bg-white border border-[var(--gold)]/20 text-[var(--charcoal)] rounded-bl-none"
                    }`}>
                      {msg.content}
                      <p className={`text-[9px] mt-1 ${isMe ? "text-white/40" : "text-black/30"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Emoji picker trigger */}
                    <button
                      onClick={() => setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-[var(--gold)]/20 rounded-full p-1 shadow-sm z-10"
                    >
                      <Smile size={12} className="text-[var(--charcoal)]/60" />
                    </button>

                    {/* Emoji picker */}
                    {showEmojiFor === msg.id && (
                      <div className={`absolute ${isMe ? "right-0" : "left-0"} -top-12 bg-white border border-[var(--gold)]/20 rounded-full px-2 py-1 flex gap-1 shadow-lg z-20`}>
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className="text-sm hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                        <button onClick={() => setShowEmojiFor(null)}>
                          <X size={10} className="text-gray-400" />
                        </button>
                      </div>
                    )}

                    {/* Reactions */}
                    {msgReactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msgReactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => toggleReaction(msg.id, r.emoji)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                              r.userReacted
                                ? "bg-[var(--gold)]/20 border-[var(--gold)]/40"
                                : "bg-white border-black/10"
                            }`}
                          >
                            {r.emoji} <span className="font-bold">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-[var(--gold)]/20 bg-white/50 backdrop-blur">
            <div className="flex items-center gap-3 bg-white border border-[var(--gold)]/20 rounded-full px-4 py-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={uploadFile}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[var(--charcoal)]/40 hover:text-[var(--gold)] transition-colors"
              >
                <Paperclip size={16} strokeWidth={1.5} />
              </button>
              {uploading && (
                <span className="text-[10px] text-[var(--gold)] animate-pulse">Uploading...</span>
              )}
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent font-serif text-sm outline-none text-[var(--charcoal)] placeholder:text-black/30"
              />
              <button
                onClick={sendMessage}
                className="bg-[var(--gold)] text-white rounded-full p-2 hover:bg-[var(--charcoal)] transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-4xl text-[var(--charcoal)]/20 uppercase tracking-widest">
              Select a Conversation
            </p>
            <p className="font-serif italic text-[var(--charcoal)]/40 mt-2 text-sm">
              Choose an operative or director to begin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
