import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mog_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mog_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '70px',
      left: '12px',
      right: '12px',
      backgroundColor: '#0a101d',
      border: '1px solid #d4af37',
      borderRadius: '6px',
      padding: '14px',
      zIndex: 1000,
      fontFamily: 'monospace',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
    }}>
      <div style={{ color: '#d4af37', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
        🍪 COOKIE & PRIVACY NOTICE
      </div>
      <div style={{ color: '#94a3b8', fontSize: '10px', lineHeight: '1.4', marginBottom: '12px' }}>
        Ministry of Groove uses essential cookies to save your preferences and keep your session secure. Read our{' '}
        <Link href="/privacy" style={{ color: '#00f2fe', textDecoration: 'underline' }}>Privacy Policy</Link> and{' '}
        <Link href="/cookies" style={{ color: '#00f2fe', textDecoration: 'underline' }}>Cookie Policy</Link>.
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: '#d4af37',
            border: 'none',
            color: '#050811',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          ACCEPT & CONTINUE
        </button>
      </div>
    </div>
  );
}
