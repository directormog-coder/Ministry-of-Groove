(function () {
  const fallback = window.MOG_FALLBACK_CONFIG || {};
  const env = window.MOG_ENV || {};

  async function resolveConfig() {
    if (env.isStaticHost || env.isFilesystem) {
      return fallback;
    }

    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.SUPABASE_URL && data.SUPABASE_ANON_KEY) {
          return data;
        }
      }
    } catch (error) {
      console.warn('[M.O.G.] /api/config unavailable, falling back to embedded config.', error);
    }

    return fallback;
  }

  async function bootstrap() {
    const config = await resolveConfig();
    const url = config.SUPABASE_URL || fallback.SUPABASE_URL || '';
    const key = config.SUPABASE_ANON_KEY || fallback.SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      console.warn('[M.O.G.] Supabase credentials are not configured. Auth features will be disabled until env vars are set.');
      window.sb = null;
      window.supabaseClient = null;
      return;
    }

    if (!window.supabase) {
      console.warn('[M.O.G.] Supabase SDK was not loaded before this script.');
      window.sb = null;
      window.supabaseClient = null;
      return;
    }

    window.supabaseClient = window.supabase.createClient(url, key);
    window.sb = window.supabaseClient;
    console.log('[M.O.G.] Supabase client initialized.');
  }

  bootstrap();
})();
