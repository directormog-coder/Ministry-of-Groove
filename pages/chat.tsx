import Head from 'next/head';
import Layout from '../components/Layout';

export default function Chat() {
  return (
    <Layout current="chat">
      <Head>
        <title>Chat & Messages — The Ministry of Groove</title>
      </Head>
      <div className="max-w-md mx-auto px-5 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]">💬 SECURE UPLINK</span>
          <span className="text-[10px] font-mono text-emerald-400">● REAL-TIME</span>
        </div>
        <div className="h-96 rounded-2xl bg-[#121418] border border-neutral-800 p-4 flex flex-col justify-between">
          <div className="space-y-3 overflow-y-auto text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800">
              <span className="text-[#D4AF37] block font-bold">@director_mog</span>
              <p className="text-gray-300 mt-1">Grid synchronized. Welcome to the Cabinet transmission channel.</p>
            </div>
          </div>
          <div className="pt-3 border-t border-neutral-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Transmit message..." 
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
            />
            <button className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs">
              SEND
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
