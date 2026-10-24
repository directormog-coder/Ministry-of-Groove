import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <CookieConsent />
      
      {/* Global Legal Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px 10px 100px 10px',
        backgroundColor: '#050811',
        borderTop: '1px solid #1e293b',
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#8e9bae'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <Link href="/privacy" style={{ color: '#8e9bae' }}>PRIVACY POLICY</Link>
          <span>•</span>
          <Link href="/terms" style={{ color: '#8e9bae' }}>TERMS OF SERVICE</Link>
          <span>•</span>
          <Link href="/refunds" style={{ color: '#8e9bae' }}>REFUND POLICY</Link>
          <span>•</span>
          <Link href="/cookies" style={{ color: '#8e9bae' }}>COOKIE POLICY</Link>
        </div>
        <div>MINISTRY OF GROOVE © 2026 — ALL RIGHTS RESERVED</div>
      </footer>
    </>
  );
}
