# Security Policy

## Reporting Security Vulnerabilities

⚠️ **DO NOT** create public GitHub issues for security vulnerabilities.

If you discover a security issue, please contact the Directorate directly:

* **Email**: director.mog@gmail.com
* **WhatsApp**: +27 81 387 4921

---

## Security Measures

### Authentication
* AES-256-GCM session encryption
* Web Crypto API for token handling
* Rate limiting on authentication endpoints
* Session fingerprinting

### Data Protection
* No secrets committed to repository
* Environment variables via Vercel secure storage
* API keys served via serverless functions only
* Row Level Security (RLS) on all database tables

### Infrastructure
* Content Security Policy (CSP) headers
* XSS protection enabled
* Secure session cookies
* HTTPS enforced

---

## Verified Secure Configuration

* [x] Supabase credentials stored in Vercel Environment Variables
* [x] `/api/config.js` serves configuration securely
* [x] Client fetches config from API endpoint
* [x] No hardcoded secrets in source code
* [x] Public GitHub repository with strict .gitignore rule enforcement

---

## Security Audit Log

| Date | Action | Status |
| :--- | :--- | :--- |
| 2026-03-18 | Verified no secrets in Git history | ✅ Pass |
| 2026-03-18 | Confirmed API config pattern | ✅ Pass |
| 2026-03-18 | Validated Vercel env vars | ✅ Pass |

---

Ministry of Groove Directorate  
Emalahleni Uplink II - Est. 2026
