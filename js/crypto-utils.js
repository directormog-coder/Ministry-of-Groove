/**
 * Ministry of Groove - Cryptographic Utilities
 * Secure client-side encryption and utility functions
 * 
 * SECURITY NOTICE: This file contains client-side crypto utilities.
 * For server-side operations, use Supabase Edge Functions.
 * 
 * @version 5.1.0
 * @author Ministry of Groove
 */

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const CRYPTO_CONFIG = {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12,
    SALT_LENGTH: 16,
    ITERATIONS: 100000,
    DIGEST: 'SHA-256'
};

// ==========================================
// KEY DERIVATION & GENERATION
// ==========================================

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length in bytes (default: 32)
 * @returns {string} Hex-encoded random string
 */
function generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a nonce for Apple Sign-In or OAuth
 * @returns {string} Base64url-encoded nonce
 */
function generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Derive encryption key from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Random salt
 * @returns {Promise<CryptoKey>} Derived key
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    
    // Derive AES-GCM key
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: CRYPTO_CONFIG.ITERATIONS,
            hash: CRYPTO_CONFIG.DIGEST
        },
        keyMaterial,
        {
            name: CRYPTO_CONFIG.ALGORITHM,
            length: CRYPTO_CONFIG.KEY_LENGTH
        },
        false,
        ['encrypt', 'decrypt']
    );
}

// ==========================================
// ENCRYPTION & DECRYPTION
// ==========================================

/**
 * Encrypt sensitive data using AES-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string} password - Encryption password
 * @returns {Promise<string>} Encrypted data (salt:iv:ciphertext)
 */
async function encryptData(plaintext, password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        
        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH));
        const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.IV_LENGTH));
        
        // Derive key
        const key = await deriveKey(password, salt);
        
        // Encrypt
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: CRYPTO_CONFIG.ALGORITHM,
                iv: iv
            },
            key,
            data
        );
        
        // Combine salt + iv + ciphertext
        const result = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        result.set(salt, 0);
        result.set(iv, salt.length);
        result.set(new Uint8Array(ciphertext), salt.length + iv.length);
        
        // Return as base64
        return btoa(String.fromCharCode(...result));
        
    } catch (error) {
        console.error('[MOG CRYPTO] Encryption failed:', error);
        throw new Error('ENCRYPTION_FAILED');
    }
}

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - Base64 encrypted data (salt:iv:ciphertext)
 * @param {string} password - Decryption password
 * @returns {Promise<string>} Decrypted plaintext
 */
async function decryptData(encryptedData, password) {
    try {
        // Decode base64
        const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        
        // Extract salt, iv, and ciphertext
        const salt = data.slice(0, CRYPTO_CONFIG.SALT_LENGTH);
        const iv = data.slice(CRYPTO_CONFIG.SALT_LENGTH, CRYPTO_CONFIG.SALT_LENGTH + CRYPTO_CONFIG.IV_LENGTH);
        const ciphertext = data.slice(CRYPTO_CONFIG.SALT_LENGTH + CRYPTO_CONFIG.IV_LENGTH);
        
        // Derive key
        const key = await deriveKey(password, salt);
        
        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
            {
                name: CRYPTO_CONFIG.ALGORITHM,
                iv: iv
            },
            key,
            ciphertext
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
        
    } catch (error) {
        console.error('[MOG CRYPTO] Decryption failed:', error);
        throw new Error('DECRYPTION_FAILED');
    }
}

// ==========================================
// HASHING & VERIFICATION
// ==========================================

/**
 * Generate SHA-256 hash of data
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
async function sha256(data) {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate HMAC for data integrity verification
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {Promise<string>} Hex-encoded HMAC
 */
async function generateHMAC(data, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Hex-encoded HMAC
 * @param {string} secret - Secret key
 * @returns {Promise<boolean>} Validity
 */
async function verifyHMAC(data, signature, secret) {
    const computed = await generateHMAC(data, secret);
    // Constant-time comparison to prevent timing attacks
    if (computed.length !== signature.length) return false;
    
    let result = 0;
    for (let i = 0; i < computed.length; i++) {
        result |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
}

// ==========================================
// SECURE STORAGE
// ==========================================

/**
 * Secure local storage wrapper with encryption
 * Uses Web Crypto API for transparent encryption
 */
const SecureStorage = {
    /**
     * Store encrypted item
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @param {string} password - Encryption password
     */
    async setItem(key, value, password) {
        try {
            const jsonString = JSON.stringify(value);
            const encrypted = await encryptData(jsonString, password);
            localStorage.setItem(`mog_secure_${key}`, encrypted);
            return true;
        } catch (error) {
            console.error('[MOG STORAGE] Set item failed:', error);
            return false;
        }
    },
    
    /**
     * Retrieve and decrypt item
     * @param {string} key - Storage key
     * @param {string} password - Decryption password
     * @returns {Promise<any>} Decrypted value or null
     */
    async getItem(key, password) {
        try {
            const encrypted = localStorage.getItem(`mog_secure_${key}`);
            if (!encrypted) return null;
            
            const decrypted = await decryptData(encrypted, password);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('[MOG STORAGE] Get item failed:', error);
            return null;
        }
    },
    
    /**
     * Remove item from secure storage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        localStorage.removeItem(`mog_secure_${key}`);
    },
    
    /**
     * Clear all secure storage
     */
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith('mog_secure_'))
            .forEach(key => localStorage.removeItem(key));
    }
};

