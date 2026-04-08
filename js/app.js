/**
 * Ministry of Groove - Main Application
 * NCC Master v6.1.0 — Production Broadcast Edition
 */

(function() {
    'use strict';
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Log system ready
        console.log('%c🔒 MOG NCC Master v6.1.0', 'color: #D4AF37; font-weight: bold;');
        console.log('%cSecure Uplink Protocol v6.1 Active', 'color: #00F2FF;');

        // Auto-init frequency page if on that route
        if (window.location.pathname.includes('frequency.html')) {
            window.MOGApp.initFrequency();
        }
    });
    
    // Global error handler
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('MOG Error:', msg, 'at', lineNo + ':' + columnNo);
        return false;
    };
    
    // Expose app utilities
    window.MOGApp = {
        version: '6.1.0',
        
        /**
         * FREQUENCY PAGE LOGIC
         * Initializes the Director-only interface and checks role
         */
        initFrequency: async function() {
            // Wait for Auth to confirm role from Supabase
            await MOGAuth.init();
            
            if (MOGAuth.isDirector) {
                const controls = document.getElementById('director-controls');
                if (controls) {
                    controls.style.display = 'block';
                    console.log('%c[M.O.G.] Director Clearance Confirmed. Controls Enabled.', 'color: #D4AF37;');
                }
            }
        },

        /**
         * UPLINK REQUEST (UPGRADED)
         * Sends JWT for server-side verification and provisions Mux stream
         */
        requestUplink: async function() {
            const btn = document.getElementById('start-broadcast-btn');
            const intelBox = document.getElementById('director-intel');
            const keyInput = document.getElementById('stream-key');

            // 1. Check local session
            if (!MOGAuth.isAuthenticated) {
                alert("Clearance Denied. Please re-authenticate.");
                window.location.href = '/login.html';
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = "VERIFYING CLEARANCE...";

                // 2. Retrieve the JWT (Access Token) from Supabase Client
                const { data: { session }, error: sessionError } = await window.sb.auth.getSession();
                
                if (sessionError || !session) throw new Error("Could not retrieve secure token.");

                // 3. Optional: Get Event ID from UI (Falling back to a generic ID if not found)
                const eventId = document.querySelector('.event-card')?.id || 'SESSION_03_AUTO';

                const response = await fetch('/api/broadcast', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}` // CRITICAL: Security Header
                    },
                    body: JSON.stringify({ 
                        eventId: eventId,
                        title: document.getElementById('stripTitle')?.innerText || "Live Session"
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Uplink rejected by High Command.');
                }

                if (data.streamKey) {
                    keyInput.value = data.streamKey;
                    intelBox.style.display = 'block';
                    
                    btn.innerText = "UPLINK ESTABLISHED";
                    btn.classList.remove('btn-gold');
                    btn.classList.add('btn-teal');
                    
                    console.log('%c[M.O.G.] Stream Key Received. Directing data to Mux.', 'color: #00E5CC;');
                }
            } catch (err) {
                console.error('Broadcast Uplink Failure:', err);
                btn.innerText = "UPLINK FAILED — RETRY";
                btn.disabled = false;
                alert(`Protocol Error: ${err.message}`);
            }
        },

        /**
         * CLIPBOARD UTILITY
         * Copies intel to clipboard with visual feedback
         */
        copyIntel: async function(elementId, isInput = false) {
            const textToCopy = isInput 
                ? document.getElementById(elementId).value 
                : document.getElementById(elementId).innerText;

            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback on the trigger button
                const btn = event.target;
                const originalText = btn.innerText;
                
                btn.innerText = "COPIED";
                btn.style.background = "var(--teal)";
                btn.style.color = "var(--black)";
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "";
                    btn.style.color = "";
                }, 2000);

            } catch (err) {
                console.error('Intel copy failed:', err);
            }
        },

        refreshIcons: function() {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        },
        
        formatTime: function(date) {
            return date.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            }) + ' UTC';
        }
    };
})();
