/**
 * M.O.G. CONFIG API — api/config.js
 * =====================================
 * Vercel Serverless Function.
 * Serves Supabase credentials from environment variables to the frontend.
 *
 * Set these in Vercel Dashboard → Project → Settings → Environment Variables:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *
 * This function is the PREFERRED credential source on Vercel and local dev
 * (via `vercel dev` or `node scripts/server.js`).
 * On static hosts (GitHub Pages, file://), js/config.js fallback is used instead.
 *
 * Security:
 *   - Only ANON key is served (never the service_role key)
 *   - CORS restricted to known origins
 *   - GET only, no caching
 */

export default function handler(req, res) {

    // ── CORS ──────────────────────────────────────────────────────
    const origin = req.headers.origin || '';
    const ALLOWED_ORIGINS = [
        'https://ministry-of-groove.vercel.app',
        'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5500',
    ];
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    res.setHeader('Access-Control-Allow-Origin',  allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary',                         'Origin');
    res.setHeader('Content-Type',                 'application/json');
    res.setHeader('Cache-Control',                'no-store, no-cache, must-revalidate');

    // ── Preflight ─────────────────────────────────────────────────
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ── GET only ──────────────────────────────────────────────────
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Credentials from env ──────────────────────────────────────
    const SUPABASE_URL      = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('[M.O.G.] CRITICAL: SUPABASE_URL or SUPABASE_ANON_KEY env vars are missing!');
        return res.status(500).json({
            error: 'Server configuration error',
            hint:  'Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Dashboard → Settings → Environment Variables',
        });
    }

    // ── Response ──────────────────────────────────────────────────
    return res.status(200).json({
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        contacts: {
            email:    'director.mog@gmail.com',
            whatsapp: '0813874921',
            social: {
                tiktok:    'https://tiktok.com/@ministryofgroove',
                facebook:  'https://www.facebook.com/share/1ELj9aECsQ/',
                instagram: 'https://www.instagram.com/ministryofgroove_hq?igsh=Y3Rwc24zcmtsY2xj',
                youtube:   'https://www.youtube.com/@MinistryofGroove-m1q',
            },
        },
        network: 'M.O.G.',
        version: '2.0.0',
    });
}
