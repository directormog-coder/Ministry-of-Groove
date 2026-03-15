/**
 * 📀 MINISTRY OF GROOVE | AUTH ENGINE v5.1
 * Restoration of Database-First Authentication
 */

const SecureAuth = {
    // 1. DATABASE LOGIN: Checks your actual uploaded Supabase users
    async attemptManualLogin(email, password) {
        try {
            const { data, error } = await sb.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Success: Fetch the profile to see if they are a Director
            const { data: profile } = await sb.from('profiles').select('role').eq('id', data.user.id).single();
            
            const role = profile?.role || 'operative';
            localStorage.setItem('userRole', role);
            
            window.location.href = role === 'director' ? 'pages/directorate.html' : 'index.html';
        } catch (err) {
            alert("ACCESS DENIED: " + err.message);
        }
    },

    // 2. BIOMETRIC UPLINK (Google Auth)
    async initiateGoogleUplink() {
        const { error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) alert("UPLINK FAILED: " + error.message);
    }
};

// Update your Alpine.js nccMasterEngine to use these functions
function nccMasterEngine() {
    return {
        authForm: { id: '', pass: '' },
        async loginManual() {
            await SecureAuth.attemptManualLogin(this.authForm.id, this.authForm.pass);
        },
        async loginWithGoogle() {
            await SecureAuth.initiateGoogleUplink();
        }
    }
}
