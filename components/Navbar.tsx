import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const navItems = [
    { label: 'HOME', path: '/', icon: '🏠' },
    { label: 'PROFILE', path: '/profile', icon: '👤' },
    { label: 'CHAT', path: '/chat', icon: '💬' },
    { label: 'VOTE', path: '/vote', icon: '🗳️' },
    { label: 'GALLERY', path: '/gallery', icon: '🖼️' },
    { label: 'LIVE STREAM', path: '/livestream', icon: '📻' },
    { label: 'TICKETS', path: '/tickets', icon: '🎟️' },
    { label: 'MUSIC VAULT', path: '/music', icon: '🎧' },
  ];

  return (
    <nav style={{
      display: 'flex',
      overflowX: 'auto',
      backgroundColor: '#050811',
      borderBottom: '1px solid #1e293b',
      padding: '10px 16px',
      gap: '10px',
      whiteSpace: 'nowrap',
      zIndex: 900
    }}>
      {navItems.map((item) => {
        const isActive = router.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              backgroundColor: isActive ? 'rgba(212, 175, 55, 0.15)' : '#0a101d',
              border: isActive ? '1px solid #d4af37' : '1px solid #1e293b',
              color: isActive ? '#d4af37' : '#00f2fe',
              padding: '6px 12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
