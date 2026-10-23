import Head from 'next/head';
import { useRouter } from 'next/router';
import AudioPlayer from '../components/AudioPlayer';

export default function ShuttleRadar() {
  const router = useRouter();

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | SHUTTLE & VENUE RADAR</title>
      </Head>

      <div className="dispatch-header">
        <button className="back-btn" onClick={() => router.push('/directorate')}>←</button>
        <h1 className="header-title">SHUTTLE & VENUE RADAR</h1>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">GPS ACTIVE</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', textAlign: 'center', padding: '30px', backgroundColor: '#050811', border: '1px solid #00f2fe' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🗺️</div>
        <h3 style={{ color: '#00f2fe', fontFamily: 'monospace', fontSize: '15px', marginBottom: '8px' }}>
          OFFICIAL MOG SHUTTLE FLEET // eMalahleni Route
        </h3>
        <p style={{ color: '#8e9bae', fontSize: '12px', lineHeight: '1.5', marginBottom: '20px' }}>
          Shuttle Bus #01 is currently in transit along Watermeyer Street toward Klipfontein. Estimated arrival at Main Arena: 8 mins.
        </p>

        <div style={{ padding: '15px', backgroundColor: '#0a101d', border: '1px solid #1e293b', textAlign: 'left', fontFamily: 'monospace', fontSize: '11px', color: '#d4af37' }}>
          <div>📍 Pickup Point 1: Witbank Highveld Mall Main Entrance</div>
          <div style={{ marginTop: '6px' }}>📍 Pickup Point 2: Kwa-Guqa Taxi Rank Zone B</div>
          <div style={{ marginTop: '6px' }}>📍 Venue Drop-off: Main Arena VIP Gate C</div>
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
