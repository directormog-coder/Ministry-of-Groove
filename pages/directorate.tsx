import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

interface EventItem {
  id: string;
  title: string;
  event_date: string;
  status: string;
  tickets_sold: number;
}

interface LogItem {
  id: string;
  message: string;
  created_at: string;
}

export default function DirectorateCommand() {
  const router = useRouter();
  const [time, setTime] = useState<string>('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: eventData } = await supabase.from('events').select('*');
    if (eventData) setEvents(eventData);

    const { data: logData } = await supabase.from('transmission_logs').select('*').order('created_at', { ascending: false }).limit(5);
    if (logData) setLogs(logData);
    setLoading(false);
  };

  const triggerAction = async (actionName: string) => {
    await supabase.from('transmission_logs').insert([{ message: `COMMAND EXECUTED: ${actionName}` }]);
    fetchData();
  };

  return (
    <div className="container">
      <Head>
        <title>M.O.G. | DIRECTORATE COMMAND</title>
      </Head>

      <div className="command-header">
        <div className="brand">
          <img src="/logo.png" className="logo-small" alt="MOG" />
          <div>
            <h1>DIRECTORATE COMMAND</h1>
            <p className="uplink-status">UPLINK: SECURE // {time || '11:50:26'}</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="badge-director">👑 DIRECTOR</span>
          <button className="btn-exit" onClick={() => router.push('/login')}>EXIT</button>
        </div>
      </div>

      <div className="quick-actions-grid">
        <button className="card-btn red" onClick={() => triggerAction('GO LIVE')}>
          📡 GO LIVE
        </button>
        <button className="card-btn gold" onClick={() => triggerAction('QUICK PUSH ALERT')}>
          📣 QUICK PUSH ALERT
        </button>
        <button className="card-btn purple" onClick={() => triggerAction('PROTOCOL ZERO')}>
          ⚡ PROTOCOL ZERO
        </button>
        <button className="card-btn cyan" onClick={() => triggerAction('SCHEDULE SESSION')}>
          📅 SCHEDULE SESSION
        </button>
      </div>

      <div className="panel">
        <div className="panel-hdr">
          <h2>// MANAGE EVENTS</h2>
          <button className="btn-sub" onClick={() => triggerAction('NEW EVENT DRAFT')}>+ NEW EVENT</button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>EVENT</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>SOLD</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="center-text">OFFLINE</td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{e.event_date}</td>
                    <td>{e.status}</td>
                    <td>{e.tickets_sold}</td>
                    <td><button className="btn-sm">EDIT</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hdr">
          <h2>// TRANSMISSION LOGS</h2>
          <button className="btn-icon" onClick={fetchData}>🔄</button>
        </div>
        <div className="log-list">
          {logs.length === 0 ? (
            <p className="center-text">NO LOGS YET</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-entry">
                <span className="log-time">[{new Date(log.created_at).toLocaleTimeString()}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
