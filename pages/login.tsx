import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/directorate` }
    });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (data.session) {
      if (email.includes('director') || email === 'director.mog@gmail.com') {
        router.push('/directorate');
      } else {
        router.push('/dispatch');
      }
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>M.O.G. — Operative Access</title>
      </Head>

      <div className="top-status">
        <span className="dot active"></span> ENCRYPTION ACTIVE
        <span className="subtitle">CLASSIFIED - OPERATIVE ACCESS ONLY</span>
      </div>

      <div className="auth-card">
        <div className="logo-container">
          <img src="/logo.png" alt="MOG Emblem" className="mog-logo" />
          <h1 className="title">MINISTRY OF GROOVE</h1>
          <p className="tagline">DECRYPTING THE CULTURE. SYNCHRONIZING THE GRID.</p>
        </div>

        <div className="form-box">
          <div className="box-title">- OPERATIVE AUTHENTICATION -</div>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
            <span className="g-icon">G</span> INFILTRATE WITH GOOGLE
          </button>

          <div className="divider">OR</div>

          <form onSubmit={handleEmailLogin}>
            <label>OPERATIVE ID (EMAIL)</label>
            <input 
              type="email" 
              placeholder="director.mog@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            <label>CIPHER (PASSWORD)</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'INITIATE ACCESS'}
            </button>
          </form>

          <div className="footer-links">
            NEW RECRUIT? <a href="#request">REQUEST CLEARANCE</a>
          </div>
        </div>
      </div>

      <div className="page-footer">
        TOP SECRET // M.O.G. NETWORK // EST. 2026
      </div>
    </div>
  );
}
