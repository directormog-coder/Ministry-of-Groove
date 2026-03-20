/**
 * M.O.G. Config Provider — Vercel Serverless Function
 * =====================================================
 * Serves credentials from Vercel Environment Variables to the frontend.
 * Keys returned as SUPABASE_URL + SUPABASE_ANON_KEY so supabase-client.js
 * can read them directly from window.CONFIG without remapping.
 *
 * Set these in Vercel Dashboard → Project → Settings → Environment Variables:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 */

export default function handler(req, res) {

    // ── Security headers ──────────────────────────────────────────
    // Restrict to your own domain in production
    const origin = req.headers.origin || '';
    const allowed = [
        'https://ministry-of-groove.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:5500',  // Live Server (VS Code)
        'http://localhost:5500'
    ];

    const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate'); // Never cache credentials

    // ── Preflight ─────────────────────────────────────────────────
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ── Only allow GET ────────────────────────────────────────────
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Read from Vercel env vars (set these in the dashboard) ────
    const SUPABASE_URL      = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    // Guard: if env vars aren't set, fail loudly so you notice in logs
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('[M.O.G.] CRITICAL: SUPABASE_URL or SUPABASE_ANON_KEY env vars are missing!');
        return res.status(500).json({
            error: 'Server configuration error — env vars not set',
            hint:  'Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Dashboard → Settings → Environment Variables'
        });
    }

    // ── Respond ───────────────────────────────────────────────────
    // Key names match exactly what supabase-client.js reads from window.CONFIG
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
                youtube:   'https://www.youtube.com/@MinistryofGroove-m1q'
            }
        },
        network: 'M.O.G.',
        version: '2.0.0'
    });
}
