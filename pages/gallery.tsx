import Head from 'next/head';
import Layout from '../components/Layout';

export default function Gallery() {
  return (
    <Layout current="gallery">
      <Head>
        <title>Gallery — The Ministry of Groove</title>
      </Head>
      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]">🖼️ ARCHIVE VAULT</span>
          <span className="text-[10px] font-mono text-cyan-400">VISUAL FEED</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-square rounded-xl bg-[#121418] border border-neutral-800 flex items-center justify-center text-xs font-mono text-gray-500">
            [M.O.G. ASSET 01]
          </div>
          <div className="aspect-square rounded-xl bg-[#121418] border border-neutral-800 flex items-center justify-center text-xs font-mono text-gray-500">
            [M.O.G. ASSET 02]
          </div>
        </div>
      </div>
    </Layout>
  );
}
