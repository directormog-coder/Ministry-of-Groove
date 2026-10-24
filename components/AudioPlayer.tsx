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
      borderTop: '1px solid #1e293b',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 900,
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>🎵</span>
        <div>
          <div style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>M.O.G. STREAM INTEL</div>
          <div style={{ fontSize: '9px', color: '#00f2fe' }}>EDITORIAL COMMENTARY FEED</div>
        </div>
      </div>
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          backgroundColor: isPlaying ? '#ef4444' : '#00f2fe',
          border: 'none',
          color: '#050811',
          padding: '4px 10px',
          fontSize: '9px',
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
