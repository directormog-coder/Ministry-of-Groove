/**
 * 📀 MINISTRY OF GROOVE | AUTH ENGINE v5.2
 * Secure Gatekeeping & Database Synchronization
 * 
 * SECURITY: No Apple Sign In - Email/Google OAuth only
 * Build: {{APP_VERSION}} | {{BUILD_TIMESTAMP}}
 */

// ==========================================
// SECURE CONFIGURATION (INJECTED AT BUILD)
// ==========================================
const CONFIG = {
    SUPABASE_URL: '{{SUPABASE_URL}}',
    SUPABASE_ANON_KEY: '{{SUPABASE_ANON_KEY}}',
    GOOGLE_CLIENT_ID: '{{GOOGLE_CLIENT_ID}}',
    APP_VERSION: '{{APP_VERSION}}',
    BUILD_HASH: '{{BUILD_HASH}}'
};

// Validate configuration
if (CONFIG.SUPABASE_ANON_KEY.includes('{{') || !CONFIG.SUPABASE_ANON_KEY) {
    console.error('[MOG SECURITY] Build injection failed - using environment fallback');
    // Development fallback only - remove in production
    CONFIG.SUPABASE_URL = CONFIG.SUPABASE_URL || 'https://fgkljjgxecjmiiaptiug.supabase.co';
}

// Initialize Supabase with security options
let sb;
try {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing');
    }
    
    sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storageKey: 'mog_auth_session',
            storage: localStorage
        },
        global: {
            headers: {
                'X-Client-Info': 'ministry-of-groove@' + CONFIG.APP_VERSION
            }
        }
    });
    
    console.log(`[MOG AUTH] Engine initialized v${CONFIG.APP_VERSION}`);
} catch (error) {
    console.error('[MOG AUTH] Critical failure:', error);
    document.body.innerHTML = '<div style="color:red;text-align:center;padding:50px;">AUTHENTICATION SERVICE UNAVAILABLE</div>';
    throw error;
}

