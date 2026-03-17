/**
 * Ministry of Groove - Main Application
 * NCC Master v5.2.3
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
        console.log('%c🔒 MOG NCC Master v5.2.3', 'color: #D4AF37; font-weight: bold;');
        console.log('%cClassified System - Authorized Personnel Only', 'color: #00F2FF;');
    });
    
    // Global error handler
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('MOG Error:', msg, 'at', lineNo + ':' + columnNo);
        return false;
    };
    
    // Expose app utilities
    window.MOGApp = {
        version: '5.2.3',
        
        init: function() {
            console.log('MOG App initialized');
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
