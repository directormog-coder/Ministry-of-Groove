import Mux from '@mux/mux-node';
import { createClient } from '@supabase/supabase-client';

const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { userId } = req.body;

    // 1. Verify Directorate Clearance
    const { data: profile } = await supabase
        .from('profiles')
        .select('rank')
        .eq('id', userId)
        .single();

    if (profile?.rank !== 'DIRECTOR') {
        return res.status(403).json({ error: "Clearance Level Alpha Required" });
    }

    try {
        // 2. Create Mux Live Stream
        const liveStream = await Video.LiveStreams.create({
            playback_policy: 'public',
            new_asset_settings: { playback_policy: 'public' },
            latency_mode: 'low'
        });

        res.status(200).json({
            streamKey: liveStream.stream_key,
            url: "rtmps://global-live.mux.com:443/app",
            playbackId: liveStream.playback_ids[0].id
        });
    } catch (err) {
        res.status(500).json({ error: "Broadcast Uplink Failed" });
    }
}
