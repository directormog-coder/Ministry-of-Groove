import Head from 'next/head';
import Layout from '../components/Layout';

export default function Vote() {
  return (
    <Layout current="vote">
      <Head>
        <title>Voting Cabinet — The Ministry of Groove</title>
      </Head>
      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]">🗳️ CABINET POLLS</span>
          <span className="text-[10px] font-mono text-cyan-400">ACTIVE SESSION</span>
        </div>
        <div className="p-6 rounded-2xl bg-[#121418] border border-[#D4AF37]/30 space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-white">SELECT THE NEXT SOUND POLICY</h2>
          <div className="space-y-2 pt-2">
            <button className="w-full text-left p-3.5 rounded-xl bg-black border border-neutral-800 hover:border-[#D4AF37] text-xs font-mono text-gray-300 transition">
              01. Deep Tech & Private School Piano Mix
            </button>
            <button className="w-full text-left p-3.5 rounded-xl bg-black border border-neutral-800 hover:border-[#D4AF37] text-xs font-mono text-gray-300 transition">
              02. Quantum Sgidongo Heavyweight Session
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
