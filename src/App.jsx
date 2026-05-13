import React, { useEffect, useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { seedDatabase } from './db/seed';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import AchievementPopup from './components/AchievementPopup';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const WorkoutsScreen = lazy(() => import('./screens/WorkoutsScreen'));
const ExerciseDetailScreen = lazy(() => import('./screens/ExerciseDetailScreen'));
const LogWorkoutScreen = lazy(() => import('./screens/LogWorkoutScreen'));
const MissionCompleteScreen = lazy(() => import('./screens/MissionCompleteScreen'));
const ProgressScreen = lazy(() => import('./screens/ProgressScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));

import { supabase } from './db/supabaseClient';
import db from './db/db';
import { backupToCloud, restoreFromCloud } from './db/sync';

// Page transition wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="screen"><div className="screen-content loading-screen">Loading...</div></div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomeScreen /></PageWrapper>} />
          <Route path="/workouts" element={<PageWrapper><WorkoutsScreen /></PageWrapper>} />
          <Route path="/exercise/:id" element={<PageWrapper><ExerciseDetailScreen /></PageWrapper>} />
          <Route path="/log" element={<PageWrapper><LogWorkoutScreen /></PageWrapper>} />
          <Route path="/mission-complete" element={<PageWrapper><MissionCompleteScreen /></PageWrapper>} />
          <Route path="/progress" element={<PageWrapper><ProgressScreen /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfileScreen /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginScreen onGuest={() => {}} onLogin={() => {}} /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'guest' | 'unauthenticated'

  useEffect(() => {
    async function init() {
      await seedDatabase();
      
      // Check auth state
      const { data: { session } } = await supabase.auth.getSession();
      const profile = await db.playerProfile.get('profile');

      if (session) {
        setAuthState('authenticated');
      } else {
        // Default to guest if no session. 
        // If profile doesn't exist, seedDatabase already created it.
        setAuthState('guest');
      }

      setReady(true);
      setTimeout(() => setShowSplash(false), 1000);

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setAuthState('authenticated');
        } else {
          // If logged out, stay as guest (local data remains until wiped)
          setAuthState('guest');
        }
      });
      
      // Auto-sync when coming online
      window.addEventListener('online', () => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) backupToCloud();
        });
      });
      
      // Auto-sync when app goes to background
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) backupToCloud();
          });
        }
      });
    }
    init();
  }, []);

  if (showSplash || !ready || authState === 'loading') {
    return <SplashScreen />;
  }

  // Login screen is now handled as an overlay or separate route if needed,
  // but for now we just show the main app.

  return (
    <HashRouter>
      <AnimatedRoutes />
      <BottomNav />
      <AchievementPopup />
    </HashRouter>
  );
}
