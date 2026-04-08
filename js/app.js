/**
 * Ministry of Groove - Main Application
 * NCC Master v6.0.0 — Broadcast Edition
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
        console.log('%c🔒 MOG NCC Master v6.0.0', 'color: #D4AF37; font-weight: bold;');
        console.log('%cBroadcast Uplink Protocol Active', 'color: #00F2FF;');

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
        version: '6.0.0',
        
        /**
         * FREQUENCY PAGE LOGIC
         * Initializes the Director-only interface
         */
        initFrequency: async function() {
            // Wait for Auth to confirm role
            await MOGAuth.init();
            
            if (MOGAuth.isDirector) {
                const controls = document.getElementById('director-controls');
                if (controls) {
                    controls.style.display = 'block';
                    console.log('%c[M.O.G.] Director Controls Enabled', 'color: #D4AF37;');
                }
            }
        },

        /**
         * UPLINK REQUEST
         * Calls the Vercel Serverless Function to get Mux credentials
         */
        requestUplink: async function() {
            const btn = document.getElementById('start-broadcast-btn');
            const intelBox = document.getElementById('director-intel');
            const keyInput = document.getElementById('stream-key');

            if (!MOGAuth.user) {
                alert("Session Expired. Re-authenticate.");
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = "ESTABLISHING SECURE UPLINK...";

                const response = await fetch('/api/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: MOGAuth.user.id })
                });

                if (!response.ok) throw new Error('Uplink rejected by server.');

                const data = await response.json();

                if (data.streamKey) {
                    keyInput.value = data.streamKey;
                    intelBox.style.display = 'block';
                    
                    btn.innerText = "UPLINK ESTABLISHED";
                    btn.classList.add('btn-teal');
                    btn.style.borderColor = "var(--teal)";
                    
                    console.log('%c[M.O.G.] Stream Key Received.', 'color: #00E5CC;');
                }
            } catch (err) {
                console.error('Broadcast Error:', err);
                btn.innerText = "UPLINK FAILED — RETRY";
                btn.disabled = false;
                alert("Security handshake failed. Check server logs.");
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
                
                // Visual feedback on the button
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
                console.error('Copy failed:', err);
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
