import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import AudioPlayer from '../components/AudioPlayer';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 120px)', paddingBottom: '80px' }}>
        <Component {...pageProps} />
      </main>
      <AudioPlayer />
      <CookieConsent />
    </>
  );
}
