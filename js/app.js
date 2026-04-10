/**
 * Ministry of Groove - NCC Master v7.0.0
 * Unified Command Engine: Hub, Dispatch, Directorate & Cart
 * Decrypting the Culture. Synchronizing the Grid.
 */

const MOGApp = {
    cart: [],
    currentUser: null,
    version: '7.0.0',

    /**
     * CORE INITIALIZATION
     * Synchronizes Auth, UI Icons, and Tactical Systems
     */
    async init() {
        // 1. Render Lucide Icons for UI
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('%c🔒 MOG NCC Master v7.0.0 Active', 'color: #C9A84C; font-weight: bold;');

        if (!window.sb) {
            console.warn('[M.O.G.] Supabase not detected. Entering Offline Mode.');
            return;
        }

        // 2. Auth Check & Session Sync
        const { data: { session } } = await window.sb.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            
            // Start Tactical Protocols
            this.startHeartbeat();
            this.setupRealtime(session.user.id);
            this.updateBadges();
            this.loadCart();
            this.registerPush(session.user.id);
        } else {
            // Redirect unauthorized access to login
            const path = window.location.pathname;
            if (!path.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }

        // 3. Frequency Page Specific Init
        if (window.location.pathname.includes('frequency.html')) {
            this.initFrequency();
        }
    },

    // ══════════════════════════════════════════════════════════
    // REAL-TIME & NOTIFICATIONS (Tactical Dispatch)
    // ══════════════════════════════════════════════════════════

    /**
     * SETUP REALTIME
     * Listens for incoming messages directed at the current operative
     */
    setupRealtime(userId) {
        window.sb.channel('realtime-dispatch')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages', 
                filter: `receiver_id=eq.${userId}` 
            }, payload => {
                this.launchToast(payload.new);
                this.updateBadges();
            }).subscribe();
    },

    /**
     * UPDATE BADGES
     * Updates unread counts on both the Hub and the Bottom Navigation
     */
    async updateBadges() {
        if (!this.currentUser) return;
        
        const { count } = await window.sb.from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', this.currentUser.id)
            .eq('read', false);
        
        const badgeHub = document.getElementById('unread-badge-hub');
        const badgeNav = document.getElementById('unread-badge-nav');
        
        const badgeElements = [badgeHub, badgeNav];
        badgeElements.forEach(el => {
            if (el) {
                el.textContent = count > 0 ? (count > 99 ? '99+' : count) : '';
                el.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    },

    /**
     * LAUNCH TOAST
     * Visual UI Alert for incoming transmissions
     */
    launchToast(msg) {
        const root = document.getElementById('toast-root');
        if (!root) return;

        const toast = document.createElement('div');
        toast.className = 'mog-toast';
        toast.innerHTML = `
            <p style="color:var(--gold); font-family:'Orbitron'; font-size:10px; font-weight:700; letter-spacing:1px;">INCOMING DISPATCH</p>
            <p style="font-size:13px; margin:5px 0; font-family:'Rajdhani';">${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}</p>
            <a href="dispatch.html" style="color:var(--teal); font-size:10px; text-decoration:none; font-family:'Share Tech Mono';">DECRYPT MESSAGE →</a>
        `;
        root.appendChild(toast);
        
        // Auto-purge toast after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    // ══════════════════════════════════════════════════════════
    // TICKET CART SYSTEM (Vault Bag)
    // ══════════════════════════════════════════════════════════

    toggleCart() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.toggle('active');
            this.renderCart();
        }
    },

    addToCart(ticket) {
        // Ticket object: { name: string, price: number, event: string }
        this.cart.push({
            id: Date.now(),
            name: ticket.name,
            price: ticket.price,
            event: ticket.event || 'GENERAL SESSION'
        });
        this.saveCart();
        this.renderCart();
        this.launchToast({ content: `VAULT SECURED: ${ticket.name} added to bag.` });
    },

    saveCart() { 
        localStorage.setItem('mog_cart_v1', JSON.stringify(this.cart)); 
    },

    loadCart() { 
        const saved = localStorage.getItem('mog_cart_v1');
        if(saved) this.cart = JSON.parse(saved);
        this.renderCart();
    },

    renderCart() {
        const container = document.getElementById('cart-items-list');
        const countDisplay = document.getElementById('cart-count-display');
        const totalDisplay = document.getElementById('cart-total-price');
        
        if (!container) return;

        let total = 0;
        container.innerHTML = this.cart.map((item, index) => {
            total += item.price;
            return `
                <div class="tx-item" style="padding:10px 0; border-bottom:1px solid rgba(201,168,76,0.1)">
                    <div style="display:flex; justify-content:space-between; width:100%">
                        <div>
                            <div class="tx-main" style="font-size:12px;">${item.name}</div>
                            <div class="tx-time" style="font-size:8px; color:var(--gold-dim)">${item.event}</div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-family:'Orbitron'; font-size:11px; color:var(--gold)">R${item.price}</div>
                            <button onclick="MOGApp.removeFromCart(${index})" style="background:none; border:none; color:var(--red); font-size:9px; cursor:pointer; font-family:'Share Tech Mono';">REMOVE</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (this.cart.length === 0) {
            container.innerHTML = '<div class="empty-state">VAULT EMPTY</div>';
        }

        if(countDisplay) countDisplay.textContent = `${this.cart.length} ITEMS`;
        if(totalDisplay) totalDisplay.textContent = `R${total}`;
        
        // Sync Hub Bar (SyncBar)
        const bar = document.getElementById('syncBar');
        if(bar) bar.style.width = this.cart.length > 0 ? '100%' : '0%';
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.renderCart();
    },

    checkout() {
        if(this.cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        alert("REDIRECTING TO SECURE PAYMENT GATEWAY...");
        // Integration Point: Redirect to Paystack/Yoco/Stripe
    },

    // ══════════════════════════════════════════════════════════
    // UPLINK & HEARTBEAT (Original Foundation)
    // ══════════════════════════════════════════════════════════

    startHeartbeat() {
        const updateStatus = async () => {
            if (!this.currentUser) return;
            // Update last_seen in profiles
            await window.sb.from('profiles')
                .update({ last_seen: new Date().toISOString() })
                .eq('id', this.currentUser.id);
            
            // Trigger RPC status update
            await window.sb.rpc('update_user_status');
        };

        updateStatus();
        setInterval(updateStatus, 60000); // 60s Pulse
        console.log('%c[M.O.G.] Heartbeat Protocol Active', 'color: #00E5CC;');
    },

    async establishUplink(targetUserId) {
        try {
            const { data: { session } } = await window.sb.auth.getSession();
            if (!session) return;
            const currentUserId = session.user.id;

            // Check existing conversation
            const { data: existingId } = await window.sb.rpc('get_existing_conversation', {
                user_a: currentUserId,
                user_b: targetUserId
            });

            if (existingId) {
                window.location.href = `dispatch.html?id=${existingId}`;
                return;
            }

            // Create new conversation
            const { data: conv } = await window.sb.from('conversations').insert({ type: 'dm' }).select().single();
            await window.sb.from('participants').insert([
                { conversation_id: conv.id, user_id: currentUserId },
                { conversation_id: conv.id, user_id: targetUserId }
            ]);

            window.location.href = `dispatch.html?id=${conv.id}`;
        } catch (err) {
            console.error('Uplink Error:', err);
        }
    },

    // ══════════════════════════════════════════════════════════
    // PUSH NOTIFICATIONS (Service Worker)
    // ══════════════════════════════════════════════════════════

    async registerPush(userId) {
        if (!('serviceWorker' in navigator)) return;
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            console.log('[M.O.G.] Service Worker Synchronized');
        } catch (e) {
            console.warn('[M.O.G.] Push Protocol Offline');
        }
    },

    // ══════════════════════════════════════════════════════════
    // SYSTEM EXIT
    // ══════════════════════════════════════════════════════════

    logout() {
        if (confirm('Terminate operative session?')) {
            window.sb.auth.signOut().then(() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
            });
        }
    }
};

// INITIALIZE SYSTEM
document.addEventListener('DOMContentLoaded', () => MOGApp.init());
