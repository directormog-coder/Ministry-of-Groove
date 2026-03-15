// scripts/inject-env.js
// Ministry of Groove - Environment Variable Injection
// Injects secure environment variables into window.__ENV__
// Version: 5.2.0

(function() {
    'use strict';
    
    // Environment configuration injected at build time
    // DO NOT COMMIT ACTUAL VALUES - Use CI/CD environment variables
    window.__ENV__ = {
        // Supabase Configuration
        SUPABASE_URL: '${process.env.SUPABASE_URL || ""}',
        SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY || ""}',
        
        // Application Metadata
        APP_VERSION: '5.2.0',
        APP_NAME: 'Ministry of Groove | NCC Master',
        CLASSIFICATION_LEVEL: 'CONFIDENTIAL',
        BUILD_TIMESTAMP: '${new Date().toISOString()}',
        
        // Security Settings
        SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
        MAX_LOGIN_ATTEMPTS: 5,
        REQUIRE_SECURE_CONTEXT: true
    };
    
    // Security check: Ensure we're in secure context if required
    if (window.__ENV__.REQUIRE_SECURE_CONTEXT && !window.isSecureContext) {
        console.warn('[MOG-SECURITY] Insecure context detected. Some features may be disabled.');
    }
    
    console.info('[MOG-ENV] Environment variables injected v5.2.0');
})();
