# 🎛️ MINISTRY OF GROOVE (M.O.G.)

**Secure Operative Network & Directorate Command System**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
- [Contact](#contact)

---

## 🎯 Overview

The Ministry of Groove (M.O.G.) is a secure, role-based web application featuring dual-interface architecture:

| Interface | Logo | Theme | Access |
|-----------|------|-------|--------|
| **Operative Network** | `logo.png` | Teal/Circuit | All operatives |
| **Directorate HQ** | `1000219947.png` | Red/Classified | Directors only |

**Established**: Emalahleni Uplink II, 2026

---

## 🚀 Live Demo

**Production URL**: `https://ministry-of-groove.vercel.app`

| Role | Login | Destination |
|------|-------|-------------|
| Director | director.mog@gmail.com | `/pages/directorate.html` |
| Operative | Any verified email | `/index.html` |

---

## ✨ Features

### 🔐 Authentication
- Email/password with rate limiting
- Magic link (biometric-style) authentication
- AES-256-GCM encrypted sessions
- Session fingerprinting
- 2FA-ready infrastructure

### 👥 Operative Features
- Profile management with avatars
- Real-time stats tracking
- Network directory
- Activity logging
- Department assignments

### 🏛️ Directorate Features
- Global directive broadcasting
- Emergency lockdown protocols
- Full operative oversight
- Brand wealth metrics

---

## 🏗️ Architecture
