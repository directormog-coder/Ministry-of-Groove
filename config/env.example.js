/**
 * Ministry of Groove - Environment Configuration Template
 * Copy this file to env.js and fill in your actual credentials
 * DO NOT commit env.js to version control
 */

window.ENV = {
    // Supabase Configuration
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Application Settings
    APP_VERSION: '5.2.3',
    APP_NAME: 'NCC Master',
    ENVIRONMENT: 'production', // 'development' | 'staging' | 'production'
    
    // Security Settings
    SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
    MAX_LOGIN_ATTEMPTS: 5,
    RATE_LIMIT_WINDOW: 900000, // 15 minutes
    
    // Feature Flags
    ENABLE_BIOMETRIC: true,
    ENABLE_2FA: false,
    ENABLE_AUDIT_LOG: true
};
