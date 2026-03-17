/**
 * Ministry of Groove - Environment Injector
 * NCC Master v5.2.3
 * 
 * This script injects environment variables for deployment
 * Uses GitHub Secrets or Vercel Environment Variables in production
 */

(function() {
    'use strict';
    
    // Detect environment
    const isProduction = window.location.hostname !== 'localhost' && 
                         !window.location.hostname.includes('127.0.0.1');
    
    // Try to load from injected config (set by CI/CD or server)
    if (window.__ENV_INJECTED__) {
        window.ENV = window.__ENV_INJECTED__;
        console.log('[MOG] Environment loaded from injection');
        return;
    }
    
    // Fallback: Check for local config file (development only)
    if (!isProduction) {
        console.warn('[MOG] Development mode: Expecting config/env.js');
        // In development, env.js should be present locally
        // Do not commit env.js to GitHub
        return;
    }
    
    // Production: Environment should be injected by server/build process
    console.error('[MOG] Production environment not injected. Check deployment configuration.');
    
    // Graceful degradation - show error to user
    document.addEventListener('DOMContentLoaded', function() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:1rem;text-align:center;z-index:99999;font-family:monospace;';
        errorDiv.innerHTML = '⚠️ MOG SYSTEM ERROR: Environment configuration missing. Contact administrator.';
        document.body.appendChild(errorDiv);
    });
})();
