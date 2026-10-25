import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Profile() {
  const [fullName, setFullName] = useState('POGISO JAN MOLOTO');
  const [handle, setHandle] = useState('@director_mog');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white font-sans pb-28 selection:bg-[#D4AF37] selection:text-black">
      <Head>
        <title>User Profile — The Ministry of Groove</title>
      </Head>

      {/* Top Navigation Bar */}
      <nav className="border-b border-[#D4AF37]/30 bg-[#0a0b0d]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <Link href="/" className="px-3.5 py-1.5 rounded-lg hover:bg-neutral-900 text-gray-300 font-medium text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition">
          🏠 HOME
        </Link>
        <Link href="/profile" className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] whitespace-nowrap">
          👤 PROFILE
        </Link>
        <Link href="/chat" className="px-3.5 py-1.5 rounded-lg hover:bg-neutral-900 text-gray-300 font-medium text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition">
          💬 CHAT
        </Link>
        <Link href="/vote" className="px-3.5 py-1.5 rounded-lg hover:bg-neutral-900 text-gray-300 font-medium text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition">
          🗳️ VOTE
        </Link>
        <Link href="/gallery" className="px-3.5 py-1.5 rounded-lg hover:bg-neutral-900 text-gray-300 font-medium text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition">
          🖼️ GALLERY
        </Link>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-xs font-mono text-[#D4AF37] hover:underline flex items-center gap-1">
            ← HOME
          </Link>
          <span className="text-xs font-mono text-gray-400 tracking-wider">USER PROFILE</span>
        </div>

        {/* Profile Card Box */}
        <div className="p-6 rounded-2xl bg-[#121418] border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] space-y-6">
          <div className="text-center space-y-3">
            <img 
              src="/assets/images/logo.png" 
              alt="M.O.G. Crest" 
              className="w-20 h-20 mx-auto rounded-full border border-[#D4AF37] object-cover shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
            <div>
              <h2 className="text-xs font-bold tracking-widest text-[#D4AF37]">THE CABINET MEMBER</h2>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">EST. 2026</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 tracking-wider mb-1.5">FULL NAME</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-[#D4AF37] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 tracking-wider mb-1.5">HANDLE</label>
              <input 
                type="text" 
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-[#D4AF37] focus:outline-none transition"
              />
            </div>

            {saved && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 text-xs font-mono text-center">
                ✓ Cabinet Credentials Synchronized
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs tracking-widest hover:opacity-95 transition shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-2"
            >
              SAVE CHANGES
            </button>
          </form>
        </div>
      </div>

      {/* Persistent Audio Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f1115] border-t border-[#D4AF37]/30 px-4 py-3 flex items-center justify-between z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-lg">🎵</span>
          <div>
            <p className="text-xs font-bold text-white tracking-wider">LIVE STREAM AUDIO</p>
            <p className="text-[10px] text-gray-400 font-mono">MINISTRY OF GROOVE RADIO</p>
          </div>
        </div>
        <button className="px-5 py-2 rounded-lg bg-cyan-400 text-black font-extrabold text-xs tracking-widest hover:opacity-90 transition shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          PLAY
        </button>
      </div>
    </div>
  );
}
