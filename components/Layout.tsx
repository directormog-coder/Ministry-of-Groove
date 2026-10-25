import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children, current }: { children: ReactNode; current?: string }) {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white font-sans pb-28 selection:bg-[#D4AF37] selection:text-black">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#D4AF37]/30 bg-[#0a0b0d]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <Link href="/" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'home' ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'hover:bg-neutral-900 text-gray-300 font-medium'}`}>
          🏠 HOME
        </Link>
        <Link href="/profile" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'profile' ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'hover:bg-neutral-900 text-gray-300 font-medium'}`}>
          👤 PROFILE
        </Link>
        <Link href="/chat" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'chat' ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'hover:bg-neutral-900 text-gray-300 font-medium'}`}>
          💬 CHAT
        </Link>
        <Link href="/vote" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'vote' ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'hover:bg-neutral-900 text-gray-300 font-medium'}`}>
          🗳️ VOTE
        </Link>
        <Link href="/gallery" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'gallery' ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'hover:bg-neutral-900 text-gray-300 font-medium'}`}>
          🖼️ GALLERY
        </Link>
      </nav>

      {/* Page Content */}
      <main>{children}</main>

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
