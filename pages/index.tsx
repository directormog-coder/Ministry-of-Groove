import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white font-sans pb-28 selection:bg-[#D4AF37] selection:text-black">
      <Head>
        <title>The Ministry of Groove — The Cabinet (Pty) Ltd</title>
      </Head>

      {/* Top Navigation Bar */}
      <nav className="border-b border-[#D4AF37]/30 bg-[#0a0b0d]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <Link href="/" className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] whitespace-nowrap">
          🏠 HOME
        </Link>
        <Link href="/profile" className="px-3.5 py-1.5 rounded-lg hover:bg-neutral-900 text-gray-300 font-medium text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition">
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
      <div className="max-w-md mx-auto px-5 pt-6 text-center space-y-6">
        {/* Crest Logo */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 rounded-full"></div>
          <img 
            src="/assets/images/logo.png" 
            alt="M.O.G. Crest" 
            className="w-24 h-24 mx-auto rounded-full border-2 border-[#D4AF37] object-cover relative z-10 shadow-[0_0_25px_rgba(212,175,55,0.3)]"
          />
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-lg font-black tracking-widest text-white">MINISTRY OF GROOVE</h1>
          <p className="text-[11px] text-[#D4AF37] font-mono tracking-widest">THE CABINET [PTY] LTD • EST. 2026</p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link href="/profile" className="block w-full py-4 px-6 rounded-xl bg-[#121418] border border-neutral-800 text-[#D4AF37] font-bold tracking-widest text-xs hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition shadow-md text-center">
            PROFILE
          </Link>
          <Link href="/chat" className="block w-full py-4 px-6 rounded-xl bg-[#121418] border border-neutral-800 text-white font-bold tracking-widest text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition shadow-md text-center">
            CHAT & MESSAGES
          </Link>
          <Link href="/vote" className="block w-full py-4 px-6 rounded-xl bg-[#121418] border border-neutral-800 text-white font-bold tracking-widest text-xs hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition shadow-md text-center">
            VOTE
          </Link>
          <Link href="/gallery" className="block w-full py-4 px-6 rounded-xl bg-[#121418] border border-neutral-800 text-white font-bold tracking-widest text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition shadow-md text-center">
            GALLERY
          </Link>
          <Link href="/livestream" className="block w-full py-4 px-6 rounded-xl bg-[#121418] border border-neutral-800 text-white font-bold tracking-widest text-xs hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition shadow-md text-center">
            LIVE STREAM
          </Link>
          <Link href="/tickets" className="block w-full py-4 px-6 rounded-xl bg-[#121418] border border-neutral-800 text-white font-bold tracking-widest text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition shadow-md text-center">
            TICKETS
          </Link>
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
