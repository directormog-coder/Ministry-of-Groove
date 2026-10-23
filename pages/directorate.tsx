import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import AudioPlayer from '../components/AudioPlayer';

export default function DirectorateCommand() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'media' | 'event' | 'poll' | 'announcement'>('media');
  const [loading, setLoading] = useState(false);

  // 1. Session Media Form State
  const [mediaTitle, setMediaTitle] = useState('');
  const [sessionTag, setSessionTag] = useState('SESSION 01');
  const [mediaType, setMediaType] = useState('Photo');
  const [accessLevel, setAccessLevel] = useState('All Operatives (Free)');
  const [mediaConfirmed, setMediaConfirmed] = useState(false);

  // 2. Create Event Form State
  const [eventTitle, setEventTitle] = useState('AMAPIANO SESSIONS VOL.1');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [doorsOpen, setDoorsOpen] = useState('18:00');
  const [publicLocation, setPublicLocation] = useState('LOCATION CLASSIFIED');
  const [fullLocation, setFullLocation] = useState('Emalahleni, Mpumalanga');
  const [vipPrice, setVipPrice] = useState('350');
  const [vipQty, setVipQty] = useState('50');
  const [genPrice, setGenPrice] = useState('150');
  const [genQty, setGenQty] = useState('150');

  // 3. Poll Songs Form State
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [recordLabel, setRecordLabel] = useState('');
  const [weekNum, setWeekNum] = useState(14);
  const [yearNum, setYearNum] = useState(2026);
  const [pollConfirmed, setPollConfirmed] = useState(false);

  // 4. Announcement Form State
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // Deploy Session Media
  const handleDeployMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaConfirmed) return alert('Please confirm media ownership checkbox.');
    setLoading(true);

    try {
      const { error } = await supabase.from('vault_media').insert([{
        title: mediaTitle,
        session_tag: sessionTag,
        media_type: mediaType,
        access_level: accessLevel,
      }]);
      if (error) throw error;

      await supabase.from('transmission_logs').insert([{ message: `NEW VAULT MEDIA DEPLOYED: ${mediaTitle}` }]);
      alert('✓ MEDIA SUCCESSFULLY DEPLOYED TO VAULT!');
      setMediaTitle('');
    } catch (err: any) {
      alert('Deployment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('events').insert([{
        title: eventTitle,
        description: eventDesc,
        event_date: eventDate,
        doors_open: doorsOpen,
        public_location: publicLocation,
        full_location: fullLocation,
        vip_price: parseFloat(vipPrice),
        vip_qty: parseInt(vipQty),
        general_price: parseFloat(genPrice),
        general_qty: parseInt(genQty),
      }]);
      if (error) throw error;

      await supabase.from('transmission_logs').insert([{ message: `NEW EVENT PUBLISHED: ${eventTitle}` }]);
      alert('✓ EVENT & TICKET TIERS PUBLISHED TO NETWORK!');
    } catch (err: any) {
      alert('Event creation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Song to Poll
  const handleAddPollSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollConfirmed) return alert('Please confirm editorial commentary checkbox.');
    setLoading(true);

    try {
      const { error } = await supabase.from('poll_songs').insert([{
        song_title: songTitle,
        artist_name: artistName,
        record_label: recordLabel,
        week_number: weekNum,
        year: yearNum
      }]);
      if (error) throw error;

      await supabase.from('transmission_logs').insert([{ message: `POLL SONG ADDED: ${songTitle} by ${artistName}` }]);
      alert(`✓ "${songTitle}" ADDED TO TOP 10 VOTING POLL!`);
      setSongTitle('');
      setArtistName('');
    } catch (err: any) {
      alert('Poll add failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Transmit Broadcast Announcement
  const handleTransmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('transmission_logs').insert([{
        message: `📢 DIRECTORATE ANNOUNCEMENT: ${announcementMsg}`
      }]);
      if (error) throw error;

      alert('✓ ANNOUNCEMENT TRANSMITTED TO ALL OPERATIVES!');
      setAnnouncementMsg('');
    } catch (err: any) {
      alert('Transmission failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <Head>
        <title>M.O.G. | DIRECTORATE UPLOAD CENTRE</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '15px', color: '#d4af37', fontFamily: 'monospace', margin: 0 }}>DIRECTORATE COMMAND</h1>
          <span style={{ fontSize: '10px', color: '#00f2fe', fontFamily: 'monospace' }}>UPLINK: SECURE // ADMIN ONLY</span>
        </div>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '4px' }}>
          → EXIT
        </button>
      </div>

      {/* Upload Centre Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('media')}
          style={{ padding: '8px 4px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: activeTab === 'media' ? '#0d2238' : '#0a101d', border: activeTab === 'media' ? '1px solid #00f2fe' : '1px solid #1e293b', color: activeTab === 'media' ? '#00f2fe' : '#8e9bae', cursor: 'pointer', borderRadius: '4px' }}
        >
          🎬 MEDIA
        </button>
        <button 
          onClick={() => setActiveTab('event')}
          style={{ padding: '8px 4px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: activeTab === 'event' ? '#0d2238' : '#0a101d', border: activeTab === 'event' ? '1px solid #00f2fe' : '1px solid #1e293b', color: activeTab === 'event' ? '#00f2fe' : '#8e9bae', cursor: 'pointer', borderRadius: '4px' }}
        >
          📅 EVENT
        </button>
        <button 
          onClick={() => setActiveTab('poll')}
          style={{ padding: '8px 4px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: activeTab === 'poll' ? '#0d2238' : '#0a101d', border: activeTab === 'poll' ? '1px solid #00f2fe' : '1px solid #1e293b', color: activeTab === 'poll' ? '#00f2fe' : '#8e9bae', cursor: 'pointer', borderRadius: '4px' }}
        >
          🗳️ POLL
        </button>
        <button 
          onClick={() => setActiveTab('announcement')}
          style={{ padding: '8px 4px', fontSize: '10px', fontFamily: 'monospace', backgroundColor: activeTab === 'announcement' ? '#0d2238' : '#0a101d', border: activeTab === 'announcement' ? '1px solid #00f2fe' : '1px solid #1e293b', color: activeTab === 'announcement' ? '#00f2fe' : '#8e9bae', cursor: 'pointer', borderRadius: '4px' }}
        >
          📢 NOTICE
        </button>
      </div>

      {/* 1. SESSION MEDIA TAB */}
      {activeTab === 'media' && (
        <form onSubmit={handleDeployMedia} className="panel" style={{ border: '1px solid #00f2fe' }}>
          <h2 style={{ color: '#00f2fe', fontSize: '12px', fontFamily: 'monospace', marginTop: 0 }}>// DEPLOY SESSION MEDIA TO VAULT</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>TITLE *</label>
            <input type="text" value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} required placeholder="e.g. SESSION 01 HIGHLIGHTS" style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>MEDIA TYPE</label>
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}>
              <option value="Photo">📷 Photo</option>
              <option value="Video">🎥 Video</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" checked={mediaConfirmed} onChange={(e) => setMediaConfirmed(e.target.checked)} id="mediaCheck" />
            <label htmlFor="mediaCheck" style={{ color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace' }}>Confirm media permission and rights clearance.</label>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#00f2fe', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}>
            {loading ? 'DEPLOYING...' : '↑ DEPLOY TO VAULT'}
          </button>
        </form>
      )}

      {/* 2. CREATE EVENT TAB */}
      {activeTab === 'event' && (
        <form onSubmit={handleCreateEvent} className="panel" style={{ border: '1px solid #d4af37' }}>
          <h2 style={{ color: '#d4af37', fontSize: '12px', fontFamily: 'monospace', marginTop: 0 }}>// CREATE NEW EVENT & TICKET TIERS</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>EVENT TITLE *</label>
            <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
          </div>
          <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>VIP PRICE (R)</label>
              <input type="number" value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>GENERAL PRICE (R)</label>
              <input type="number" value={genPrice} onChange={(e) => setGenPrice(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#d4af37', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}>
            {loading ? 'CREATING...' : '✓ CREATE EVENT + TICKETS'}
          </button>
        </form>
      )}

      {/* 3. POLL SONGS TAB */}
      {activeTab === 'poll' && (
        <form onSubmit={handleAddPollSong} className="panel" style={{ border: '1px solid #00f2fe' }}>
          <h2 style={{ color: '#00f2fe', fontSize: '12px', fontFamily: 'monospace', marginTop: 0 }}>// ADD SONG TO TOP 10 POLL</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>SONG TITLE *</label>
            <input type="text" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} required placeholder="e.g. Mnike" style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>ARTIST NAME *</label>
            <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} required placeholder="e.g. Tyler ICU" style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" checked={pollConfirmed} onChange={(e) => setPollConfirmed(e.target.checked)} id="pollCheck" />
            <label htmlFor="pollCheck" style={{ color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace' }}>Confirm fan-voting editorial commentary use only.</label>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#00f2fe', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}>
            {loading ? 'ADDING...' : '+ ADD TO POLL'}
          </button>
        </form>
      )}

      {/* 4. ANNOUNCEMENT TAB */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleTransmitAnnouncement} className="panel" style={{ border: '1px solid #d4af37' }}>
          <h2 style={{ color: '#d4af37', fontSize: '12px', fontFamily: 'monospace', marginTop: 0 }}>// BROADCAST NETWORK ANNOUNCEMENT</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#8e9bae', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>MESSAGE TO ALL OPERATIVES *</label>
            <textarea value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} required rows={4} placeholder="Type your broadcast message here..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a101d', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#d4af37', border: 'none', color: '#050811', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}>
            {loading ? 'TRANSMITTING...' : '📡 TRANSMIT TO ALL OPERATIVES'}
          </button>
        </form>
      )}

      <AudioPlayer />
    </div>
  );
}
