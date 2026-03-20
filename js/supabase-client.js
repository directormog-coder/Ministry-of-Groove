/**
 * M.O.G. NETWORK — Supabase Client
 * =================================
 * Works on BOTH environments automatically:
 *
 *   localhost:3000  →  fetches from Express /api/config (reads .env.local)
 *   Vercel          →  fetches from /api/config serverless function
 *
 * Exports:
 *   window.sb             → used by index.html, directorate.html
 *   window.supabaseClient → legacy alias (login.html, other pages)
 *
 * Script load order in EVERY HTML page:
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="/js/supabase-client.js"></script>
 *   3. Alpine / page scripts (defer)
 */

(async () => {

    // ── Visible error banner ──────────────────────────────────────
    const showBanner = (msg) => {
        const mount = () => {
            if (document.getElementById('mog-fatal')) return;
            const el = document.createElement('div');
            el.id = 'mog-fatal';
            el.style.cssText = [
                'position:fixed', 'top:20px', 'left:50%',
                'transform:translateX(-50%)', 'z-index:99999',
                'background:#7f1d1d', 'border:1px solid rgba(239,68,68,0.4)',
                'color:#fff', 'padding:14px 24px', 'border-radius:12px',
                'font-family:Share Tech Mono,monospace', 'font-size:0.78rem',
                'letter-spacing:0.08em', 'text-transform:uppercase',
                'box-shadow:0 8px 32px rgba(0,0,0,0.7)',
                'max-width:90vw', 'text-align:center', 'line-height:1.8'
            ].join(';');
            el.textContent = msg;
            document.body.appendChild(el);
        };
        document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);
    };

    // ── Detect environment ────────────────────────────────────────
    const isLocal = ['localhost', '127.0.0.1', '0.0.0.0']
        .includes(window.location.hostname);

    // On localhost the server IS on :3000 so the URL is the same origin
    // On Vercel it's a relative path
    const configUrl = '/api/config';

    // ── Fetch config ──────────────────────────────────────────────
    let SUPABASE_URL, SUPABASE_ANON_KEY;

    try {
        const res = await fetch(configUrl, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error(`Config API returned HTTP ${res.status}`);
        }

        const cfg = await res.json();
        SUPABASE_URL      = cfg.SUPABASE_URL;
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY;

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Response is missing SUPABASE_URL or SUPABASE_ANON_KEY');
        }

    } catch (err) {
        console.error('[M.O.G.] Config fetch failed:', err.message);

        if (isLocal) {
            showBanner(
                '⚠ Local server not running\n' +
                'Open a terminal and run:\n' +
                'node scripts/server.js'
            );
        } else {
            showBanner(
                '⚠ Config API failed\n' +
                'Check SUPABASE_URL + SUPABASE_ANON_KEY\n' +
                'in Vercel Dashboard → Settings → Env Vars'
            );
        }

        window.sb = null;
        window.supabaseClient = null;
        return;
    }

    // ── Guard: Supabase CDN must be loaded first ──────────────────
    if (typeof supabase === 'undefined') {
        console.error('[M.O.G.] Supabase CDN not loaded — wrong script order in <head>');
        showBanner('⚠ Supabase CDN missing — check <head> script tag order');
        window.sb = null;
        window.supabaseClient = null;
        return;
    }

    // ── Create client ─────────────────────────────────────────────
    try {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken:   true,
                persistSession:     true,
                detectSessionInUrl: true
            }
        });

        window.sb             = client;  // index.html, directorate.html
        window.supabaseClient = client;  // login.html, legacy pages

        // Store full config for other scripts that need it
        window.CONFIG = {
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            environment: isLocal ? 'local' : 'production'
        };

        console.log(
            `%c[M.O.G.] Supabase connected ✓  (${isLocal ? 'LOCAL' : 'PRODUCTION'})`,
            'color:#00d4aa;font-weight:bold;font-family:monospace;font-size:1rem'
        );

    } catch (err) {
        console.error('[M.O.G.] createClient failed:', err.message);
        showBanner('⚠ Supabase init failed — see browser console');
        window.sb = null;
        window.supabaseClient = null;
    }

})();
