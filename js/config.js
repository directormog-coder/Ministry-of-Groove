/**
 * M.O.G. NETWORK — js/config.js
 * ================================
 * Single source of truth for Supabase credentials.
 * Works on ALL environments:
 *   • Vercel          — credentials served via /api/config (preferred)
 *   • Local dev       — credentials served via node scripts/server.js /api/config
 *   • GitHub Pages    — fallback to hardcoded values below
 *   • Local filesystem— fallback to hardcoded values below
 *
 * This file is loaded SYNCHRONOUSLY before supabase-client.js
 * so the credentials are always available instantly.
 */
(function () {

    // ── HARDCODED FALLBACK ─────────────────────────────────────────
    // These are used when /api/config is unavailable (GitHub Pages,
    // local filesystem, or if the API call fails for any reason).
    // Safe to commit — these are the anon/public keys only.
    window.MOG_FALLBACK_CONFIG = {
        SUPABASE_URL:      'https://fgkljjgxecjmiiaptiug.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0aXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE',
        contacts: {
            email:    'director.mog@gmail.com',
            whatsapp: '0813874921',
            social: {
                tiktok:    'https://tiktok.com/@ministryofgroove',
                facebook:  'https://www.facebook.com/share/1ELj9aECsQ/',
                instagram: 'https://www.instagram.com/ministryofgroove_hq?igsh=Y3Rwc24zcmtsY2xj',
                youtube:   'https://www.youtube.com/@MinistryofGroove-m1q'
            }
        },
        network:     'M.O.G.',
        version:     '2.0.0',
    };

    // ── ENVIRONMENT DETECTION ─────────────────────────────────────
    const hostname = window.location.hostname;
    window.MOG_ENV = {
        isLocal:      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0',
        isGitHub:     hostname.includes('github.io'),
        isVercel:     hostname.includes('vercel.app') || hostname.includes('.vercel.'),
        isFilesystem: window.location.protocol === 'file:',
        hostname,
    };

    // Static hosts can't use /api/config — mark this so supabase-client.js
    // skips the fetch and goes straight to the fallback.
    window.MOG_ENV.isStaticHost = window.MOG_ENV.isGitHub || window.MOG_ENV.isFilesystem;

    console.log(
        `%c[M.O.G.] Config loaded — env: ${
            window.MOG_ENV.isLocal      ? 'LOCAL DEV'      :
            window.MOG_ENV.isGitHub     ? 'GITHUB PAGES'   :
            window.MOG_ENV.isVercel     ? 'VERCEL'         :
            window.MOG_ENV.isFilesystem ? 'FILE SYSTEM'    : 'UNKNOWN'
        }`,
        'color:#d4af37;font-weight:bold;font-family:monospace'
    );

})();
