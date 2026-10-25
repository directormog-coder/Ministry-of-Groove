import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children, current }: { children: ReactNode; current?: string }) {
  return (
    <div className="min-h-screen bg-mog-dark text-white font-sans pb-28 selection:bg-mog-gold selection:text-black">
      {/* Top Branding Header */}
      <header className="border-b border-mog-gold/30 bg-mog-dark/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/images/logo.png" 
            alt="M.O.G. Crest" 
            className="w-8 h-8 rounded-full border border-mog-gold object-cover shadow-gold"
          />
          <div>
            <h1 className="text-[11px] font-black tracking-widest text-white">MINISTRY OF GROOVE</h1>
            <p className="text-[9px] text-mog-gold font-mono tracking-wider">THE CABINET [PTY] LTD</p>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-mog-dark/90 border-b border-neutral-800 px-3 py-2.5 flex items-center space-x-2 overflow-x-auto scrollbar-none sticky top-[57px] z-40 backdrop-blur-md">
        <Link href="/" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'home' ? 'bg-mog-gold text-black font-bold shadow-gold' : 'hover:bg-mog-card text-gray-300 font-medium'}`}>
          🏠 HOME
        </Link>
        <Link href="/profile" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'profile' ? 'bg-mog-gold text-black font-bold shadow-gold' : 'hover:bg-mog-card text-gray-300 font-medium'}`}>
          👤 PROFILE
        </Link>
        <Link href="/chat" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'chat' ? 'bg-mog-gold text-black font-bold shadow-gold' : 'hover:bg-mog-card text-gray-300 font-medium'}`}>
          💬 CHAT
        </Link>
        <Link href="/vote" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'vote' ? 'bg-mog-gold text-black font-bold shadow-gold' : 'hover:bg-mog-card text-gray-300 font-medium'}`}>
          🗳️ VOTE
        </Link>
        <Link href="/gallery" className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${current === 'gallery' ? 'bg-mog-gold text-black font-bold shadow-gold' : 'hover:bg-mog-card text-gray-300 font-medium'}`}>
          🖼️ GALLERY
        </Link>
      </nav>

      {/* Main Content Area */}
      <main>{children}</main>

      {/* Persistent Audio Bar with Circuit Cyan & Gold Theme */}
      <div className="fixed bottom-0 left-0 right-0 bg-mog-card border-t border-mog-gold/30 px-4 py-3 flex items-center justify-between z-40 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-mog-cyan/10 border border-mog-cyan flex items-center justify-center text-mog-cyan animate-pulse">
            🎵
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>LIVE AMAPIANO FEED</span>
              <span className="w-2 h-2 rounded-full bg-mog-cyan inline-block animate-ping"></span>
            </p>
            <p className="text-[10px] text-mog-gold font-mono">THE CABINET RADIO • EST. 2026</p>
          </div>
        </div>
        <button className="px-5 py-2 rounded-xl bg-mog-cyan text-black font-extrabold text-xs tracking-widest hover:opacity-90 transition shadow-cyan">
          PLAY
        </button>
      </div>
    </div>
  );
}