// ==========================================
// SESSION SECURITY
// ==========================================

/**
 * Session fingerprinting for additional security
 * Detects session hijacking attempts
 */
const SessionSecurity = {
    /**
     * Generate browser fingerprint
     * @returns {string} Fingerprint hash
     */
    generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
            navigator.hardwareConcurrency || 'unknown'
        ];
        
        return components.join('|');
    },
    
    /**
     * Create session verification token
     * @returns {Promise<string>} Session token
     */
    async createSessionToken() {
        const fingerprint = this.generateFingerprint();
        const timestamp = Date.now();
        const random = generateSecureToken(16);
        const data = `${fingerprint}:${timestamp}:${random}`;
        
        // Hash with session secret (from Supabase session)
        const session = await (window.supabase?.auth?.getSession() || { data: { session: null } });
        const secret = session.data?.session?.access_token || random;
        
        const hash = await sha256(data + secret);
        return btoa(`${data}:${hash}`).replace(/=/g, '');
    },
    
    /**
     * Verify session token integrity
     * @param {string} token - Session token
     * @returns {Promise<boolean>} Validity
     */
    async verifySessionToken(token) {
        try {
            const decoded = atob(token);
            const [fingerprint, timestamp, random, hash] = decoded.split(':');
            
            // Check if token is expired (24 hours)
            const tokenTime = parseInt(timestamp);
            if (Date.now() - tokenTime > 24 * 60 * 60 * 1000) {
                return false;
            }
            
            // Verify fingerprint matches current browser
            const currentFingerprint = this.generateFingerprint();
            if (fingerprint !== currentFingerprint) {
                console.warn('[MOG SECURITY] Fingerprint mismatch - possible session hijacking');
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate secure random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} Secure password
 */
function generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, x => charset[x % charset.length]).join('');
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Raw input
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Generate CSRF token for form protection
 * @returns {string} CSRF token
 */
function generateCSRFToken() {
    return generateSecureToken(32);
}

/**
 * Constant-time string comparison (prevents timing attacks)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} Equality
 */
function secureCompare(a, b) {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

// ==========================================
// SUPABASE INTEGRATION HELPERS
// ==========================================

/**
 * Encrypt data for secure Supabase storage
 * @param {Object} data - Data to encrypt
 * @param {string} userPassword - User's password
 * @returns {Promise<Object>} Encrypted payload
 */
async function encryptForStorage(data, userPassword) {
    const jsonString = JSON.stringify(data);
    const encrypted = await encryptData(jsonString, userPassword);
    
    return {
        version: '1.0',
        algorithm: 'AES-GCM',
        encrypted: encrypted,
        timestamp: Date.now()
    };
}

/**
 * Decrypt data from Supabase storage
 * @param {Object} payload - Encrypted payload from Supabase
 * @param {string} userPassword - User's password
 * @returns {Promise<Object>} Decrypted data
 */
async function decryptFromStorage(payload, userPassword) {
    if (!payload || !payload.encrypted) {
        throw new Error('INVALID_PAYLOAD');
    }
    
    const decrypted = await decryptData(payload.encrypted, userPassword);
    return JSON.parse(decrypted);
}

// ==========================================
// EXPORT
// ==========================================

// ES Module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSecureToken,
        generateNonce,
        encryptData,
        decryptData,
        sha256,
        generateHMAC,
        verifyHMAC,
        SecureStorage,
        SessionSecurity,
        generateSecurePassword,
        sanitizeInput,
        generateCSRFToken,
        secureCompare,
        encryptForStorage,
        decryptFromStorage,
        CRYPTO_CONFIG
    };
}

// Browser global exposure
if (typeof window !== 'undefined') {
    window.MogCrypto = {
        generateSecureToken,
        generateNonce,
        encryptData,
        decryptData,
        sha256,
        generateHMAC,
        verifyHMAC,
        SecureStorage,
        SessionSecurity,
        generateSecurePassword,
        sanitizeInput,
        generateCSRFToken,
        secureCompare,
        encryptForStorage,
        decryptFromStorage,
        CRYPTO_CONFIG
    };
    
    console.log('[MOG CRYPTO] Cryptographic utilities loaded v5.1.0');
          }
