# 📀 MINISTRY OF GROOVE | NCC MASTER v5.2
**Central Operations Gate & Classified Cultural Archive**

![MOG Logo](assets/images/logo.png)

## 🌐 Project Overview
The **NCC MASTER** is a high-security Progressive Web App (PWA) designed for the management of cultural assets, personnel dossiers, and frequency surveillance within Sector 7G. Built with a "Ministry Terminal" aesthetic, it utilizes a modular architecture with enterprise-grade encryption and real-time synchronization.

**Version:** 5.2.0  
**Last Updated:** 2026-03-16  
**Classification:** CONFIDENTIAL // SEC-7G

&gt; ⚠️ **SECURITY NOTICE**: v5.2 implements critical security hardening including Web Crypto API encryption, credential sanitization, and secure Supabase storage workflows. Previous versions contained exposed credentials and should be deprecated immediately.

---

## 🛠 Tactical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | HTML5, CSS3, Tailwind CSS | Tactical UI/UX |
| **State** | Alpine.js 3.x | Reactive components |
| **Backend** | Supabase (Auth, PostgreSQL, Storage) | Secure data & real-time |
| **Crypto** | Web Crypto API (AES-GCM, SHA-256, PBKDF2) | Client-side encryption |
| **Storage** | Supabase Storage + Signed URLs | Secure asset management |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Hosting** | Vercel + AWS S3/CloudFront | Edge distribution |
| **PWA** | Service Worker | Offline capability |

---

## 🔐 Security Architecture

### Client-Side Encryption Layer
- **Algorithm**: AES-GCM-256 for symmetric encryption
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Hashing**: SHA-256 for integrity verification
- **Scope**: All classified dossiers and frequency data encrypted before transmission

### Secure Storage Implementation
- Direct credential exposure eliminated
- Environment-based configuration management
- Signed URL generation for asset access
- Row Level Security (RLS) policies enforced

### Data Protection
```javascript
// Encryption Workflow
1. User Input → 2. Web Crypto API Encryption → 3. Ciphertext to Supabase → 4. Decryption on Authorized Retrieval
