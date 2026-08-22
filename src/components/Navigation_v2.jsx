import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  LogIn,
  LogOut,
  Sparkles,
  Menu,
  X
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

const THEMES = [
  { id: 'default', name: 'Thapar Default', emoji: '🎒' },
  { id: 'dark', name: 'Dark Vessel', emoji: '🌙' },
  { id: 'pokemon', name: 'Pokémon Trainer', emoji: '⚡' },
  { id: 'hollowknight', name: 'Void Wanderer', emoji: '🕷️' },
];

/**
 * Accessible theme manager hook
 */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studentos_theme') || 'default';
  });

  useEffect(() => {
    // Clear existing theme classes
    document.body.classList.remove('dark-theme', 'pokemon-theme', 'hollowknight-theme');
    
    // Apply new theme
    if (theme !== 'default') {
      document.body.classList.add(`${theme}-theme`);
    }
    
    // Persist theme preference
    try {
      localStorage.setItem('studentos_theme', theme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  }, [theme]);

  return [theme, setTheme];
}

/**
 * Secure auth change listener
 */
function useAuthListener(callback) {
  useEffect(() => {
    const unsubscribe = db.onAuthChange(callback);
    return unsubscribe || (() => {});
  }, [callback]);
}

/**
 * Theme selector component
 */
function ThemeSelector({ currentTheme, onThemeChange }) {
  return (
    <fieldset className="theme-selector">
      <legend className="sr-only">Choose Interface Theme</legend>
      <div className="theme-selector-label">
        <Sparkles size={14} aria-hidden="true" /> Choose Vibe
      </div>
      <div className="theme-buttons">
        {THEMES.map(({ id, name, emoji }) => (
          <button
            key={id}
            onClick={() => onThemeChange(id)}
            aria-label={name}
            aria-pressed={currentTheme === id}
            className={`theme-button ${currentTheme === id ? 'active' : ''}`}
            title={name}
          >
            <span role="img" aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * User profile section
 */
function UserProfile({ user, onLogout, onSignIn }) {
  if (user) {
    return (
      <div className="user-profile">
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <button
          onClick={onLogout}
          className="btn-icon"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSignIn}
      className="btn btn-secondary btn-full"
      aria-label="Sign in with Google"
    >
      <LogIn size={14} aria-hidden="true" /> Sign In
    </button>
  );
}

/**
 * Navigation menu item
 */
function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`nav-link ${isActive ? 'active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

/**
 * Desktop Sidebar
 */
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);

  // Initial user load
  useEffect(() => {
    setUser(db.getCurrentUser());
  }, []);

  // Listen for auth changes
  useAuthListener(() => {
    setUser(db.getCurrentUser());
  });

  // Handle Google sign-in messages securely
  useEffect(() => {
    const handleGoogleMessage = (event) => {
      // Validate message origin for security
      if (!event.data || event.data.type !== 'GOOGLE_SIGN_IN_SUCCESS') {
        return;
      }

      const email = event.data.email;
      if (!email || typeof email !== 'string') {
        addToast('Invalid authentication response', 'danger');
        return;
      }

      const res = db.signInWithGoogle(email);
      if (res.success) {
        setUser(res.user);
        addToast(`Welcome, ${res.user.name}!`, 'success');
      } else {
        addToast(res.message, 'danger');
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, [addToast]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const handleSignIn = useCallback(() => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/google-login.html',
      'Sign In',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
  }, []);

  const handleLogout = useCallback(() => {
    db.signOut();
    setUser(null);
    addToast('Signed out successfully', 'info');
  }, [addToast]);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-brand">
        <h1>StudentOS</h1>
        <span>Thapar University</span>
      </div>

      <section className="sidebar-section">
        <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
      </section>

      <section className="sidebar-section sidebar-user">
        <UserProfile 
          user={user} 
          onSignIn={handleSignIn}
          onLogout={handleLogout}
        />
      </section>

      <nav className="sidebar-nav">
        <h2 className="sidebar-section-label">Utilities</h2>
        {MENU_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            onClick={() => handleNavigate(item.path)}
          />
        ))}

        <h2 className="sidebar-section-label">Community</h2>
        {COMMUNITY_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
}

/**
 * Mobile bottom navigation
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const mobileItems = useMemo(() => [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/attendance', label: 'Attendance', icon: GraduationCap },
    { path: '/timetable', label: 'Timetable', icon: Calendar },
    { path: '/professors', label: 'Profs', icon: GraduationCap },
    { path: '/spots', label: 'Spots', icon: MapPin },
  ], []);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
            aria-current={isActive(item.path) ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="sr-only">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Mobile header component
 */
export function MobileHeader() {
  const location = useLocation();
  const { addToast } = useToast();
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(db.getCurrentUser());
  }, []);

  useAuthListener(() => {
    setUser(db.getCurrentUser());
  });

  useEffect(() => {
    const handleGoogleMessage = (event) => {
      if (!event.data || event.data.type !== 'GOOGLE_SIGN_IN_SUCCESS') {
        return;
      }

      const email = event.data.email;
      if (!email || typeof email !== 'string') {
        addToast('Invalid authentication response', 'danger');
        return;
      }

      const res = db.signInWithGoogle(email);
      if (res.success) {
        setUser(res.user);
        addToast(`Welcome, ${res.user.name}!`, 'success');
        setMenuOpen(false);
      } else {
        addToast(res.message, 'danger');
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, [addToast]);

  const getPageTitle = useCallback(() => {
    const item = [...MENU_ITEMS, ...COMMUNITY_ITEMS].find(i => i.path === location.pathname);
    return item ? item.label : 'StudentOS';
  }, [location.pathname]);

  const handleSignIn = useCallback(() => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/google-login.html',
      'Sign In',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
  }, []);

  const handleLogout = useCallback(() => {
    db.signOut();
    setUser(null);
    addToast('Signed out successfully', 'info');
  }, [addToast]);

  return (
    <header className="mobile-header">
      <div className="mobile-header-top">
        <h1 className="mobile-title">{getPageTitle()}</h1>
        <button
          className="btn-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu" role="complementary">
          <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
          <UserProfile 
            user={user} 
            onSignIn={handleSignIn}
            onLogout={handleLogout}
          />
        </div>
      )}
    </header>
  );
}
