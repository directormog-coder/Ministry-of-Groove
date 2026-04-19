/**
 * M.O.G. — UNIFIED DATA PERSISTENCE LAYER
 * js/app.js
 *
 * WHY THIS EXISTS:
 * sessionStorage clears every time the tab is refreshed or closed.
 * This module uses localStorage (persists until explicitly cleared)
 * AND syncs to Supabase when connected.
 *
 * HOW TO USE IN ANY PAGE:
 *   <script src="/js/supabase-client.js"></script>
 *   <script src="/js/app.js"></script>
 *   Then call: MOG.get('mogUser'), MOG.set('mogUser','NOVA'), MOG.load()
 */

window.MOG = (() => {

  // ── KEYS ────────────────────────────────────────────────────
  const KEYS = [
    'mogUser','mogEmail','mogRank','mogAvatar',
    'mogPhone','mogBio','mogFavArtist','mogLocation',
    'mogUserId','mogSessions','mogLikes','mogLoggedIn'
  ];

  // ── READ / WRITE ─────────────────────────────────────────────
  // localStorage survives refresh. sessionStorage doesn't.
  function get(key)       { return localStorage.getItem(key); }
  function set(key, val)  { if(val != null) localStorage.setItem(key, val); }
  function remove(key)    { localStorage.removeItem(key); }

  function clear(){
    KEYS.forEach(k => localStorage.removeItem(k));
    // Also clear sessionStorage for compat
    try { sessionStorage.clear(); } catch(e){}
  }

  // ── PROFILE OBJECT ───────────────────────────────────────────
  function getProfile(){
    return {
      id:        get('mogUserId')    || '',
      username:  get('mogUser')      || 'OPERATIVE',
      email:     get('mogEmail')     || '',
      rank:      get('mogRank')      || 'RECRUIT',
      avatar:    get('mogAvatar')    || null,
      phone:     get('mogPhone')     || '',
      bio:       get('mogBio')       || '',
      favArtist: get('mogFavArtist') || '',
      location:  get('mogLocation')  || '',
      sessions:  parseInt(get('mogSessions') || '0'),
      likes:     parseInt(get('mogLikes')    || '0'),
    };
  }

  function setProfile(p){
    if(p.id)        set('mogUserId',    p.id);
    if(p.username)  set('mogUser',      p.username);
    if(p.email)     set('mogEmail',     p.email);
    if(p.rank)      set('mogRank',      p.rank);
    if(p.avatar_url)set('mogAvatar',    p.avatar_url);
    if(p.phone)     set('mogPhone',     p.phone);
    if(p.bio)       set('mogBio',       p.bio);
    if(p.fav_artist)set('mogFavArtist', p.fav_artist);
    if(p.location)  set('mogLocation',  p.location);
    if(p.sessions_attended != null) set('mogSessions', p.sessions_attended);
    if(p.likes_given != null)       set('mogLikes',    p.likes_given);
    set('mogLoggedIn','true');
  }

  // ── AUTH STATE ───────────────────────────────────────────────
  function isLoggedIn(){
    return get('mogLoggedIn') === 'true' && !!get('mogEmail');
  }

  function isAdmin(){
    const rank  = get('mogRank')  || '';
    const email = get('mogEmail') || '';
    return rank === 'ADMIN' || email.toLowerCase() === 'director.mog@gmail.com';
  }

  // ── LOAD FROM SUPABASE ───────────────────────────────────────
  async function load(){
    if(typeof sb === 'undefined') return getProfile();
    try{
      const { data:{ session } } = await sb.auth.getSession();
      if(!session) return getProfile();

      set('mogUserId', session.user.id);
      set('mogEmail',  session.user.email);
      set('mogLoggedIn','true');

      const { data:p } = await sb
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if(p) setProfile(p);
      return getProfile();
    } catch(e){
      console.warn('[MOG] Could not load profile from Supabase:', e.message);
      return getProfile();
    }
  }

  // ── SAVE PROFILE TO SUPABASE ─────────────────────────────────
  async function saveToSupabase(updates){
    if(typeof sb === 'undefined') return false;
    try{
      const userId = get('mogUserId');
      if(!userId) return false;
      const { error } = await sb
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if(error){ console.error('[MOG] Save error:', error.message); return false; }
      // Also update localStorage immediately
      if(updates.username)   set('mogUser',      updates.username);
      if(updates.email)      set('mogEmail',      updates.email);
      if(updates.phone)      set('mogPhone',      updates.phone);
      if(updates.bio)        set('mogBio',        updates.bio);
      if(updates.fav_artist) set('mogFavArtist',  updates.fav_artist);
      if(updates.location)   set('mogLocation',   updates.location);
      if(updates.avatar_url) set('mogAvatar',     updates.avatar_url);
      return true;
    } catch(e){
      console.error('[MOG] saveToSupabase error:', e);
      return false;
    }
  }

  // ── AVATAR UPLOAD ────────────────────────────────────────────
  async function uploadAvatar(file){
    if(typeof sb === 'undefined') return null;
    const userId = get('mogUserId');
    if(!userId) return null;
    const ext  = file.name.split('.').pop();
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await sb.storage
      .from('avatars')
      .upload(path, file, { upsert:true, cacheControl:'3600' });
    if(error){ console.error('[MOG] Avatar upload error:', error.message); return null; }
    const { data:{ publicUrl } } = sb.storage.from('avatars').getPublicUrl(path);
    set('mogAvatar', publicUrl);
    // Update profile table
    await sb.from('profiles').update({ avatar_url:publicUrl }).eq('id', userId);
    return publicUrl;
  }

  // ── SIGN OUT ─────────────────────────────────────────────────
  async function signOut(){
    clear();
    if(typeof sb !== 'undefined'){
      await sb.auth.signOut().catch(()=>{});
    }
    // Determine path to login.html (works from root or /pages/)
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.replace(isInPages ? '../login.html' : 'login.html');
  }

  // ── AUTH GUARD ───────────────────────────────────────────────
  // Call this at top of any protected page
  async function requireAuth(redirectIfNoAuth = true){
    if(typeof sb !== 'undefined'){
      try{
        const { data:{ session } } = await sb.auth.getSession();
        if(session){
          // Refresh localStorage from Supabase
          await load();
          return true;
        }
      } catch(e){}
    }
    // Fallback: check localStorage
    if(isLoggedIn()) return true;
    if(redirectIfNoAuth){
      const isInPages = window.location.pathname.includes('/pages/');
      window.location.replace(isInPages ? '../login.html' : 'login.html');
    }
    return false;
  }

  // ── DIRECTOR GUARD ───────────────────────────────────────────
  async function requireDirector(){
    const authed = await requireAuth(false);
    if(!authed || !isAdmin()){
      const isInPages = window.location.pathname.includes('/pages/');
      window.location.replace(isInPages ? '../login.html' : 'login.html');
      return false;
    }
    return true;
  }

  // ── TOAST HELPER (works on all pages) ────────────────────────
  function toast(msg, duration=3000){
    let el = document.getElementById('mog-toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'mog-toast';
      el.style.cssText = [
        'position:fixed','bottom:88px','left:50%','transform:translateX(-50%)',
        'background:rgba(10,25,41,0.97)','border:1px solid rgba(0,229,204,0.4)',
        'border-radius:8px','padding:12px 24px',
        "font-family:'Orbitron',sans-serif",'font-size:10px','color:#00E5CC',
        'letter-spacing:2px','z-index:9999','white-space:nowrap',
        'backdrop-filter:blur(12px)','box-shadow:0 0 20px rgba(0,229,204,0.2)',
        'display:none'
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    clearTimeout(el._timer);
    el._timer = setTimeout(()=>{ el.style.display='none'; }, duration);
  }

  // ── INIT — migrate old sessionStorage data to localStorage ───
  (function migrate(){
    try{
      const keys = ['mogUser','mogEmail','mogRank','mogAvatar','mogPhone',
                    'mogBio','mogFavArtist','mogLocation','mogUserId'];
      keys.forEach(k=>{
        const val = sessionStorage.getItem(k);
        if(val && !localStorage.getItem(k)){
          localStorage.setItem(k, val);
        }
      });
    } catch(e){}
  })();

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    get, set, remove, clear,
    getProfile, setProfile,
    isLoggedIn, isAdmin,
    load, saveToSupabase, uploadAvatar,
    signOut, requireAuth, requireDirector,
    toast
  };

})();
