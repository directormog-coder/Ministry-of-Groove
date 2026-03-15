#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need environment variable injection
const filesToProcess = [
    'login.html',
    'index.html',
    'js/supabase-config.js' // We'll create this
];

// Environment variables to inject
const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://fgkljjgxecjmiiaptiug.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    APPLE_SERVICES_ID: process.env.APPLE_SERVICES_ID,
    APPLE_REDIRECT_URI: process.env.APPLE_REDIRECT_URI || 'https://ministry-of-groove.vercel.app/auth/callback'
};

// Validate required vars
if (!envVars.SUPABASE_ANON_KEY) {
    console.error('❌ ERROR: SUPABASE_ANON_KEY is required');
    process.exit(1);
}

console.log('🔧 Injecting environment variables...');

filesToProcess.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} (not found)`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace placeholders with actual values
    Object.keys(envVars).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        const value = envVars[key] || '';
        content = content.replace(placeholder, value);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Processed ${file}`);
});

console.log('✨ Environment injection complete!');
