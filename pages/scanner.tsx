import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function PassScanner() {
  const router = useRouter();
  const [passCode, setPassCode] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passCode.trim()) return;

    setLoading(true);
    setScanResult(null);

    // Verify token or log verification
    if (passCode.startsWith('MOG-VIP-')) {
      await supabase.from('transmission_logs').insert([{
        message: `PASS VERIFIED AT GATE: ${passCode}`
      }]);
      setScanResult({
        success: true,
        message: `CLEARANCE GRANTED // OPERATIVE PASS ${passCode} VALIDATED`
      });
    } else {
      setScanResult({
        success: false,
        message: `INVALID CIPHER // ACCESS DENIED`
      });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>M.O.G. | GATE SCANNER</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">GATE SCANNER</h1>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">CHECKPOINT ACTIVE</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-hdr">
          <h2>// SCAN / INPUT PASS CIPHER</h2>
        </div>

        <form onSubmit={handleVerify} className="scanner-form">
          <label style={{ display: 'block', color: '#00f2fe', marginBottom: '8px', fontSize: '12px' }}>
            ENTER TOKEN (E.G. MOG-VIP-XXXXX)
          </label>
          <input 
            type="text" 
            placeholder="MOG-VIP-..." 
            value={passCode}
            onChange={(e) => setPassCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              color: '#d4af37',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '15px'
            }}
          />
          <button 
            type="submit" 
            className="card-btn gold" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'VERIFY CLEARANCE'}
          </button>
        </form>

        {scanResult && (
          <div className={`scan-banner ${scanResult.success ? 'success' : 'error'}`} style={{
            marginTop: '20px',
            padding: '15px',
            border: scanResult.success ? '1px solid #00f2fe' : '1px solid #ef4444',
            backgroundColor: scanResult.success ? 'rgba(0, 242, 254, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: scanResult.success ? '#00f2fe' : '#ef4444',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            {scanResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
