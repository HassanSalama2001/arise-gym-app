import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../db/supabaseClient';
import db from '../db/db';
import { restoreFromCloud } from '../db/sync';
import { useAlert } from '../context/AlertContext';

export default function LoginScreen({ onGuest, onLogin }) {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await showAlert('Check your email for the confirmation link!', 'Check Email');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          await db.playerProfile.update('profile', { guestMode: false });
          await restoreFromCloud();
          onLogin(data.session);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    await db.playerProfile.update('profile', { guestMode: true });
    onGuest();
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 className="arise-wordmark" style={{ fontSize: 48, marginBottom: 8 }}>ARISE</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Level up your fitness.</p>
      </motion.div>

      <form className="card" onSubmit={handleAuth} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, textAlign: 'center' }}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        
        {error && <div style={{ color: 'var(--accent-red)', fontSize: 13, textAlign: 'center' }}>{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-void)', color: 'var(--text-primary)' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-void)', color: 'var(--text-primary)' }}
        />
        
        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Processing...' : (mode === 'signin' ? 'SIGN IN' : 'SIGN UP')}
        </button>

        <button 
          type="button" 
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: 13, marginTop: 8 }}
        >
          {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </form>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>OR</span>
        <button className="btn-ghost" onClick={handleGuest}>
          CONTINUE AS GUEST
        </button>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center', maxWidth: 300 }}>
          Guest data is saved locally on this device. You can sign in later to sync your progress to the cloud.
        </p>
      </div>
    </div>
  );
}
