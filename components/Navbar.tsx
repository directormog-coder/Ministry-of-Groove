import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const navItems = [
    { label: 'DIRECTORATE', path: '/directorate', icon: '👑' },
    { label: 'TICKETS', path: '/tickets', icon: '🎟️' },
    { label: 'DISPATCH', path: '/dispatch', icon: '💬' },
    { label: 'LIVE STUDIO', path: '/live', icon: '📡' },
    { label: 'PODCAST', path: '/podcast', icon: '🎙️' },
    { label: 'SCANNER', path: '/scanner', icon: '🔍' },
    { label: 'DEMO DROP', path: '/lineup', icon: '🎵' },
  ];

  return (
    <nav style={{
      display: 'flex',
      overflowX: 'auto',
      backgroundColor: '#050811',
      borderBottom: '1px solid #1e293b',
      padding: '10px 16px',
      gap: '12px',
      whiteSpace: 'nowrap',
      zIndex: 900
    }}>
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => router.push(item.path)}
          style={{
            backgroundColor: router.pathname === item.path ? 'rgba(0, 242, 254, 0.15)' : '#0a101d',
            border: router.pathname === item.path ? '1px solid #00f2fe' : '1px solid #1e293b',
            color: router.pathname === item.path ? '#00f2fe' : '#8e9bae',
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
      ))}
    </nav>
  );
}
