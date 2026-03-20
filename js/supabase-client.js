/**
 * M.O.G. NETWORK — Supabase Client
 * =================================
 * Fetches credentials from /api/config.js then initializes the Supabase
 * client. Exposes it globally as both:
 *   window.sb             → used by index.html, directorate.html
 *   window.supabaseClient → legacy alias kept for backwards compatibility
 *
 * Load order in every HTML page must be:
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="/js/supabase-client.js"></script>
 *   3. Your Alpine / page scripts
 */

(async () => {

    // ── Helper: show a visible error banner on screen ─────────────
    const showFatalBanner = (message) => {
        const mount = () => {
            if (document.getElementById('mog-fatal')) return;
            const el = document.createElement('div');
            el.id = 'mog-fatal';
            el.style.cssText = [
                'position:fixed', 'top:20px', 'left:50%',
                'transform:translateX(-50%)', 'z-index:99999',
                'background:#7f1d1d', 'border:1px solid rgba(239,68,68,0.5)',
                'color:#fff', 'padding:14px 24px', 'border-radius:12px',
                'font-family:Share Tech Mono,monospace', 'font-size:0.78rem',
                'letter-spacing:0.08em', 'text-transform:uppercase',
                'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
                'max-width:90vw', 'text-align:center', 'line-height:1.6'
            ].join(';');
            el.textContent = message;
            document.body.appendChild(el);
        };
        document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);
    };

    // ── Step 1: Fetch config from Vercel serverless function ──────
    let config;
    try {
        const res = await fetch('/api/config', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'  // Never use a cached version of credentials
        });

        if (!res.ok) {
            throw new Error(`Config API responded with HTTP ${res.status}`);
        }

        config = await res.json();

        // Validate the response has what we need
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            throw new Error('Config response missing SUPABASE_URL or SUPABASE_ANON_KEY');
        }

    } catch (err) {
        console.error('[M.O.G.] Config fetch failed:', err.message);
        showFatalBanner('⚠ Config load failed — check /api/config is deployed');
        window.sb = null;
        window.supabaseClient = null;
        return;
    }

    // ── Step 2: Store on window.CONFIG for other scripts ─────────
    window.CONFIG = {
        SUPABASE_URL:      config.SUPABASE_URL,
        SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY,
        contacts:          config.contacts  || {},
        network:           config.network   || 'M.O.G.',
        version:           config.version   || '2.0.0'
    };

    // ── Step 3: Guard — Supabase CDN must be loaded first ─────────
    if (typeof supabase === 'undefined') {
        const msg = 'Supabase CDN not loaded. Ensure the CDN <script> tag comes BEFORE supabase-client.js';
        console.error('[M.O.G.]', msg);
        showFatalBanner('⚠ Supabase CDN missing — check script order');
        window.sb = null;
        window.supabaseClient = null;
        return;
    }

    // ── Step 4: Create the client ─────────────────────────────────
    try {
        const client = supabase.createClient(
            config.SUPABASE_URL,
            config.SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken:   true,   // Keeps session alive automatically
                    persistSession:     true,   // Survives page refresh
                    detectSessionInUrl: true    // Handles OAuth redirects
                }
            }
        );

        // Export under both names
        window.sb             = client;
        window.supabaseClient = client;

        console.log(
            '%c[M.O.G.] Supabase connected ✓',
            'color:#00d4aa;font-weight:bold;font-family:monospace;'
        );

    } catch (err) {
        console.error('[M.O.G.] createClient failed:', err.message);
        showFatalBanner('⚠ Supabase client init failed — see console');
        window.sb = null;
        window.supabaseClient = null;
    }

})();
