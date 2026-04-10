"use client";

import { useEffect, useState } from "react";
import { supabase, Profile, Message } from "@/lib/supabase";
import {
  Users, MessageCircle, ShoppingBag, TrendingUp,
  Shield, Eye, Trash2, Crown, UserCheck, UserX,
  Bell, Search, ChevronRight, BarChart2, Package
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
};

type Stats = {
  totalUsers: number;
  totalMessages: number;
  totalOrders: number;
  totalRevenue: number;
  onlineUsers: number;
  newUsersToday: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalMessages: 0, totalOrders: 0,
    totalRevenue: 0, onlineUsers: 0, newUsersToday: 0,
  });
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "messages" | "orders">("overview");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();

      if (!profile || profile.role !== "director") {
        router.push("/");
        return;
      }

      setCurrentUser(profile);
      await Promise.all([
        fetchUsers(),
        fetchMessages(),
        fetchOrders(),
        fetchPresence(),
      ]);
      setLoading(false);
    };
    init();
  }, [router]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = data?.filter(
      (u) => new Date(u.created_at) >= today
    ).length || 0;

    setStats((prev) => ({
      ...prev,
      totalUsers: data?.length || 0,
      newUsersToday: newToday,
    }));
  };

  const fetchMessages = async () => {
    const { data, count } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(50);
    setMessages(data || []);
    setStats((prev) => ({ ...prev, totalMessages: count || 0 }));
  };

  const fetchOrders = async () => {
    try {
      const { data, count } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders(data || []);
      const revenue = data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      setStats((prev) => ({
        ...prev, totalOrders: count || 0, totalRevenue: revenue,
      }));
    } catch {
      // orders table may not exist yet
    }
  };

  const fetchPresence = async () => {
    const { data } = await supabase.from("presence").select("*");
    const map: Record<string, boolean> = {};
    data?.forEach((p) => { map[p.user_id] = p.is_online; });
    setPresenceMap(map);
    setStats((prev) => ({
      ...prev,
      onlineUsers: data?.filter((p) => p.is_online).length || 0,
    }));
  };

  const viewUserMessages = async (user: Profile) => {
    setSelectedUser(user);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(30);
    setUserMessages(data || []);
  };

  const promoteUser = async (userId: string, role: "director" | "operative") => {
    await supabase.from("profiles").update({ role }).eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, role } : u)
    );
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await supabase.auth.admin.deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const broadcastMessage = async () => {
    if (!broadcastMsg.trim() || !currentUser) return;
    setBroadcasting(true);

    const inserts = users
      .filter((u) => u.id !== currentUser.id)
      .map((u) => ({
        sender_id: currentUser.id,
        receiver_id: u.id,
        content: `📢 ${broadcastMsg.trim()}`,
      }));

    await supabase.from("messages").insert(inserts);
    setBroadcastMsg("");
    setBroadcasting(false);
    alert(`Broadcast sent to ${inserts.length} operatives`);
  };

  const getAvatar = (profile: Profile) =>
    profile.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`;

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[var(--cream)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif italic text-[var(--charcoal)]/50">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-[var(--charcoal)] px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Crown size={20} className="text-[var(--gold)]" />
              <span className="text-[var(--gold)] text-[10px] font-bold uppercase tracking-[0.3em]">
                Director Dashboard
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-[var(--cream)] uppercase tracking-widest">
              Origin 54 Command
            </h1>
            <p className="font-serif italic text-[var(--cream)]/40 text-sm mt-1">
              The Asili Collective — Full Operational Overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-3">
                <Image
                  src={getAvatar(currentUser)}
                  alt="Director"
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-[var(--gold)]/60 object-cover"
                />
                <div className="hidden md:block">
                  <p className="text-[var(--cream)] text-sm font-semibold">{currentUser.full_name}</p>
                  <p className="text-[var(--gold)] text-[9px] uppercase tracking-widest">Director</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[var(--charcoal)]/95 border-b border-[var(--gold)]/10 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Total Operatives", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
            { label: "Online Now", value: stats.onlineUsers, icon: UserCheck, color: "text-green-400" },
            { label: "New Today", value: stats.newUsersToday, icon: TrendingUp, color: "text-[var(--gold)]" },
            { label: "Total Messages", value: stats.totalMessages, icon: MessageCircle, color: "text-purple-400" },
            { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-orange-400" },
            { label: "Revenue", value: `R${stats.totalRevenue.toLocaleString()}`, icon: BarChart2, color: "text-[var(--gold)]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <Icon size={18} className={`${color} mx-auto mb-1`} />
              <p className={`font-display text-xl ${color}`}>{value}</p>
              <p className="text-white/30 text-[9px] uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[var(--charcoal)]/5 rounded-lg p-1 w-fit">
          {(["overview", "users", "messages", "orders"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                activeTab === tab
                  ? "bg-[var(--charcoal)] text-[var(--cream)]"
                  : "text-[var(--charcoal)]/50 hover:text-[var(--charcoal)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Broadcast */}
            <div className="bg-[var(--charcoal)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={18} className="text-[var(--gold)]" />
                <h2 className="font-display text-xl text-[var(--cream)] uppercase tracking-widest">
                  Broadcast to All Operatives
                </h2>
              </div>
              <div className="flex gap-3">
                <input
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Type a message to send to everyone..."
                  className="flex-1 bg-white/5 border border-white/10 text-[var(--cream)] px-4 py-3 font-serif text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-white/20 rounded"
                />
                <button
                  onClick={broadcastMessage}
                  disabled={broadcasting || !broadcastMsg.trim()}
                  className="bg-[var(--gold)] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[var(--charcoal)] transition-colors disabled:opacity-40 rounded"
                >
                  {broadcasting ? "Sending..." : "Broadcast"}
                </button>
              </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white border border-[var(--gold)]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg uppercase tracking-widest text-[var(--charcoal)]">
                    Recent Operatives
                  </h3>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-[var(--gold)] text-xs flex items-center gap-1 hover:text-[var(--charcoal)] transition-colors"
                  >
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="relative">
                        <Image
                          src={getAvatar(user)}
                          alt={user.full_name || ""}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          presenceMap[user.id] ? "bg-green-400" : "bg-gray-200"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-serif text-sm font-medium text-[var(--charcoal)]">{user.full_name}</p>
                        <p className="text-[9px] uppercase tracking-widest text-[var(--charcoal)]/40">{user.role}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                        user.role === "director"
                          ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                          : "bg-blue-50 text-blue-400"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white border border-[var(--gold)]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg uppercase tracking-widest text-[var(--charcoal)]">
                    Recent Messages
                  </h3>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className="text-[var(--gold)] text-xs flex items-center gap-1 hover:text-[var(--charcoal)] transition-colors"
                  >
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-3">
                  {messages.slice(0, 5).map((msg) => {
                    const sender = users.find((u) => u.id === msg.sender_id);
                    return (
                      <div key={msg.id} className="flex items-start gap-3">
                        <Image
                          src={getAvatar(sender || { id: "", full_name: "?", avatar_url: null, role: "operative", created_at: "" })}
                          alt=""
                          width={30}
                          height={30}
                          className="rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)]">
                            {sender?.full_name || "Unknown"}
                          </p>
                          <p className="font-serif text-xs text-[var(--charcoal)]/70 truncate">{msg.content}</p>
                        </div>
                        <p className="text-[9px] text-[var(--charcoal)]/30 flex-shrink-0">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white border border-[var(--gold)]/20 rounded-lg px-4 py-2 flex-1 max-w-sm">
                <Search size={16} className="text-[var(--charcoal)]/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search operatives..."
                  className="bg-transparent font-serif text-sm outline-none flex-1 text-[var(--charcoal)] placeholder:text-black/30"
                />
              </div>
              <p className="text-[var(--charcoal)]/40 font-serif text-sm">
                {filteredUsers.length} operatives
              </p>
            </div>

            <div className="bg-white border border-[var(--gold)]/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--gold)]/10 bg-[var(--charcoal)]/2">
                    <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">
                      Operative
                    </th>
                    <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40 hidden md:table-cell">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40 hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40 hidden md:table-cell">
                      Joined
                    </th>
                    <th className="text-right px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--gold)]/5 hover:bg-[var(--gold)]/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Image
                              src={getAvatar(user)}
                              alt={user.full_name || ""}
                              width={36}
                              height={36}
                              className="rounded-full object-cover"
                            />
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              presenceMap[user.id] ? "bg-green-400" : "bg-gray-200"
                            }`} />
                          </div>
                          <p className="font-serif text-sm font-medium text-[var(--charcoal)]">
                            {user.full_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                          user.role === "director"
                            ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                            : "bg-blue-50 text-blue-500"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`flex items-center gap-1.5 text-xs font-serif ${
                          presenceMap[user.id] ? "text-green-500" : "text-[var(--charcoal)]/30"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            presenceMap[user.id] ? "bg-green-400" : "bg-gray-200"
                          }`} />
                          {presenceMap[user.id] ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="font-serif text-xs text-[var(--charcoal)]/40">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => { viewUserMessages(user); setActiveTab("messages"); }}
                            className="p-2 text-[var(--charcoal)]/40 hover:text-[var(--gold)] transition-colors"
                            title="View messages"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            href={`/chat?user=${user.id}`}
                            className="p-2 text-[var(--charcoal)]/40 hover:text-blue-500 transition-colors"
                            title="Message"
                          >
                            <MessageCircle size={15} />
                          </Link>
                          {user.role === "operative" ? (
                            <button
                              onClick={() => promoteUser(user.id, "director")}
                              className="p-2 text-[var(--charcoal)]/40 hover:text-[var(--gold)] transition-colors"
                              title="Promote to Director"
                            >
                              <Crown size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => promoteUser(user.id, "operative")}
                              className="p-2 text-[var(--charcoal)]/40 hover:text-blue-400 transition-colors"
                              title="Demote to Operative"
                            >
                              <UserX size={15} />
                            </button>
                          )}
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-[var(--charcoal)]/40 hover:text-red-500 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="animate-fade-in">
            {selectedUser ? (
              <div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex items-center gap-2 text-[var(--charcoal)]/50 hover:text-[var(--charcoal)] mb-4 font-serif text-sm transition-colors"
                >
                  ← Back to all messages
                </button>
                <div className="flex items-center gap-3 mb-6 bg-white border border-[var(--gold)]/10 rounded-xl p-4">
                  <Image
                    src={getAvatar(selectedUser)}
                    alt={selectedUser.full_name || ""}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-serif font-semibold text-[var(--charcoal)]">{selectedUser.full_name}</p>
                    <p className="text-[9px] uppercase tracking-widest text-[var(--gold)]">
                      {userMessages.length} messages total
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {userMessages.map((msg) => {
                    const sender = users.find((u) => u.id === msg.sender_id);
                    const receiver = users.find((u) => u.id === msg.receiver_id);
                    return (
                      <div key={msg.id} className="bg-white border border-[var(--gold)]/10 rounded-xl p-4 flex items-start gap-4">
                        <Image
                          src={getAvatar(sender || selectedUser)}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)]">
                              {sender?.full_name}
                            </p>
                            <span className="text-[var(--charcoal)]/20">→</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--charcoal)]/40">
                              {receiver?.full_name}
                            </p>
                          </div>
                          <p className="font-serif text-sm text-[var(--charcoal)]/80">{msg.content}</p>
                        </div>
                        <p className="text-[9px] text-[var(--charcoal)]/30 flex-shrink-0">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[var(--charcoal)]/40 font-serif text-sm mb-4">
                  Showing last {messages.length} messages across all conversations
                </p>
                {messages.map((msg) => {
                  const sender = users.find((u) => u.id === msg.sender_id);
                  const receiver = users.find((u) => u.id === msg.receiver_id);
                  return (
                    <div key={msg.id} className="bg-white border border-[var(--gold)]/10 rounded-xl p-4 flex items-start gap-4">
                      <Image
                        src={sender?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sender?.full_name}`}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)]">
                            {sender?.full_name || "Unknown"}
                          </p>
                          <span className="text-[var(--charcoal)]/20 text-xs">→</span>
                          <p className="text-[9px] uppercase tracking-widest text-[var(--charcoal)]/40">
                            {receiver?.full_name || "Unknown"}
                          </p>
                        </div>
                        <p className="font-serif text-sm text-[var(--charcoal)]/80">{msg.content}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-[9px] text-[var(--charcoal)]/30">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          msg.read ? "bg-green-50 text-green-400" : "bg-red-50 text-red-400"
                        }`}>
                          {msg.read ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="animate-fade-in">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <Package size={48} className="text-[var(--charcoal)]/20 mx-auto mb-4" />
                <p className="font-display text-2xl text-[var(--charcoal)]/20 uppercase tracking-widest">
                  No Orders Yet
                </p>
                <p className="font-serif italic text-[var(--charcoal)]/30 text-sm mt-2">
                  Orders will appear here when customers checkout
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[var(--gold)]/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--gold)]/10">
                      <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">Order ID</th>
                      <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">Customer</th>
                      <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">Total</th>
                      <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">Status</th>
                      <th className="text-left px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]/40">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const customer = users.find((u) => u.id === order.user_id);
                      return (
                        <tr key={order.id} className="border-b border-[var(--gold)]/5 hover:bg-[var(--gold)]/2 transition-colors">
                          <td className="px-6 py-4 font-serif text-xs text-[var(--charcoal)]/50">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 font-serif text-sm text-[var(--charcoal)]">
                            {customer?.full_name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 font-serif text-sm font-semibold text-[var(--charcoal)]">
                            R{order.total?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                              order.status === "completed"
                                ? "bg-green-50 text-green-500"
                                : order.status === "pending"
                                ? "bg-yellow-50 text-yellow-500"
                                : "bg-red-50 text-red-500"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-serif text-xs text-[var(--charcoal)]/40">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
