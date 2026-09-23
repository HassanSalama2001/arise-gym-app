import { motion } from 'framer-motion';
import './SplashScreen.css';

export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <motion.div
        className="splash-content"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.h1
          className="splash-logo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          ARISE
        </motion.h1>
        <motion.div
          className="splash-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ delay: 0.4, duration: 1.2 }}
        />
      </motion.div>
      <motion.p
        className="splash-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        LEVEL UP YOUR TRAINING
      </motion.p>
    </div>
  );
}
