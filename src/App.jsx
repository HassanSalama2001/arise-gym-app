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

/* Placeholder screens — will be built one by one */
function PlaceholderScreen({ title }) {
  return (
    <div className="screen">
      <div className="screen-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-blue)', fontSize: '24px', marginBottom: '8px' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Coming soon...</p>
        </div>
      </div>
    </div>
  );
}

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
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    seedDatabase().then(() => {
      setReady(true);
      setTimeout(() => setShowSplash(false), 1500);
    });
  }, []);

  if (showSplash || !ready) {
    return <SplashScreen />;
  }

  return (
    <HashRouter>
      <AnimatedRoutes />
      <BottomNav />
      <AchievementPopup />
    </HashRouter>
  );
}
