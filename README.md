# 🎛️ MINISTRY OF GROOVE — M.O.G.
**Secure Operative Network & Directorate Command System**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-gold?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](LICENSE)

---

## 🎯 Overview

The Ministry of Groove (M.O.G.) is a secure, role-based web application built as a PWA.  
It features dual-interface architecture for operatives and the Directorate.

| Interface | Theme | Access |
|-----------|-------|--------|
| **Operative Hub** | Teal / Circuit | All operatives |
| **Directorate HQ** | Gold / Red | Directors only |

**Established**: Emalahleni Uplink II, 2026

---

## 🚀 Live

**Production**: `https://ministry-of-groove.vercel.app`

| Role | Email | Destination |
|------|-------|-------------|
| Director | director.mog@gmail.com | `/pages/directorate.html` |
| Operative | Any verified email | `/index.html` |

---

## 🏗️ Project Structure

```
ministry-of-groove/
├── index.html                  ← Operative Hub (main app)
├── login.html                  ← Secure Access Terminal
├── service-worker.js           ← PWA offline support
├── manifest.json               ← PWA manifest
├── vercel.json                 ← Deployment config + rewrites + headers
├── package.json
├── .env.example                ← Copy to .env.local for local dev
│
├── api/
│   └── config.js               ← Vercel serverless function (credentials)
│
├── js/
│   ├── config.js               ← Client config + env detection + fallback credentials
│   ├── supabase-client.js      ← Supabase init (env-aware, graceful fallback)
│   ├── auth.js                 ← Session management + role-based routing
│   └── crypto-utils.js         ← AES-256-GCM + SHA-256 + secure tokens
│
├── pages/
│   ├── directorate.html        ← Director Master Command (α clearance)
│   ├── gallery.html            ← Media Curator
│   ├── frequency.html          ← Amapiano Chart + voting
│   ├── dispatch.html           ← Directorate Directive Log
│   ├── archives.html           ← Classified Vault
│   ├── dossier.html            ← Operative Personnel Dossier
│   ├── privacy.html            ← Privacy Shield
│   └── tos.html                ← Terms of Service
│
├── scripts/
│   └── server.js               ← Local Express dev server (mirrors Vercel)
│
├── assets/
│   ├── images/                 ← logo.png, icons, screenshots
│   ├── videos/
│   └── audio/
│
└── .github/
    ├── workflows/
    │   └── security-check.yml  ← Audit + ESLint + secret scan on push
    └── CODEOWNERS              ← Director review required on critical files
```

---

## ⚡ Quick Start

### Option A — Local Express server (mirrors Vercel exactly)
```bash
cp .env.example .env.local
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY in .env.local

npm install
npm run dev
# Opens at http://localhost:3000
```

### Option B — Vercel CLI (uses vercel dev)
```bash
cp .env.example .env.local
npm install
npm run dev:vercel
# Uses vercel.json rewrites locally
```

### Option C — GitHub Pages / Static hosting
No server needed. The app detects a static host automatically via `js/config.js`  
and uses the hardcoded fallback credentials (anon key — safe to expose).

---

## 🔐 How Credentials Work

The app resolves Supabase credentials in this order:

```
Vercel / Local dev  →  GET /api/config  →  reads env vars  ✓  (preferred)
                           ↓ fails
GitHub Pages / file →  js/config.js fallback credentials    ✓  (safe, anon key only)
```

`js/config.js` fires **synchronously** before `supabase-client.js` starts its async fetch.  
So `window.sb` is always available — no race conditions, no null client.

---

## 🛡️ Security

| Layer | Implementation |
|-------|---------------|
| Auth | Supabase Auth — email/password, Google OAuth, magic link |
| Credentials | Env vars on Vercel, never in git (except anon key fallback) |
| Transport | HTTPS always, Supabase TLS |
| Headers | CSP, X-Frame-Options, X-XSS-Protection via vercel.json |
| Client-side crypto | AES-256-GCM + PBKDF2 via Web Crypto API (`crypto-utils.js`) |
| Role control | DB rank check + auth metadata + hardcoded admin email |
| CI/CD | GitHub Actions: npm audit + TruffleHog + ESLint + OWASP on every push |

---

## ☁️ Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy — `vercel.json` handles all routing

---

## 📡 Supabase Tables Required

```sql
-- Operative profiles
create table profiles (
    id           uuid primary key references auth.users,
    email        text,
    username     text,
    codename     text unique,
    rank         text default 'INITIATE',
    department   text default 'UNASSIGNED',
    bio          text,
    avatar_url   text,
    stats        jsonb default '{"missions":0,"contributions":0,"influence":0,"loyalty":100,"groove":50}',
    skills       text[] default '{}',
    achievements text[] default '{}',
    network      text default 'M.O.G.',
    joined_at    timestamptz default now(),
    last_active  timestamptz default now(),
    updated_at   timestamptz
);

-- Activity log
create table activity_log (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users,
    type        text,
    description text,
    network     text,
    created_at  timestamptz default now()
);

-- Directives from Directorate
create table directives (
    id        uuid primary key default gen_random_uuid(),
    content   text,
    priority  text default 'NORMAL',
    timestamp timestamptz default now(),
    acknowledged     bool default false,
    acknowledged_by  uuid,
    acknowledged_at  timestamptz
);

-- Media assets
create table media_assets (
    id         text primary key,
    type       text,
    title      text,
    artist     text,
    src        text,
    thumb      text,
    duration   text,
    tag        text,
    created_at timestamptz default now()
);

-- Media likes (counts)
create table media_likes (
    media_id text primary key,
    title    text,
    count    int default 0
);

-- Media likes (per-user)
create table media_likes_users (
    media_id   text,
    user_id    uuid,
    created_at timestamptz,
    primary key (media_id, user_id)
);

-- Ticker messages (Directorate broadcast)
create table ticker_messages (
    id         uuid primary key default gen_random_uuid(),
    message    text,
    active     bool default true,
    created_at timestamptz default now()
);

-- System settings (key/value)
create table system_settings (
    key        text primary key,
    value      text,
    updated_at timestamptz default now()
);

-- Gallery
create table gallery (
    id         uuid primary key default gen_random_uuid(),
    url        text,
    type       text,
    name       text,
    likes      int default 0,
    created_at timestamptz default now()
);

-- Frequency / chart votes
create table frequency (
    id     uuid primary key default gen_random_uuid(),
    title  text,
    artist text,
    votes  int default 0
);
```

---

## 📞 Contact

| Channel | Details |
|---------|---------|
| Email | director.mog@gmail.com |
| WhatsApp | 081 387 4921 |
| TikTok | [@ministryofgroove](https://tiktok.com/@ministryofgroove) |
| Facebook | [Ministry of Groove](https://www.facebook.com/share/1ELj9aECsQ/) |
| Instagram | [@ministryofgroove_hq](https://www.instagram.com/ministryofgroove_hq) |
| YouTube | [Ministry of Groove](https://www.youtube.com/@MinistryofGroove-m1q) |

---

*Ministry of Groove // Emalahleni Uplink II // Est. 2026*  
*Decrypting the Culture. Synchronizing the Grid.*
