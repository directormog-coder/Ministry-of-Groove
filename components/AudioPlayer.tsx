import { useState } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#0a101d',
      borderTop: '1px solid #d4af37',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 900,
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#00f2fe' }}>🎵</span>
        <div>
          <div style={{ fontSize: '10px', color: '#ffffff', fontWeight: 'bold' }}>LIVE STREAM AUDIO</div>
          <div style={{ fontSize: '9px', color: '#d4af37' }}>MINISTRY OF GROOVE RADIO</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsPlaying((prev) => !prev)}
        style={{
          backgroundColor: isPlaying ? '#ef4444' : '#00f2fe',
          border: 'none',
          color: '#050811',
          padding: '6px 12px',
          fontSize: '10px',
          fontWeight: 'bold',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isPlaying ? 'PAUSE' : 'PLAY'}
      </button>
    </div>
  );
}
