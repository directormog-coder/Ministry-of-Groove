// scripts/generate-apple-secret.js
// Run: node scripts/generate-apple-secret.js

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const privateKeyPath = process.env.APPLE_PRIVATE_KEY_PATH || './AuthKey.p8';
const teamId = process.env.APPLE_TEAM_ID;
const clientId = process.env.APPLE_SERVICES_ID;
const keyId = process.env.APPLE_KEY_ID;

// Validate config
if (!teamId || !clientId || !keyId) {
    console.error('❌ Missing required environment variables');
    console.error('Ensure .env contains: APPLE_TEAM_ID, APPLE_SERVICES_ID, APPLE_KEY_ID');
    process.exit(1);
}

// Check for private key file
if (!fs.existsSync(privateKeyPath)) {
    console.error(`❌ Private key not found: ${privateKeyPath}`);
    console.error('Download your .p8 file from Apple Developer Portal');
    process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath);

const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d', // Apple allows max 6 months
    issuer: teamId,
    audience: 'https://appleid.apple.com',
    subject: clientId,
    keyid: keyId,
    header: {
        alg: 'ES256',
        kid: keyId
    }
});

console.log('\n🔐 APPLE SECRET KEY GENERATED');
console.log('=====================================');
console.log('Paste this into your Supabase Dashboard:');
console.log('Path: Authentication > Providers > Apple > Secret Key');
console.log('\n' + token);
console.log('\n=====================================');
console.log('⚠️  This key expires in 180 days');
console.log('   Set a reminder to regenerate: ' + new Date(Date.now() + 15552000000).toISOString().split('T')[0]);
