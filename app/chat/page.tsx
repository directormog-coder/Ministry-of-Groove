"use client";

import { useEffect, useState } from "react";
import { supabase, Profile, Message } from "@/lib/supabase";
import { Send, Search, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setCurrentUser(profile);

      // Directors see all users, operatives see director + other operatives
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .order("full_name");

      setUsers(allUsers || []);
    };
    init();
  }, []);

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
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`chat-${currentUser.id}-${selectedUser.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getAvatar = (profile: Profile) =>
    profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`;

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
              <Image
                src={getAvatar(currentUser)}
                alt="You"
                width={40}
                height={40}
                className="rounded-full border border-[var(--gold)]/40 object-cover"
              />
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
                selectedUser?.id === user.id ? "bg-white/10 border-l-2 border-[var(--gold)]" : ""
              }`}
            >
              <Image
                src={getAvatar(user)}
                alt={user.full_name || "User"}
                width={38}
                height={38}
                className="rounded-full object-cover border border-white/10"
              />
              <div>
                <p className="text-[var(--cream)] text-sm font-medium">{user.full_name}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[var(--gold)]/20 bg-white/50 backdrop-blur flex items-center gap-3">
            <Image
              src={getAvatar(selectedUser)}
              alt={selectedUser.full_name || ""}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-serif font-semibold text-[var(--charcoal)]">{selectedUser.full_name}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--gold)]">{selectedUser.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm font-serif ${
                      isMe
                        ? "bg-[var(--charcoal)] text-[var(--cream)] rounded-br-none"
                        : "bg-white border border-[var(--gold)]/20 text-[var(--charcoal)] rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                    <p className={`text-[9px] mt-1 ${isMe ? "text-white/40" : "text-black/30"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-[var(--gold)]/20 bg-white/50 backdrop-blur">
            <div className="flex items-center gap-3 bg-white border border-[var(--gold)]/20 rounded-full px-4 py-2">
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
