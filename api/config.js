// This runs on Vercel's server, not in browser
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return config - these env vars are set in Vercel dashboard
  res.status(200).json({
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    // Contacts config (safe to expose)
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
