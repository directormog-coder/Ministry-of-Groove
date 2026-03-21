/**
 * M.O.G. CRYPTO UTILITIES — js/crypto-utils.js
 * ==============================================
 * Web Crypto API wrappers for client-side secure operations.
 * NCC Master v5.3.0
 *
 * IMPORTANT: AES-GCM requires a key of exactly 16, 24, or 32 bytes.
 * The encrypt/decrypt methods handle this automatically via PBKDF2
 * key derivation — you can pass any string as the key.
 *
 * Load order: after supabase-client.js, before any page script that needs it.
 */

(function () {
    'use strict';

    const PBKDF2_ITERATIONS = 100_000;
    const SALT_BYTES        = 16;
    const IV_BYTES          = 12;
    const KEY_BITS          = 256; // AES-256

    /**
     * Derive a CryptoKey from a passphrase string using PBKDF2.
     * This means you never have to worry about key length.
     */
    async function _deriveKey(passphrase, salt, usage) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(passphrase),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name:       'PBKDF2',
                salt:       salt,
                iterations: PBKDF2_ITERATIONS,
                hash:       'SHA-256',
            },
            keyMaterial,
            { name: 'AES-GCM', length: KEY_BITS },
            false,
            [usage]
        );
    }

    window.MOGCrypto = {

        /**
         * Generate a cryptographically secure random ID.
         * @param {number} length - Number of random bytes (output is 2x hex chars).
         * @returns {string} Hex string of length * 2 characters.
         */
        generateId(length = 16) {
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
        },

        /**
         * Generate a M.O.G. session token.
         * @returns {string} e.g. "MOG-1748291234567-A3F2C1D8"
         */
        generateSessionToken() {
            return `MOG-${Date.now()}-${this.generateId(8).toUpperCase()}`;
        },

        /**
         * Hash a string with SHA-256.
         * @param {string} message
         * @returns {Promise<string>} Hex-encoded SHA-256 hash.
         */
        async hash(message) {
            const encoder = new TextEncoder();
            const buffer  = await crypto.subtle.digest('SHA-256', encoder.encode(message));
            return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
        },

        /**
         * Encrypt plaintext with AES-256-GCM.
         * Key can be any string — it is derived via PBKDF2.
         *
         * @param {string} plaintext
         * @param {string} passphrase - Any string (doesn't need to be 32 bytes)
         * @returns {Promise<{ salt: number[], iv: number[], data: number[] }>}
         */
        async encrypt(plaintext, passphrase) {
            const encoder = new TextEncoder();
            const salt    = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
            const iv      = crypto.getRandomValues(new Uint8Array(IV_BYTES));
            const key     = await _deriveKey(passphrase, salt, 'encrypt');

            const ciphertext = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoder.encode(plaintext)
            );

            return {
                salt: Array.from(salt),
                iv:   Array.from(iv),
                data: Array.from(new Uint8Array(ciphertext)),
            };
        },

        /**
         * Decrypt an object produced by encrypt().
         *
         * @param {{ salt: number[], iv: number[], data: number[] }} payload
         * @param {string} passphrase - Same passphrase used to encrypt
         * @returns {Promise<string>} Decrypted plaintext
         */
        async decrypt(payload, passphrase) {
            const decoder = new TextDecoder();
            const salt    = new Uint8Array(payload.salt);
            const iv      = new Uint8Array(payload.iv);
            const data    = new Uint8Array(payload.data);
            const key     = await _deriveKey(passphrase, salt, 'decrypt');

            const plaintext = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            return decoder.decode(plaintext);
        },

        /**
         * Constant-time string comparison to prevent timing attacks.
         * Use when comparing tokens or hashes.
         * @param {string} a
         * @param {string} b
         * @returns {boolean}
         */
        constantTimeEqual(a, b) {
            if (a.length !== b.length) return false;
            let result = 0;
            for (let i = 0; i < a.length; i++) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i);
            }
            return result === 0;
        },
    };

    console.log('%c[M.O.G.] CryptoUtils loaded ✓', 'color:#d4af37;font-family:monospace;font-weight:bold');

})();
