/**
 * MOG Config Provider - Vercel Serverless Function
 * This file serves credentials from Vercel Env Vars to the frontend.
 */

export default function handler(req, res) {
  // CORS headers - allows your frontend to fetch this data
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /**
   * Return config
   * Priority: 
   * 1. Vercel Dashboard Environment Variables (Best Practice)
   * 2. Hardcoded fallback (The keys you provided)
   */
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://fgkljjgxecjmiiaptiug.supabase.co";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0aXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE";

  res.status(200).json({
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    contacts: {
      email: 'director.mog@gmail.com',
      whatsapp: '0813874921',
      social: {
        tiktok: 'https://tiktok.com/@ministryofgroove',
        facebook: 'https://www.facebook.com/share/1ELj9aECsQ/',
        instagram: 'https://www.instagram.com/ministryofgroove_hq?igsh=Y3Rwc24zcmtsY2xj',
        youtube: 'https://www.youtube.com/@MinistryofGroove-m1q'
      }
    }
  });
}
