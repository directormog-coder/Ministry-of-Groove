/**
 * Ministry of Groove - Crypto Utilities
 * NCC Master v5.2.3
 * Web Crypto API for secure operations
 */

(function() {
    'use strict';
    
    window.MOGCrypto = {
        /**
         * Generate a secure random ID
         */
        generateId: function(length = 16) {
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        },
        
        /**
         * Hash a string using SHA-256
         */
        hash: async function(message) {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },
        
        /**
         * Encrypt data (AES-GCM)
         */
        encrypt: async function(plaintext, key) {
            const encoder = new TextEncoder();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                encoder.encode(key),
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );
            
            const ciphertext = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                cryptoKey,
                encoder.encode(plaintext)
            );
            
            return {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(ciphertext))
            };
        },
        
        /**
         * Decrypt data (AES-GCM)
         */
        decrypt: async function(ciphertextObj, key) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                encoder.encode(key),
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );
            
            const plaintext = await crypto.subtle.decrypt(
                { 
                    name: 'AES-GCM', 
                    iv: new Uint8Array(ciphertextObj.iv) 
                },
                cryptoKey,
                new Uint8Array(ciphertextObj.data)
            );
            
            return decoder.decode(plaintext);
        },
        
        /**
         * Generate session token
         */
        generateSessionToken: function() {
            return 'MOG-' + Date.now() + '-' + this.generateId(8).toUpperCase();
        }
    };
})();
