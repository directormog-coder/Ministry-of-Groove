# Ministry of Groove

This project is intentionally structured as a static HTML/CSS/JS application hosted on Vercel. The app is designed to run from the root project directory with a lightweight Express local dev server and Vercel rewrites.

## Architecture

- `index.html` and `login.html` are the main entry points
- `pages/*.html` are static feature screens
- `js/*.js` contains shared app logic and config bootstrap
- `api/config.js` provides runtime environment config for Vercel
- `scripts/server.js` mirrors the Vercel local dev configuration

## Legacy files

The repository still contains a few experimental Next.js-style files (`pages/chat.tsx`, `pages/directory.tsx`, `hooks/useChat.ts`, `lib/supabaseClient.ts`, `pages/messages.tsx`). These are not part of the active static build and are retained only as references for future expansion.

## Working model

The active app flow is:

1. Load `js/config.js`
2. Initialize `js/supabase-client.js`
3. Use the browser session/localStorage for operative access
4. Serve static pages and API config through Vercel or the local Node server

This keeps the project consistent and prevents the app from mixing static-site routing with a different framework architecture.
