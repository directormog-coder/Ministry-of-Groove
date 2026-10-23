import Head from 'next/head';
import { useRouter } from 'next/router';
import AudioPlayer from '../components/AudioPlayer';

export default function WalletPass() {
  const router = useRouter();

  const handleWalletDownload = (type: string) => {
    alert(`Generating secure pass for ${type}. File ready for download.`);
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | DIGITAL WALLET PASS</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">DIGITAL WALLET PASS</h1>
      </div>

      <div className="panel" style={{ marginTop: '20px', textAlign: 'center', padding: '24px' }}>
        <div style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
          MOG VIP PASSPORT #MOG-VIP-8849
        </div>
        <p style={{ color: '#8e9bae', fontSize: '12px', marginBottom: '20px' }}>
          Add your ticket directly to your smartphone's native wallet app for offline gate scanning.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => handleWalletDownload('Apple Wallet')}
            style={{ padding: '14px', backgroundColor: '#000', border: '1px solid #fff', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}
          >
             ADD TO APPLE WALLET
          </button>
          <button 
            onClick={() => handleWalletDownload('Google Wallet')}
            style={{ padding: '14px', backgroundColor: '#0a101d', border: '1px solid #00f2fe', color: '#00f2fe', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}
          >
            G PAY // ADD TO GOOGLE WALLET
          </button>
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
