const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8');
const teamId = 'YOUR_TEAM_ID'; // 10-character string from Apple Developer
const clientId = 'YOUR_SERVICES_ID'; // e.g., com.ministryofgroove.web
const keyId = 'YOUR_KEY_ID'; // From Apple Developer Keys section

const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: teamId,
    audience: 'https://appleid.apple.com',
    subject: clientId,
    keyid: keyId
});

console.log('Apple Secret Key (paste this into Supabase dashboard):');
console.log(token);
