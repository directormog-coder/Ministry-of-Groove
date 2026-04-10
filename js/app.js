/**
 * Ministry of Groove - Main Application
 * NCC Master v6.3.0 — Production Broadcast + Realtime + Messaging
 * UNIFIED COMMAND SCRIPT — DO NOT REMOVE EXISTING LOGIC
 */

(function() {
    'use strict';
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Log system ready
        console.log('%c🔒 MOG NCC Master v6.3.0', 'color: #C9A84C; font-weight: bold;');
        console.log('%cSecure Uplink + Realtime Protocol Active', 'color: #00E5CC;');

        // --- REALTIME HEARTBEAT INITIALIZATION ---
        if (window.sb) {
            try {
                const { data: { session } } = await window.sb.auth.getSession();
                if (session) {
                    window.MOGApp.startHeartbeat();
                }
            } catch (err) {
                console.warn('[M.O.G.] Auth sync delayed or unavailable.');
            }
        }

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
        version: '6.3.0',
        
        /**
         * HEARTBEAT SYSTEM
         * Updates the user_presence table to keep the operative 'Online'
         */
        startHeartbeat: function() {
            const updateStatus = async () => {
                const { error } = await window.sb.rpc('update_user_status');
                if (error) console.error("[M.O.G.] Presence Uplink Error", error);
            };

            // Immediate pulse on load
            updateStatus();

            // Frequency: 60 seconds
            setInterval(updateStatus, 60000);
            
            console.log('%c[M.O.G.] Heartbeat Protocol Synchronized', 'color: #00E5CC;');
        },

        /**
         * ESTABLISH UPLINK
         * Intelligently creates or opens existing chat between users
         */
        establishUplink: async function(targetUserId) {
            try {
                const { data: { session } } = await window.sb.auth.getSession();
                if (!session) {
                    alert("Clearance Denied. Please re-authenticate.");
                    return;
                }
                const currentUserId = session.user.id;

                // 1. Check for existing DM to prevent duplicates
                const { data: existingId, error: checkError } = await window.sb.rpc('get_existing_conversation', {
                    user_a: currentUserId,
                    user_b: targetUserId
                });

                if (existingId) {
                    window.location.href = `/chat?id=${existingId}`;
                    return;
                }

                // 2. Create new conversation if none exists
                const { data: conv, error: convErr } = await window.sb
                    .from('conversations')
                    .insert({ type: 'dm' })
                    .select()
                    .single();

                if (convErr) throw convErr;

                // 3. Add both participants
                const { error: partErr } = await window.sb
                    .from('participants')
                    .insert([
                        { conversation_id: conv.id, user_id: currentUserId },
                        { conversation_id: conv.id, user_id: targetUserId }
                    ]);

                if (partErr) throw partErr;

                // 4. Redirect to the Chat Page
                window.location.href = `/chat?id=${conv.id}`;
                
            } catch (err) {
                console.error('Uplink Establishment Failed:', err);
                alert('Protocol Error: Could not establish secure channel.');
            }
        },

        /**
         * FREQUENCY PAGE LOGIC
         * Initializes the Director-only interface and checks role
         */
        initFrequency: async function() {
            // Wait for Auth to confirm role from Supabase
            if (typeof MOGAuth !== 'undefined') {
                await MOGAuth.init();
                
                if (MOGAuth.isDirector) {
                    const controls = document.getElementById('director-controls');
                    if (controls) {
                        controls.style.display = 'block';
                        console.log('%c[M.O.G.] Director Clearance Confirmed. Controls Enabled.', 'color: #C9A84C;');
                    }
                }
            }
        },

        /**
         * UPLINK REQUEST (BROADCAST)
         * Sends JWT for server-side verification and provisions Mux stream
         */
        requestUplink: async function() {
            const btn = document.getElementById('start-broadcast-btn');
            const intelBox = document.getElementById('director-intel');
            const keyInput = document.getElementById('stream-key');

            if (!MOGAuth.isAuthenticated) {
                alert("Clearance Denied. Please re-authenticate.");
                window.location.href = '/login.html';
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = "VERIFYING CLEARANCE...";

                const { data: { session }, error: sessionError } = await window.sb.auth.getSession();
                
                if (sessionError || !session) throw new Error("Could not retrieve secure token.");

                const eventId = document.querySelector('.event-card')?.id || 'SESSION_03_AUTO';

                const response = await fetch('/api/broadcast', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
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
