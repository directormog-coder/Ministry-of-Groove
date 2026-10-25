import Head from 'next/head';
import Layout from '../components/Layout';

export default function LiveStream() {
  return (
    <Layout current="home">
      <Head>
        <title>Live Stream — The Ministry of Groove</title>
      </Head>
      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]">🔴 LIVE BROADCAST</span>
          <span className="text-[10px] font-mono text-cyan-400">STATUS: STREAMING</span>
        </div>
        <div className="p-6 rounded-2xl bg-[#121418] border border-[#D4AF37]/30 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center text-2xl animate-pulse">
            🎙️
          </div>
          <h2 className="text-sm font-bold tracking-widest text-white">M.O.G. EXECUTIVE RADIO</h2>
          <p className="text-xs text-gray-400 font-mono">Broadcasting authentic Amapiano frequencies live from the grid.</p>
          <button className="w-full py-3 rounded-xl bg-cyan-400 text-black font-extrabold text-xs tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            CONNECT FEED
          </button>
        </div>
      </div>
    </Layout>
  );
}
