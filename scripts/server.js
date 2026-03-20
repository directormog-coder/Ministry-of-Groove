/**
 * M.O.G. LOCAL DEV SERVER
 * ========================
 * Run with:  node scripts/server.js
 * Opens at:  http://localhost:3000
 *
 * Mirrors Vercel exactly:
 *   GET /api/config  →  reads .env.local and returns Supabase keys
 *   Everything else  →  served as static files from project root
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');

// ── CORS (so fetch('/api/config') works from the browser) ─────────
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ── /api/config  (same response shape as your Vercel api/config.js) ──
app.get('/api/config', (req, res) => {
    const SUPABASE_URL      = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('\n  ❌  Missing env vars — check your .env.local file\n');
        return res.status(500).json({
            error: 'Missing env vars',
            hint:  'Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local'
        });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
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
        network:     'M.O.G.',
        version:     '2.0.0',
        environment: 'local'
    });
});

// ── Static assets ─────────────────────────────────────────────────
app.use('/css',    express.static(path.join(ROOT, 'css')));
app.use('/js',     express.static(path.join(ROOT, 'js')));
app.use('/assets', express.static(path.join(ROOT, 'assets')));
app.use('/pages',  express.static(path.join(ROOT, 'pages')));
app.use('/scripts',express.static(path.join(ROOT, 'scripts')));

// ── All other routes — serve the file if it exists ────────────────
app.get('*', (req, res) => {
    // Block any accidental /api/* fallthrough
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }

    const filePath = path.join(ROOT, req.path);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }

    // Default → index.html
    const indexPath = path.join(ROOT, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    res.status(404).send('Not found');
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    const urlsOk = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
    console.log('\n  ╔══════════════════════════════════════════════╗');
    console.log('  ║        M.O.G. LOCAL DEV SERVER               ║');
    console.log('  ╠══════════════════════════════════════════════╣');
    console.log(`  ║   🌐  http://localhost:${PORT}                    ║`);
    console.log('  ║   📡  GET /api/config  →  .env.local         ║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log(urlsOk
        ? '\n  ✅  Supabase credentials loaded from .env.local\n'
        : '\n  ⚠️   SUPABASE_URL or SUPABASE_ANON_KEY missing from .env.local\n'
    );
});
