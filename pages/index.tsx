import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 selection:bg-[#D4AF37] selection:text-black">
      <Head>
        <title>The Ministry of Groove — The Cabinet (Pty) Ltd</title>
        <meta name="description" content="Decrypting the Culture. Synchronizing the Grid." />
        <link rel="icon" href="/assets/images/logo.png" />
      </Head>

      {/* Top Navigation Bar */}
      <nav className="border-b border-[#D4AF37]/30 bg-black/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between overflow-x-auto">
        <div className="flex space-x-2 text-xs font-mono">
          <Link href="/" className="px-3 py-1.5 rounded bg-[#D4AF37] text-black font-bold flex items-center gap-1">
            🏠 HOME
          </Link>
          <Link href="/profile" className="px-3 py-1.5 rounded hover:bg-neutral-900 text-gray-300 flex items-center gap-1">
            👤 PROFILE
          </Link>
          <Link href="/chat" className="px-3 py-1.5 rounded hover:bg-neutral-900 text-gray-300 flex items-center gap-1">
            💬 CHAT
          </Link>
          <Link href="/vote" className="px-3 py-1.5 rounded hover:bg-neutral-900 text-gray-300 flex items-center gap-1">
            🗳️ VOTE
          </Link>
          <Link href="/gallery" className="px-3 py-1.5 rounded hover:bg-neutral-900 text-gray-300 flex items-center gap-1">
            🖼️ GALLERY
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-md mx-auto px-6 pt-8 text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 rounded-full"></div>
          <img 
            src="/assets/images/logo.png" 
            alt="M.O.G. Logo" 
            className="w-24 h-24 mx-auto rounded-full border-2 border-[#D4AF37] object-cover relative z-10 shadow-[0_0_25px_rgba(212,175,55,0.3)]"
          />
        </div>

        <div>
          <h1 className="text-xl font-black tracking-widest text-white">MINISTRY OF GROOVE</h1>
          <p className="text-xs text-[#D4AF37] font-mono tracking-wider mt-1">THE CABINET [PTY] LTD • EST. 2026</p>
        </div>

        {/* Live System Status Badge */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            UPLINK ACTIVE
          </span>
          <span className="text-cyan-400">EMALAHLENI SECURE</span>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link href="/profile" className="block w-full py-4 px-6 rounded-xl bg-neutral-950 border border-[#D4AF37]/40 text-[#D4AF37] font-bold tracking-widest text-sm hover:bg-[#D4AF37]/10 transition shadow-lg text-center">
            PROFILE
          </Link>
          <Link href="/chat" className="block w-full py-4 px-6 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-widest text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition text-center">
            CHAT & MESSAGES
          </Link>
          <Link href="/vote" className="block w-full py-4 px-6 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-widest text-sm hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition text-center">
            VOTE
          </Link>
          <Link href="/gallery" className="block w-full py-4 px-6 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-widest text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition text-center">
            GALLERY
          </Link>
          <Link href="/livestream" className="block w-full py-4 px-6 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-widest text-sm hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition text-center">
            LIVE STREAM
          </Link>
          <Link href="/tickets" className="block w-full py-4 px-6 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-widest text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition text-center">
            TICKETS
          </Link>
        </div>
      </div>

      {/* Persistent Audio Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-[#D4AF37]/30 px-4 py-3 flex items-center justify-between z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🎵</span>
          <div>
            <p className="text-xs font-bold text-white tracking-wider">LIVE STREAM AUDIO</p>
            <p className="text-[10px] text-gray-400 font-mono">MINISTRY OF GROOVE RADIO</p>
          </div>
        </div>
        <button className="px-5 py-2 rounded-lg bg-[#D4AF37] text-black font-extrabold text-xs tracking-widest hover:opacity-95 transition shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          PLAY
        </button>
      </div>
    </div>
  );
}