// ==========================================
// MAIN AUTH ENGINE
// ==========================================
function nccMasterEngine() {
    return {
        authForm: { id: '', pass: '' },
        isLoading: false,
        sessionCheckInterval: null,

        async init() {
            // Security: Check for active session
            const { data: { session } } = await sb.auth.getSession();
            
            if (session) {
                // Validate session hasn't expired
                const expiresAt = session.expires_at;
                if (expiresAt && Date.now() / 1000 > expiresAt) {
                    await this.logout();
                    return;
                }
                await this.syncRole(session.user);
            }
            
            // Start session validation
            this.startSessionValidation();
            
            if (window.lucide) lucide.createIcons();
        },

        // EMAIL/PASSWORD AUTHENTICATION
        async loginManual() {
            if (!this.authForm.id || !this.authForm.pass) {
                alert("ACCESS DENIED: Credentials required");
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.authForm.id)) {
                alert("ACCESS DENIED: Invalid operative ID format");
                return;
            }

            this.isLoading = true;
            
            try {
                const { data, error } = await sb.auth.signInWithPassword({
                    email: this.authForm.id.trim().toLowerCase(),
                    password: this.authForm.pass
                });

                if (error) throw error;
                
                // Security: Clear password from memory
                this.authForm.pass = '';
                document.querySelector('input[type="password"]').value = '';
                
                await this.syncRole(data.user);
            } catch (err) {
                alert("ACCESS DENIED: " + err.message);
                this.authForm.pass = '';
            } finally {
                this.isLoading = false;
            }
        },

        // GOOGLE OAUTH (BIOMETRIC UPLINK)
        async loginWithGoogle() {
            console.log("📡 INITIATING BIOMETRIC UPLINK...");
            this.isLoading = true;
            
            try {
                const { error } = await sb.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/auth/callback',
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent'
                        }
                    }
                });
                
                if (error) throw error;
            } catch (error) {
                alert("UPLINK ERROR: " + error.message);
                this.isLoading = false;
            }
        },

        // MAGIC LINK AUTHENTICATION (Passwordless)
        async sendMagicLink(email) {
            if (!email) {
                alert("ACCESS DENIED: Email required");
                return;
            }

            this.isLoading = true;
            
            try {
                const { error } = await sb.auth.signInWithOtp({
                    email: email.trim().toLowerCase(),
                    options: {
                        emailRedirectTo: window.location.origin + '/hub.html'
                    }
                });
                
                if (error) throw error;
                alert("SUCCESS: Secure link dispatched to your terminal");
            } catch (err) {
                alert("TRANSMISSION_FAILED: " + err.message);
            } finally {
                this.isLoading = false;
            }
        },

        // ROLE SYNCHRONIZATION
        async syncRole(user) {
            if (!user) {
                console.error('[MOG AUTH] No user provided for sync');
                return;
            }

            try {
                // Fetch user profile from database
                const { data: profile, error } = await sb
                    .from('profiles')
                    .select('role, clearance_level, status')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                // Determine role with fallback hierarchy
                const role = profile?.role || 
                           user.user_metadata?.role || 
                           (user.email === 'director.mog@gmail.com' ? 'director' : 'operative');
                
                const clearance = profile?.clearance_level || 'standard';

                // Security: Store minimal data
                localStorage.setItem('userRole', role);
                localStorage.setItem('userClearance', clearance);
                localStorage.setItem('sessionValid', 'true');

                // Audit log
                await this.logAccess(user.id, role, 'login');

                // Redirect based on role
                this.redirectByRole(role);

            } catch (err) {
                console.warn("[MOG AUTH] Profile sync failed, using defaults:", err);
                localStorage.setItem('userRole', 'operative');
                window.location.href = 'index.html';
            }
        },

        // REDIRECT LOGIC
        redirectByRole(role) {
            const routes = {
                'director': 'pages/directorate.html',
                'admin': 'pages/admin.html',
                'operative': 'hub.html',
                'guest': 'index.html'
            };

            const destination = routes[role] || 'index.html';
            console.log(`[MOG AUTH] Redirecting ${role} to ${destination}`);
            window.location.href = destination;
        },

        // ACCESS LOGGING (Audit trail)
        async logAccess(userId, role, action) {
            try {
                await sb.from('access_logs').insert({
                    user_id: userId,
                    role: role,
                    action: action,
                    timestamp: new Date().toISOString(),
                    user_agent: navigator.userAgent.substring(0, 255),
                    ip_hash: 'client-side' // Server will populate real IP
                });
            } catch (e) {
                // Silent fail - don't block auth for logging errors
                console.warn('[MOG AUTH] Logging failed:', e);
            }
        },

        // SESSION VALIDATION
        startSessionValidation() {
            // Check session every 5 minutes
            this.sessionCheckInterval = setInterval(async () => {
                const { data: { session } } = await sb.auth.getSession();
                if (!session) {
                    console.log('[MOG AUTH] Session expired, logging out');
                    await this.logout();
                }
            }, 300000); // 5 minutes
        },

        // SECURE LOGOUT
        async logout() {
            if (this.sessionCheckInterval) {
                clearInterval(this.sessionCheckInterval);
            }

            try {
                // Log the logout
                const { data: { user } } = await sb.auth.getUser();
                if (user) {
                    await this.logAccess(user.id, localStorage.getItem('userRole') || 'unknown', 'logout');
                }
            } catch (e) {
                // Ignore logging errors on logout
            }

            await sb.auth.signOut();
            
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear any cached data
            this.authForm = { id: '', pass: '' };
            
            window.location.href = 'login.html';
        },

        // UTILITY: Check if user has required clearance
        hasClearance(requiredLevel) {
            const levels = { 'guest': 0, 'operative': 1, 'admin': 2, 'director': 3 };
            const userLevel = levels[localStorage.getItem('userRole')] || 0;
            return userLevel >= (levels[requiredLevel] || 0);
        }
    }
}

// ==========================================
// SECURITY: Global error handling
// ==========================================
window.addEventListener('error', (e) => {
    console.error('[MOG SECURITY] Runtime error:', e.error);
});

// Prevent back-button cache issues
window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};
