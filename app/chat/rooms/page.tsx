"use client";

import { useEffect, useState } from "react";
import { supabase, Profile } from "@/lib/supabase";
import { Plus, Hash, Lock, ArrowRight, Send, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Room = {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
};

type RoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
  sender?: Profile;
};

export default function RoomsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState<Profile[]>([]);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);

      const { data: roomList } = await supabase
        .from("rooms").select("*").order("created_at", { ascending: false });
      setRooms(roomList || []);
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("room_messages")
        .select("*, sender:profiles(*)")
        .eq("room_id", selectedRoom.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };

    const fetchMembers = async () => {
      const { data } = await supabase
        .from("room_members")
        .select("user_id, profiles(*)")
        .eq("room_id", selectedRoom.id);
      setMembers(data?.map((d: any) => d.profiles) || []);
    };

    fetchMessages();
    fetchMembers();

    const channel = supabase
      .channel(`room-${selectedRoom.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "room_messages" },
        async (payload) => {
          const { data: msgWithSender } = await supabase
            .from("room_messages")
            .select("*, sender:profiles(*)")
            .eq("id", payload.new.id)
            .single();
          if (msgWithSender) setMessages((prev) => [...prev, msgWithSender]);
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom]);

  const joinRoom = async (room: Room) => {
    if (!currentUser) return;
    await supabase.from("room_members").upsert({
      room_id: room.id,
      user_id: currentUser.id,
    });
    setSelectedRoom(room);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedRoom) return;
    await supabase.from("room_messages").insert({
      room_id: selectedRoom.id,
      sender_id: currentUser.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !selectedRoom) return;
    setUploading(true);

    const path = `${selectedRoom.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("room_messages").insert({
        room_id: selectedRoom.id,
        sender_id: currentUser.id,
        content: file.name,
        file_url: data.publicUrl,
        file_type: file.type,
      });
    }
    setUploading(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !currentUser) return;
    const { data: room } = await supabase.from("rooms").insert({
      name: newRoomName.trim(),
      description: newRoomDesc.trim(),
      created_by: currentUser.id,
      is_private: isPrivate,
    }).select().single();

    if (room) {
      await supabase.from("room_members").insert({
        room_id: room.id,
        user_id: currentUser.id,
      });
      setRooms((prev) => [room, ...prev]);
      setShowNewRoom(false);
      setNewRoomName("");
      setNewRoomDesc("");
      setSelectedRoom(room);
    }
  };

  const getAvatar = (profile: Profile) =>
    profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`;

  return (
    <div className="flex h-screen pt-16 bg-[var(--cream)]">
      {/* Rooms Sidebar */}
      <div className="w-72 border-r border-[var(--gold)]/20 bg-[var(--charcoal)] flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-display text-lg text-[var(--cream)] uppercase tracking-widest">Channels</span>
          <button
            onClick={() => setShowNewRoom(true)}
            className="text-[var(--gold)] hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => joinRoom(room)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                selectedRoom?.id === room.id ? "bg-white/10 border-l-2 border-[var(--gold)]" : ""
              }`}
            >
              <div className="text-[var(--gold)]">
                {room.is_private ? <Lock size={16} /> : <Hash size={16} />}
              </div>
              <div>
                <p className="text-[var(--cream)] text-sm font-medium">{room.name}</p>
                {room.description && (
                  <p className="text-white/30 text-[10px] truncate max-w-[160px]">{room.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-white/40 hover:text-[var(--gold)] text-xs font-serif transition-colors"
          >
            <ArrowRight size={12} /> Direct Messages
          </Link>
        </div>
      </div>

      {/* Create Room Modal */}
      {showNewRoom && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center">
          <div className="bg-[var(--cream)] w-full max-w-md p-8">
            <h2 className="font-display text-2xl uppercase tracking-widest text-[var(--charcoal)] mb-6">
              New Channel
            </h2>
            <div className="space-y-4">
              <input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Channel name"
                className="w-full border border-[var(--gold)]/30 px-4 py-3 font-serif text-[var(--charcoal)] outline-none focus:border-[var(--gold)]"
              />
              <input
                value={newRoomDesc}
                onChange={(e) => setNewRoomDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border border-[var(--gold)]/30 px-4 py-3 font-serif text-[var(--charcoal)] outline-none focus:border-[var(--gold)]"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="accent-[var(--gold)]"
                />
                <span className="font-serif text-sm text-[var(--charcoal)]">
                  <Lock size={12} className="inline mr-1" /> Private channel
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={createRoom}
                  className="flex-1 bg-[var(--charcoal)] text-[var(--cream)] py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--gold)] transition-colors"
                >
                  Create Channel
                </button>
                <button
                  onClick={() => setShowNewRoom(false)}
                  className="flex-1 border border-[var(--charcoal)]/20 text-[var(--charcoal)] py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Chat Area */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-[var(--gold)]/20 bg-white/50 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedRoom.is_private ? <Lock size={16} className="text-[var(--gold)]" /> : <Hash size={16} className="text-[var(--gold)]" />}
              <p className="font-serif font-semibold text-[var(--charcoal)]">{selectedRoom.name}</p>
              {selectedRoom.description && (
                <p className="text-[var(--charcoal)]/40 text-xs font-serif hidden md:block">— {selectedRoom.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[var(--charcoal)]/40" />
              <span className="text-xs font-serif text-[var(--charcoal)]/40">{members.length} members</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                  {msg.sender && (
                    <Image
                      src={getAvatar(msg.sender)}
                      alt={msg.sender.full_name || ""}
                      width={32}
                      height={32}
                      className="rounded-full object-cover flex-shrink-0 border border-[var(--gold)]/20"
                    />
                  )}
                  <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {!isMe && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] mb-1">
                        {msg.sender?.full_name}
                      </p>
                    )}
                    {msg.file_url ? (
                      msg.file_type?.startsWith("image/") ? (
                        <Image
                          src={msg.file_url}
                          alt={msg.content}
                          width={200}
                          height={200}
                          className="rounded-lg object-cover border border-[var(--gold)]/20"
                        />
                      ) : (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-4 py-2 rounded-lg text-sm font-serif text-[var(--charcoal)] hover:bg-[var(--gold)]/20 transition-colors"
                        >
                          📎 {msg.content}
                        </a>
                      )
                    ) : (
                      <div className={`px-4 py-2 rounded-2xl text-sm font-serif ${
                        isMe
                          ? "bg-[var(--charcoal)] text-[var(--cream)] rounded-br-none"
                          : "bg-white border border-[var(--gold)]/20 text-[var(--charcoal)] rounded-bl-none"
                      }`}>
                        {msg.content}
                      </div>
                    )}
                    <p className="text-[9px] text-[var(--charcoal)]/30 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-[var(--gold)]/20 bg-white/50 backdrop-blur">
            <div className="flex items-center gap-3 bg-white border border-[var(--gold)]/20 rounded-full px-4 py-2">
              <label className="cursor-pointer text-[var(--charcoal)]/40 hover:text-[var(--gold)] transition-colors">
                <input type="file" className="hidden" onChange={uploadFile} />
                <span className="text-lg">{uploading ? "⏳" : "📎"}</span>
              </label>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message #${selectedRoom.name}`}
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
              Join a Channel
            </p>
            <p className="font-serif italic text-[var(--charcoal)]/40 mt-2 text-sm">
              Select a channel or create a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
