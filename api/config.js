/**
 * M.O.G. CONFIG API — api/config.js
 * =====================================
 * Vercel Serverless Function v6.0.0
 * * This function serves non-sensitive configuration and Supabase 
 * public keys to the frontend.
 * * SECURITY NOTE: 
 * Mux Token Secrets and Supabase Service Roles are NEVER 
 * exposed here. They are used only in api/broadcast.js.
 */

export default function handler(req, res) {

    // ── CORS — SECURITY PROTOCOL ─────────────────────────────────
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

    // ── Preflight Handshake ──────────────────────────────────────
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ── Method Restriction ───────────────────────────────────────
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Environment Variable Check ───────────────────────────────
    const SUPABASE_URL      = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('[M.O.G. CONFIG] CRITICAL: Supabase Environment Variables Missing!');
        return res.status(500).json({
            error: 'System configuration failure',
            hint:  'Check Vercel Dashboard → Settings → Environment Variables',
        });
    }

    // ── Response Payload ─────────────────────────────────────────
    return res.status(200).json({
        /* Database Intel */
        SUPABASE_URL,
        SUPABASE_ANON_KEY,

        /* Broadcast Metadata */
        broadcast: {
            provider: 'MUX',
            region: 'Global/South Africa',
            latencyMode: 'Low-Latency (LL-HLS)',
            rtmpEndpoint: 'rtmps://global-live.mux.com:443/app'
        },

        /* High-Command Contacts */
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

        /* System Versioning */
        network: 'M.O.G. OPERATIVE NETWORK',
        version: '6.0.0',
        build: 'NCC-MASTER-BCAST',
        status: 'OPERATIONAL'
    });
}
