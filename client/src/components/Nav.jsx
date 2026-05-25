import { Link, useLocation } from 'react-router-dom';

function Logo() {
  return (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Road background circle */}
      <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.15)" />
      {/* Road surface */}
      <rect x="4" y="18" width="24" height="8" rx="2" fill="rgba(255,255,255,0.9)" />
      {/* Center dashes */}
      <rect x="9" y="21.5" width="4" height="1.5" rx="0.75" fill="#1a56db" />
      <rect x="15" y="21.5" width="4" height="1.5" rx="0.75" fill="#1a56db" />
      {/* Car body */}
      <rect x="7" y="12" width="18" height="8" rx="2" fill="#fff" />
      {/* Car roof */}
      <path d="M11 12 L13.5 7.5 Q14 7 14.8 7 H17.2 Q18 7 18.5 7.5 L21 12 Z" fill="#fff" />
      {/* Windshield */}
      <path d="M12.5 12 L14.2 9 H17.8 L19.5 12 Z" fill="#93c5fd" />
      {/* Wheels */}
      <circle cx="11" cy="20" r="2.5" fill="#334155" />
      <circle cx="11" cy="20" r="1" fill="#94a3b8" />
      <circle cx="21" cy="20" r="2.5" fill="#334155" />
      <circle cx="21" cy="20" r="1" fill="#94a3b8" />
      {/* Headlight */}
      <rect x="23.5" y="14" width="2" height="1.5" rx="0.75" fill="#fde68a" />
      {/* Tail light */}
      <rect x="6.5" y="14" width="2" height="1.5" rx="0.75" fill="#fca5a5" />
    </svg>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(90deg, #1e40af 0%, #1a56db 100%)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    height: 68,
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    marginRight: 8,
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1,
  },
  brandName: {
    color: '#fff',
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: '-0.5px',
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 24,
    background: 'rgba(255,255,255,0.2)',
  },
  link: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'background 0.15s',
  },
  active: {
    color: '#fff',
    background: 'rgba(255,255,255,0.15)',
  },
};

export default function Nav() {
  const { pathname } = useLocation();
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <Logo />
        <div style={styles.brandText}>
          <span style={styles.brandName}>RoadReady</span>
          <span style={styles.brandTagline}>Roadside Assistance</span>
        </div>
      </Link>

      <div style={styles.divider} />

      <Link to="/" style={{ ...styles.link, ...(pathname === '/' ? styles.active : {}) }}>
        Request Help
      </Link>
      <Link to="/tech" style={{ ...styles.link, ...(pathname === '/tech' ? styles.active : {}) }}>
        Technician View
      </Link>
    </nav>
  );
}
