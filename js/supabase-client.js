/**
 * M.O.G. NETWORK — js/supabase-client.js
 * =========================================
 * Initializes window.sb (the Supabase client) for every page.
 *
 * Strategy (in order):
 *   1. If already initialized (window.sb exists), do nothing.
 *   2. On static hosts (GitHub Pages, file://), use fallback immediately.
 *   3. On server-backed hosts (Vercel, local dev), fetch /api/config.
 *      If that fetch fails for any reason, fall back to hardcoded values.
 *   4. Never set window.sb = null — a failed config fetch degrades
 *      gracefully to the fallback rather than killing the app.
 *
 * Load order in every HTML page:
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="/js/config.js"></script>          ← sync, sets MOG_FALLBACK_CONFIG
 *   3. <script src="/js/supabase-client.js"></script> ← async IIFE, sets window.sb
 *   4. Alpine / page scripts (defer)
 */

(async () => {

    // ── Guard: already initialized ────────────────────────────────
    if (window.sb && window.supabaseClient) {
        console.log('%c[M.O.G.] Supabase already initialized — skipping', 'color:#00d4aa;font-family:monospace');
        return;
    }

    // ── Guard: Supabase CDN must be present ───────────────────────
    if (typeof supabase === 'undefined') {
        _showBanner('⚠ Supabase CDN not loaded\nCheck script order in <head>');
        window.sb = null;
        window.supabaseClient = null;
        return;
    }

    const fallback = window.MOG_FALLBACK_CONFIG;
    const env      = window.MOG_ENV || {};

    // ── Visible error banner helper ───────────────────────────────
    function _showBanner(msg) {
        const mount = () => {
            if (document.getElementById('mog-fatal')) return;
            const el = document.createElement('div');
            el.id = 'mog-fatal';
            el.style.cssText = [
                'position:fixed','top:20px','left:50%','transform:translateX(-50%)',
                'z-index:99999','background:#7f1d1d',
                'border:1px solid rgba(239,68,68,0.4)','color:#fff',
                'padding:14px 24px','border-radius:12px',
                'font-family:Share Tech Mono,monospace','font-size:0.78rem',
                'letter-spacing:0.08em','text-transform:uppercase',
                'box-shadow:0 8px 32px rgba(0,0,0,0.7)',
                'max-width:90vw','text-align:center','line-height:1.8',
                'white-space:pre-line'
            ].join(';');
            el.textContent = msg;
            document.body.appendChild(el);
        };
        document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);
    }

    // ── Helper: create and register client ───────────────────────
    function _createClient(url, key, source) {
        try {
            const client = supabase.createClient(url, key, {
                auth: {
                    autoRefreshToken:   true,
                    persistSession:     true,
                    detectSessionInUrl: true,
                }
            });

            window.sb             = client;
            window.supabaseClient = client;
            window.CONFIG = {
                SUPABASE_URL:  url,
                SUPABASE_ANON_KEY: key,
                environment:   source,
                ...( fallback || {} )
            };

            console.log(
                `%c[M.O.G.] Supabase connected ✓  (${source})`,
                'color:#00d4aa;font-weight:bold;font-family:monospace;font-size:0.95rem'
            );
            return true;
        } catch (err) {
            console.error('[M.O.G.] createClient failed:', err.message);
            return false;
        }
    }

    // ── STATIC HOST: skip fetch, use fallback immediately ─────────
    if (env.isStaticHost) {
        if (!fallback?.SUPABASE_URL || !fallback?.SUPABASE_ANON_KEY) {
            _showBanner('⚠ MOG_FALLBACK_CONFIG missing\nLoad /js/config.js before supabase-client.js');
            window.sb = null; window.supabaseClient = null;
            return;
        }
        _createClient(fallback.SUPABASE_URL, fallback.SUPABASE_ANON_KEY, env.isGitHub ? 'github-pages' : 'filesystem');
        return;
    }

    // ── SERVER HOST: try /api/config, fall back on any error ──────
    let SUPABASE_URL, SUPABASE_ANON_KEY;

    try {
        const res = await fetch('/api/config', { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const cfg = await res.json();
        SUPABASE_URL      = cfg.SUPABASE_URL;
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY;

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Response missing required keys');
        }

        _createClient(SUPABASE_URL, SUPABASE_ANON_KEY, env.isLocal ? 'local-dev' : 'vercel');

    } catch (err) {
        console.warn(`[M.O.G.] /api/config failed (${err.message}) — using fallback credentials`);

        // Graceful degradation — never leave the app broken
        if (fallback?.SUPABASE_URL && fallback?.SUPABASE_ANON_KEY) {
            _createClient(fallback.SUPABASE_URL, fallback.SUPABASE_ANON_KEY, 'fallback');
        } else {
            // Truly no credentials available
            _showBanner(
                env.isLocal
                    ? '⚠ Local server not running\nRun:  node scripts/server.js'
                    : '⚠ Config API failed\nCheck Vercel → Settings → Environment Variables'
            );
            window.sb = null;
            window.supabaseClient = null;
        }
    }

})();
