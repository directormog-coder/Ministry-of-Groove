import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children, current }: { children: ReactNode; current?: string }) {
  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans pb-32 selection:bg-[#D4AF37] selection:text-black">
      {/* Top Header with Gold Circuit Border */}
      <header className="border-b border-[#D4AF37]/30 bg-[#07080A]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00F0FF] blur-md opacity-30 rounded-full"></div>
            <img 
              src="/logo.png" 
              alt="M.O.G. Crest" 
              className="w-9 h-9 rounded-full border border-[#D4AF37] object-cover relative z-10 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-white">MINISTRY OF GROOVE</h1>
            <p className="text-[9px] text-[#D4AF37] font-mono tracking-wider">THE CABINET [PTY] LTD • EST. 2026</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2.5 py-1 rounded-full animate-pulse">
          ● SECURE GRID
        </span>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#07080A]/90 border-b border-[#D4AF37]/20 px-3 py-2.5 flex items-center space-x-2 overflow-x-auto scrollbar-none sticky top-[61px] z-40 backdrop-blur-md">
        <Link href="/" className={`px-4 py-1.5 rounded-xl text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'home' ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#0D0F13] border border-[#1F242C] hover:border-[#D4AF37]/50 text-gray-300 font-medium'}`}>
          🏠 HOME
        </Link>
        <Link href="/profile" className={`px-4 py-1.5 rounded-xl text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'profile' ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#0D0F13] border border-[#1F242C] hover:border-[#D4AF37]/50 text-gray-300 font-medium'}`}>
          👤 PROFILE
        </Link>
        <Link href="/chat" className={`px-4 py-1.5 rounded-xl text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'chat' ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#0D0F13] border border-[#1F242C] hover:border-[#D4AF37]/50 text-gray-300 font-medium'}`}>
          💬 CHAT
        </Link>
        <Link href="/vote" className={`px-4 py-1.5 rounded-xl text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'vote' ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#0D0F13] border border-[#1F242C] hover:border-[#D4AF37]/50 text-gray-300 font-medium'}`}>
          🗳️ VOTE
        </Link>
        <Link href="/gallery" className={`px-4 py-1.5 rounded-xl text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'gallery' ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#0D0F13] border border-[#1F242C] hover:border-[#D4AF37]/50 text-gray-300 font-medium'}`}>
          🖼️ GALLERY
        </Link>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Persistent Audio Bar with Gold & Cyan Theme */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0F13] border-t border-[#D4AF37]/40 px-4 py-3.5 flex items-center justify-between z-40 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            🎵
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
              <span>LIVE AMAPIANO FEED</span>
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping"></span>
            </p>
            <p className="text-[10px] text-[#D4AF37] font-mono tracking-widest">MINISTRY OF GROOVE RADIO</p>
          </div>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs tracking-widest hover:opacity-90 transition shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          PLAY
        </button>
      </div>
    </div>
  );
}
