/**
 * M.O.G. — Live Broadcast API v6.1.0
 * /api/broadcast.js
 *
 * Handles creation, management and termination of Mux live streams.
 * Restricted to ADMIN and DIRECTOR ranks only.
 */

import Mux from '@mux/mux-node';
import { createClient } from '@supabase/supabase-js';

// ── CONSTANTS ──────────────────────────────────────────────
const ADMIN_EMAIL   = 'director.mog@gmail.com';
const ALLOWED_RANKS = ['ADMIN', 'DIRECTOR']; // Aligned with js/auth.js

// ── CLIENTS ────────────────────────────────────────────────
const mux = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
);

// Service-role client bypasses RLS — only safe server-side
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── HELPERS ────────────────────────────────────────────────

async function verifyDirector(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing authentication token', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // Validate JWT with Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { authorized: false, error: 'Invalid or expired session', status: 401 };
  }

  // Verify rank in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rank, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { authorized: false, error: 'Operative profile not found', status: 404 };
  }

  const isAuthorized = ALLOWED_RANKS.includes(profile.rank?.toUpperCase()) ||
                       profile.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAuthorized) {
    return {
      authorized: false,
      error: `Clearance Level Alpha Required. Current rank: ${profile.rank}`,
      status: 403
    };
  }

  return { authorized: true, user, profile };
}

async function log(description, userId, actionType = 'info', metadata = null) {
  await supabase.from('activity_log').insert({
    description,
    user_id: userId,
    action_type: actionType,
    metadata
  }).catch((e) => console.error('Logging failed:', e));
}

// ── MAIN HANDLER ───────────────────────────────────────────
export default async function handler(req, res) {

  // CORS protocols
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── Verify Clearance ──────────────────────────────────────
  const { authorized, error, status, user } = await verifyDirector(
    req.headers.authorization
  );

  if (!authorized) {
    return res.status(status).json({ error, code: 'CLEARANCE_DENIED' });
  }

  try {
    switch (req.method) {

      // ── START BROADCAST ───────────────────────────────────
      case 'POST': {
        const { eventId, title } = req.body || {};

        if (!eventId) {
          return res.status(400).json({ error: 'eventId required', code: 'MISSING_FIELD' });
        }

        // Create Mux live stream
        const liveStream = await mux.video.liveStreams.create({
          playback_policy: ['public'],
          new_asset_settings: {
            playback_policy: ['public'],
            mp4_support: 'standard'
          },
          latency_mode: 'low',
          reconnect_window: 60
        });

        const playbackId = liveStream.playback_ids?.[0]?.id;

        // Sync Global State
        await supabase.from('system_settings').upsert([
          { key: 'live_stream_id',   value: liveStream.id },
          { key: 'live_playback_id', value: playbackId || '' },
          { key: 'live_event_id',    value: eventId },
          { key: 'live_stream_key',  value: liveStream.stream_key }
        ]);

        // Update Event Table
        await supabase.from('events').update({ status: 'live', is_live: true }).eq('id', eventId);

        await log(`📡 UPLINK STARTED: ${title || 'Session Live'}`, user.id, 'alert', { streamId: liveStream.id });

        return res.status(200).json({
          success: true,
          streamKey: liveStream.stream_key,
          rtmpUrl: 'rtmps://global-live.mux.com:443/app',
          playbackId
        });
      }

      // ── END BROADCAST ─────────────────────────────────────
      case 'DELETE': {
        const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'live_stream_id').single();
        const streamId = setting?.value;

        if (!streamId) return res.status(404).json({ error: 'No active stream' });

        await mux.video.liveStreams.disable(streamId);

        // Reset system to standby
        await supabase.from('system_settings').upsert([
          { key: 'live_stream_id', value: '' },
          { key: 'live_playback_id', value: '' },
          { key: 'live_stream_key', value: '' }
        ]);

        await log('⏹ BROADCAST ENDED', user.id, 'info');
        return res.status(200).json({ success: true, message: 'Broadcast Terminated' });
      }

      // ── GET STATUS ────────────────────────────────────────
      case 'GET': {
        const { data: settings } = await supabase.from('system_settings').select('key, value').in('key', ['live_playback_id', 'live_stream_id']);
        const config = Object.fromEntries((settings || []).map(s => [s.key, s.value]));

        return res.status(200).json({
          isLive: !!config['live_stream_id'],
          playbackId: config['live_playback_id']
        });
      }

      default:
        return res.status(405).end();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal system failure' });
  }
}
