import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  LayoutDashboard,
  GraduationCap,
  Youtube,
  BookOpen,
  MapPin,
  Calendar,
  CheckSquare,
  TrendingUp,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'Attendance', icon: GraduationCap },
  { path: '/timetable', label: 'Timetable', icon: Calendar },
  { path: '/deadlines', label: 'Deadlines', icon: CheckSquare },
  { path: '/cgpa', label: 'CGPA Calc', icon: TrendingUp },
];

const COMMUNITY_ITEMS = [
  { path: '/professors', label: 'Professors', icon: GraduationCap },
  { path: '/youtube', label: 'YT Channels', icon: Youtube },
  { path: '/resources', label: 'Study Notes', icon: BookOpen },
  { path: '/spots', label: 'Campus Spots', icon: MapPin },
];

// Handles global themes: 'default', 'dark', 'pokemon', 'hollowknight'
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studentos_theme') || 'default';
  });

  useEffect(() => {
    // Clear existing theme classes
    document.body.classList.remove('dark-theme', 'pokemon-theme', 'hollowknight-theme');
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'pokemon') {
      document.body.classList.add('pokemon-theme');
    } else if (theme === 'hollowknight') {
      document.body.classList.add('hollowknight-theme');
    }
    
    localStorage.setItem('studentos_theme', theme);
  }, [theme]);

  return [theme, setTheme];
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(db.getCurrentUser());

    // Listen to login messages from Google popup
    const handleGoogleMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
        const email = event.data.email;
        const res = db.signInWithGoogle(email);
        if (res.success) {
          setUser(res.user);
          addToast(`Logged in successfully as ${res.user.name}!`, 'success');
          window.dispatchEvent(new Event('auth-change'));
        } else {
          addToast(res.message, 'danger');
        }
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    
    const handleAuthChange = () => setUser(db.getCurrentUser());
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('message', handleGoogleMessage);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [addToast]);

  const isActive = (path) => location.pathname === path;

  const handleGoogleSignIn = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/google-login.html',
      'Google Accounts Sign In',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
  };

  const handleLogout = () => {
    db.signOut();
    setUser(null);
    addToast('Logged out successfully.', 'info');
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>StudentOS</h1>
        <span>Thapar University</span>
      </div>

      {/* Gamified Theme Selector Panel */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          <Sparkles size={12} /> Choose Interface Vibe
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          <button
            onClick={() => setTheme('default')}
            style={{ padding: '5px', fontSize: '0.85rem', borderRadius: '4px', border: theme === 'default' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: 'var(--color-bg-card)', cursor: 'pointer' }}
            title="Thapar Default"
          >
            🎒
          </button>
          <button
            onClick={() => setTheme('dark')}
            style={{ padding: '5px', fontSize: '0.85rem', borderRadius: '4px', border: theme === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: 'var(--color-bg-card)', cursor: 'pointer' }}
            title="Dark Vessel"
          >
            🌙
          </button>
          <button
            onClick={() => setTheme('pokemon')}
            style={{ padding: '5px', fontSize: '0.85rem', borderRadius: '4px', border: theme === 'pokemon' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: 'var(--color-bg-card)', cursor: 'pointer' }}
            title="Pokémon Trainer"
          >
            ⚡
          </button>
          <button
            onClick={() => setTheme('hollowknight')}
            style={{ padding: '5px', fontSize: '0.85rem', borderRadius: '4px', border: theme === 'hollowknight' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: 'var(--color-bg-card)', cursor: 'pointer' }}
            title="Void Wanderer"
          >
            🕷️
          </button>
        </div>
      </div>

      {/* User profile block */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-light)' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user.photoUrl}
              alt={user.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-hover)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="btn btn-secondary btn-sm btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <LogIn size={14} /> Sign In (Google)
          </button>
        )}
      </div>

      <div className="sidebar-nav">
        <span className="sidebar-section-label">Personal Utility</span>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        <span className="sidebar-section-label">Community Intel</span>
        {COMMUNITY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const mobileItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/attendance', label: 'Attendance', icon: GraduationCap },
    { path: '/timetable', label: 'Timetable', icon: Calendar },
    { path: '/professors', label: 'Profs', icon: GraduationCap },
    { path: '/spots', label: 'Spots', icon: MapPin },
  ];

  return (
    <nav className="bottom-nav">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileHeader() {
  const location = useLocation();
  const { addToast } = useToast();
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(db.getCurrentUser());

    const handleGoogleMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
        const email = event.data.email;
        const res = db.signInWithGoogle(email);
        if (res.success) {
          setUser(res.user);
          addToast(`Logged in successfully as ${res.user.name}!`, 'success');
          window.dispatchEvent(new Event('auth-change'));
        } else {
          addToast(res.message, 'danger');
        }
      }
    };

    window.addEventListener('message', handleGoogleMessage);

    const handleAuth = () => setUser(db.getCurrentUser());
    window.addEventListener('auth-change', handleAuth);
    return () => {
      window.removeEventListener('message', handleGoogleMessage);
      window.removeEventListener('auth-change', handleAuth);
    };
  }, [addToast]);

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'StudentOS';
      case '/attendance': return 'Attendance';
      case '/timetable': return 'Timetable';
      case '/deadlines': return 'Deadlines';
      case '/cgpa': return 'CGPA Tracker';
      case '/professors': return 'Professors';
      case '/youtube': return 'YT Channels';
      case '/resources': return 'Resources';
      case '/spots': return 'Campus Spots';
      default: return 'StudentOS';
    }
  };

  const handleGoogleSignIn = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/google-login.html',
      'Google Accounts Sign In',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
  };

  const handleLogout = () => {
    db.signOut();
    setUser(null);
    addToast('Logged out successfully.', 'info');
    window.dispatchEvent(new Event('auth-change'));
  };

  const cycleTheme = () => {
    const themes = ['default', 'dark', 'pokemon', 'hollowknight'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  const getThemeEmoji = () => {
    if (theme === 'default') return '🎒';
    if (theme === 'dark') return '🌙';
    if (theme === 'pokemon') return '⚡';
    return '🕷️';
  };

  return (
    <header className="mobile-header">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {getTitle()}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={cycleTheme}
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Cycle Theme"
        >
          {getThemeEmoji()}
        </button>

        {user ? (
          <img
            src={user.photoUrl}
            alt={user.name}
            onClick={handleLogout}
            style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', border: '1px solid var(--color-border)' }}
            title="Logout"
          />
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
