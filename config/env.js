/**
 * Ministry of Groove - Production Environment Configuration
 * WARNING: This file contains sensitive credentials
 * DO NOT commit this file to version control
 */

(function() {
    'use strict';
    
    // Validate we're in a secure context
    if (window.isSecureContext === false) {
        console.error('MOG Security Alert: Insecure context detected');
        document.body.innerHTML = '<h1>Secure Connection Required</h1>';
        return;
    }
    
    window.ENV = {
        // Supabase Configuration - Replace with your actual credentials
        SUPABASE_URL: 'https://qqlcwqkpdnxzrhrnkbjg.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbGN3cWtwZG54enJocm5rYmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTI3MzEsImV4cCI6MjA1NzM4ODczMX0.1nLka4Z-2qQj2C0dF2XqQj2C0dF2XqQj2C0dF2XqQj2C',
        
        // Application Settings
        APP_VERSION: '5.2.3',
        APP_NAME: 'NCC Master',
        ENVIRONMENT: 'production',
        
        // Security Settings
        SESSION_TIMEOUT: 3600000,
        MAX_LOGIN_ATTEMPTS: 5,
        RATE_LIMIT_WINDOW: 900000,
        
        // Feature Flags
        ENABLE_BIOMETRIC: true,
        ENABLE_2FA: false,
        ENABLE_AUDIT_LOG: true,
        
        // Audit Endpoint (optional - for logging to your own server)
        AUDIT_ENDPOINT: null // 'https://your-audit-server.com/log'
    };
    
    // Freeze to prevent runtime modification
    Object.freeze(window.ENV);
})();
