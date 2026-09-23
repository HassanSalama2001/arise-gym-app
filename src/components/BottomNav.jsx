import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playClickSound } from '../utils/audio';
import { hapticClick } from '../utils/haptics';
import './BottomNav.css';

const tabs = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/workouts', label: 'Workouts', icon: 'dumbbell' },
  { path: '/log', label: 'Log', icon: 'lightning', center: true },
  { path: '/progress', label: 'Progress', icon: 'chart' },
  { path: '/profile', label: 'Profile', icon: 'person' },
];

const icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  dumbbell: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6.5 6.5h11M6.5 17.5h11"/>
      <rect x="2" y="5" width="4" height="14" rx="1"/>
      <rect x="18" y="5" width="4" height="14" rx="1"/>
      <rect x="5" y="8" width="2" height="8" rx="0.5"/>
      <rect x="17" y="8" width="2" height="8" rx="0.5"/>
    </svg>
  ),
  lightning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="12" width="4" height="9" rx="1"/>
      <rect x="10" y="7" width="4" height="14" rx="1"/>
      <rect x="17" y="3" width="4" height="18" rx="1"/>
    </svg>
  ),
  person: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Hide nav during active workout logging, mission complete, or plan detail
  if (currentPath.startsWith('/log/active') || currentPath.startsWith('/mission-complete') || currentPath.startsWith('/plan/')) {
    return null;
  }

  return (
    <nav className="bottom-nav" id="bottom-nav" aria-label="Main navigation">
      {tabs.map(tab => {
        const isActive = tab.path === '/' 
          ? currentPath === '/' 
          : currentPath.startsWith(tab.path);

        if (tab.center) {
          return (
            <button
              key={tab.path}
              className="bottom-nav-center"
              onClick={() => { playClickSound(); hapticClick(); navigate(tab.path); }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              id="nav-log"
            >
              <motion.div
                className="bottom-nav-center-circle"
                whileTap={{ scale: 0.9 }}
                animate={{ boxShadow: isActive ? '0 0 20px rgba(79,195,247,0.5)' : '0 0 8px rgba(79,195,247,0.3)' }}
                transition={{ duration: 0.3 }}
              >
                {icons[tab.icon]}
              </motion.div>
            </button>
          );
        }

        return (
          <button
            key={tab.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => { playClickSound(); hapticClick(); navigate(tab.path); }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            id={`nav-${tab.icon}`}
          >
            <motion.div
              className="bottom-nav-icon"
              animate={isActive ? { y: -3 } : { y: 0 }}

              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {icons[tab.icon]}
            </motion.div>
            <span className="bottom-nav-label">{tab.label}</span>
            {isActive && <div className="bottom-nav-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
