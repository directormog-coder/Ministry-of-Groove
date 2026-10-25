import Head from 'next/head';
import Layout from '../components/Layout';

export default function Tickets() {
  return (
    <Layout current="home">
      <Head>
        <title>Tickets — The Ministry of Groove</title>
      </Head>
      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]">🎟️ EVENT ACCESS</span>
          <span className="text-[10px] font-mono text-cyan-400">CABINET SECURED</span>
        </div>
        <div className="p-6 rounded-2xl bg-[#121418] border border-[#D4AF37]/30 space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-white">THE CABINET SESSION #01</h2>
          <p className="text-xs text-gray-400 font-mono">Exclusive access pass for members and verified stakeholders.</p>
          <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs font-mono">
            <span className="text-[#D4AF37]">R250.00 / PASS</span>
            <button className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-bold tracking-wider hover:opacity-95 transition">
              ACQUIRE
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
