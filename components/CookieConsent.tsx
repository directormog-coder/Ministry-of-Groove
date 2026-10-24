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
      padding: '12px',
      zIndex: 1000,
      fontFamily: 'monospace',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
    }}>
      <div style={{ color: '#d4af37', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
        🍪 COOKIE & POPIA CONSENT
      </div>
      <div style={{ color: '#8e9bae', fontSize: '10px', lineHeight: '1.4', marginBottom: '10px' }}>
        M.O.G. uses essential local session tokens to keep your dossier authenticated and save preferences. Read our{' '}
        <Link href="/privacy" style={{ color: '#00f2fe', textDecoration: 'underline' }}>Privacy Policy</Link> and{' '}
        <Link href="/cookies" style={{ color: '#00f2fe', textDecoration: 'underline' }}>Cookie Policy</Link>.
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: '#00f2fe',
            border: 'none',
            color: '#050811',
            padding: '6px 12px',
            fontSize: '10px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          ✓ ACCEPT & SYNCHRONIZE
        </button>
      </div>
    </div>
  );
}
