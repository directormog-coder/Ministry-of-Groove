/**
 * M.O.G. — Live Broadcast API
 * /api/broadcast.js
 *
 * Handles creation, management and termination of Mux live streams.
 * Restricted to ADMIN rank (director.mog@gmail.com) only.
 *
 * Supported methods:
 *   POST   /api/broadcast  — Create a new live stream
 *   DELETE /api/broadcast  — End / disable a live stream
 *   GET    /api/broadcast  — Get current stream status
 */

import Mux from '@mux/mux-node';
import { createClient } from '@supabase/supabase-js';

// ── CONSTANTS ──────────────────────────────────────────────
const ADMIN_EMAIL   = 'director.mog@gmail.com';
const ALLOWED_RANKS = ['ADMIN'];

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

/**
 * Verify that the requesting user has Directorate clearance.
 * Checks both the auth session token and the rank in profiles.
 */
async function verifyDirector(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing authentication token', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // Validate JWT with Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { authorized: false, error: 'Invalid or expired session', status: 401 };
  }

  // Double-check rank in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rank, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { authorized: false, error: 'Operative profile not found', status: 404 };
  }

  const isAdmin = ALLOWED_RANKS.includes(profile.rank) ||
                  profile.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    return {
      authorized: false,
      error: `Clearance Level Alpha Required. Current rank: ${profile.rank}`,
      status: 403
    };
  }

  return { authorized: true, user, profile };
}

/**
 * Log an action to the activity_log table.
 */
async function log(description, userId, actionType = 'info', metadata = null) {
  await supabase.from('activity_log').insert({
    description,
    user_id: userId,
    action_type: actionType,
    metadata
  }).catch(() => {}); // Non-blocking — never fail the main request over logging
}

// ── MAIN HANDLER ───────────────────────────────────────────
export default async function handler(req, res) {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── Verify Director clearance ──────────────────────────
  const { authorized, error, status, user } = await verifyDirector(
    req.headers.authorization
  );

  if (!authorized) {
    return res.status(status).json({
      error,
      code: 'CLEARANCE_DENIED'
    });
  }

  // ── Route by method ────────────────────────────────────
  try {
    switch (req.method) {

      // ── CREATE LIVE STREAM ─────────────────────────────
      case 'POST': {
        const { eventId, title } = req.body || {};

        if (!eventId) {
          return res.status(400).json({ error: 'eventId is required', code: 'MISSING_FIELD' });
        }

        // Verify the event exists and belongs to this system
        const { data: event } = await supabase
          .from('events')
          .select('id, title, status')
          .eq('id', eventId)
          .single();

        if (!event) {
          return res.status(404).json({ error: 'Event not found', code: 'EVENT_NOT_FOUND' });
        }

        if (event.status === 'live') {
          return res.status(409).json({ error: 'Event is already live', code: 'ALREADY_LIVE' });
        }

        // Create Mux live stream
        const liveStream = await mux.video.liveStreams.create({
          playback_policy: ['public'],
          new_asset_settings: {
            playback_policy: ['public'],
            mp4_support: 'standard' // Enables download after stream ends
          },
          latency_mode: 'low',
          reconnect_window: 60, // seconds before stream is considered disconnected
          max_continuous_duration: 43200 // 12 hours max
        });

        const playbackId = liveStream.playback_ids?.[0]?.id;

        // Save stream details to Supabase for the app to reference
        await supabase.from('system_settings').upsert([
          { key: 'live_stream_id',   value: liveStream.id },
          { key: 'live_playback_id', value: playbackId || '' },
          { key: 'live_event_id',    value: eventId },
          { key: 'live_stream_key',  value: liveStream.stream_key }
        ]);

        // Mark event as live
        await supabase
          .from('events')
          .update({ status: 'live', is_live: true })
          .eq('id', eventId);

        await log(
          `📡 LIVE BROADCAST STARTED: ${title || event.title}`,
          user.id,
          'alert',
          { streamId: liveStream.id, eventId }
        );

        return res.status(200).json({
          success:     true,
          streamId:    liveStream.id,
          streamKey:   liveStream.stream_key,
          rtmpUrl:     'rtmps://global-live.mux.com:443/app',
          playbackId,
          playbackUrl: playbackId
            ? `https://stream.mux.com/${playbackId}.m3u8`
            : null,
          status:      liveStream.status
        });
      }

      // ── END LIVE STREAM ────────────────────────────────
      case 'DELETE': {
        // Retrieve current stream ID from settings
        const { data: setting } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'live_stream_id')
          .single();

        const streamId = setting?.value;

        if (!streamId) {
          return res.status(404).json({ error: 'No active stream found', code: 'NO_STREAM' });
        }

        // Disable Mux stream (stops RTMP input, finalises recording)
        await mux.video.liveStreams.disable(streamId);

        // Get event ID to mark as completed
        const { data: eventSetting } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'live_event_id')
          .single();

        if (eventSetting?.value) {
          await supabase
            .from('events')
            .update({ status: 'completed', is_live: false })
            .eq('id', eventSetting.value);
        }

        // Clear live stream settings
        await supabase.from('system_settings').upsert([
          { key: 'live_stream_id',   value: '' },
          { key: 'live_playback_id', value: '' },
          { key: 'live_event_id',    value: '' },
          { key: 'live_stream_key',  value: '' }
        ]);

        await log('⏹ BROADCAST ENDED — STREAM ARCHIVED', user.id, 'alert', { streamId });

        return res.status(200).json({ success: true, message: 'Broadcast terminated' });
      }

      // ── GET STREAM STATUS ──────────────────────────────
      case 'GET': {
        const { data: settings } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['live_stream_id', 'live_playback_id', 'live_event_id']);

        const config = Object.fromEntries(
          (settings || []).map(s => [s.key, s.value])
        );

        const streamId = config['live_stream_id'];

        if (!streamId) {
          return res.status(200).json({ isLive: false, status: 'idle' });
        }

        // Fetch real status from Mux
        const stream = await mux.video.liveStreams.retrieve(streamId);

        return res.status(200).json({
          isLive:      stream.status === 'active',
          status:      stream.status,
          streamId:    stream.id,
          playbackId:  config['live_playback_id'] || null,
          playbackUrl: config['live_playback_id']
            ? `https://stream.mux.com/${config['live_playback_id']}.m3u8`
            : null,
          eventId:     config['live_event_id'] || null
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    }

  } catch (err) {
    console.error('[M.O.G. Broadcast API Error]', err);

    await log(
      `❌ BROADCAST API ERROR: ${err.message}`,
      user?.id,
      'error',
      { message: err.message, stack: err.stack?.substring(0, 200) }
    );

    return res.status(500).json({
      error: 'Broadcast uplink failed',
      code:  'UPLINK_FAILURE',
      ...(process.env.NODE_ENV === 'development' && { detail: err.message })
    });
  }
}
