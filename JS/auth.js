/**
 * 📀 MINISTRY OF GROOVE | AUTH ENGINE v5.0
 * Secure Gatekeeping & Grid Synchronization
 */

const SecureAuth = {
    // 1. SESSION PING: Verifies database handshake
    async verifyGrid() {
        try {
            const { data, error } = await sb.from('profiles').select('status').limit(1).single();
            if (error) throw error;
            return { status: 'SECURE', data };
        } catch (err) {
            console.error("📡 SIGNAL LOST:", err.message);
            return { status: 'OFFLINE' };
        }
    },

    // 2. ROLE GATE: Determines Operative vs Director
    handleLogin(email) {
        // Define your Director clearance here
        const directorEmail = 'director.mog@gmail.com'; 
        
        if (email === directorEmail) {
            localStorage.setItem('userRole', 'director');
            return 'director';
        } else {
            localStorage.setItem('userRole', 'operative');
            return 'operative';
        }
    },

    // 3. TERMINATE: Securely wipes session
    terminate() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../login.html'; // Adjust path if in /pages
    }
};

// Integration with your Alpine.js Engine
function nccMasterEngine() {
    return {
        view: 'gate',
        connection: 'CONNECTING...',
        
        async init() {
            const role = localStorage.getItem('userRole');
            const { status } = await SecureAuth.verifyGrid();
            
            this.connection = status;
            
            if (role && status === 'SECURE') {
                this.view = 'grid';
            } else {
                this.view = 'auth';
            }
            
            // Re-render Lucide icons
            if (window.lucide) lucide.createIcons();
        }
    }
}
