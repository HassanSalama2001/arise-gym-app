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
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence>
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
      // 1. Local-First: Initialize database from local files/defaults
      await seedDatabase();
      
      // 2. Check if we have existing local user data (beyond the default profile)
      const sessionCount = await db.sessions.count();
      const isNewUser = sessionCount === 0;

      // 3. Conditional Cloud Sync: Only check network/auth if local data is empty or if we specifically need to
      if (isNewUser && navigator.onLine) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthState('authenticated');
          // No local data, but user is logged in and online -> Try to restore
          const restored = await restoreFromCloud();
          if (restored) console.log('Data restored from cloud');
        } else {
          setAuthState('guest');
        }
      } else {
        // We have local data, or we are offline -> Stick to local Source of Truth
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState(session ? 'authenticated' : 'guest');
      }

      setReady(true);
      setTimeout(() => setShowSplash(false), 1000);

      // 4. Background Sync Guards: Only sync if online and signed in
      const syncIfPossible = async () => {
        if (!navigator.onLine) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          backupToCloud().catch(err => console.error('Auto-backup failed:', err));
        }
      };

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        setAuthState(session ? 'authenticated' : 'guest');
      });
      
      // Auto-sync when coming online
      window.addEventListener('online', syncIfPossible);
      
      // Auto-sync when app goes to background
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          syncIfPossible();
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
