import { useEffect, useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { seedDatabase } from './db/seed';
import { syncMealSuggestions } from './utils/nutritionApi';
import { startNotificationScheduler, stopNotificationScheduler } from './utils/notifications';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import AchievementPopup from './components/AchievementPopup';
import { AlertProvider } from './context/AlertContext';
import { WorkoutProvider } from './context/WorkoutContext';
import ActiveWorkoutFAB from './components/ActiveWorkoutFAB';


const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const WorkoutsScreen = lazy(() => import('./screens/WorkoutsScreen'));
const ExerciseDetailScreen = lazy(() => import('./screens/ExerciseDetailScreen'));
const LogWorkoutScreen = lazy(() => import('./screens/LogWorkoutScreen'));
const MissionCompleteScreen = lazy(() => import('./screens/MissionCompleteScreen'));
const ProgressScreen = lazy(() => import('./screens/ProgressScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const PlanDetailScreen = lazy(() => import('./screens/PlanDetailScreen'));
const MealTrackerScreen = lazy(() => import('./screens/MealTrackerScreen'));

import { supabase } from './db/supabaseClient';
import { syncWithCloud } from './db/cloudSync';

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
  const navigate = useNavigate();
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
          <Route path="/plan/:planId" element={<PageWrapper><PlanDetailScreen /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfileScreen /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><SettingsScreen /></PageWrapper>} />
          <Route path="/meals" element={<PageWrapper><MealTrackerScreen /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginScreen onGuest={() => navigate('/profile')} onLogin={() => navigate('/profile')} /></PageWrapper>} />
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
    let authSubscription = null;
    let splashTimeout = null;

    const syncIfPossible = async () => {
      if (!navigator.onLine) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Per-record sync: sends local changes and applies any made elsewhere.
          syncWithCloud().catch(err => console.error('Auto-sync failed:', err));
        }
      } catch (err) {
        console.error('Session check failed during sync:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncIfPossible();
      }
    };

    async function init() {
      // 1. Local-First: Initialize database from local files/defaults
      try {
        await seedDatabase();
        await syncMealSuggestions();
      } catch (err) {
        console.error('Database seeding failed:', err);
      }
      
      try {
        // 2. Sync merges per record, so it is safe to run whenever we are signed in and online
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState(session ? 'authenticated' : 'guest');
        if (session && navigator.onLine) {
          const result = await syncWithCloud();
          if (!result.success) console.error('Startup sync failed:', result.error);
        }
      } catch (err) {
        console.error('Init auth check failed:', err);
        setAuthState('guest'); // Fallback to guest mode
      }

      setReady(true);
      splashTimeout = setTimeout(() => setShowSplash(false), 1000);

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthState(session ? 'authenticated' : 'guest');
      });
      authSubscription = data.subscription;
      
      // Auto-sync when coming online
      window.addEventListener('online', syncIfPossible);
      
      // Auto-sync when app goes to background
      document.addEventListener('visibilitychange', handleVisibilityChange);
      // Start the notification scheduler for water and meals
      startNotificationScheduler();
    }
    
    init();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
      if (splashTimeout) clearTimeout(splashTimeout);
      stopNotificationScheduler();
      window.removeEventListener('online', syncIfPossible);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (showSplash || !ready || authState === 'loading') {
    return <SplashScreen />;
  }

  // Login screen is now handled as an overlay or separate route if needed,
  // but for now we just show the main app.

  return (
    <AlertProvider>
      <WorkoutProvider>
        <HashRouter>
          <AnimatedRoutes />
          <ActiveWorkoutFAB />
          <BottomNav />
          <AchievementPopup />
        </HashRouter>
      </WorkoutProvider>
    </AlertProvider>
  );
}
