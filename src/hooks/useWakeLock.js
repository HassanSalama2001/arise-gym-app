import { useEffect } from 'react';

/**
 * Keeps the screen on while `enabled` is true (Screen Wake Lock API).
 * The browser drops the lock whenever the page is hidden, so it is re-acquired on return.
 * Does nothing where the API is unavailable (e.g. iOS below 16.4).
 */
export function useWakeLock(enabled) {
  useEffect(() => {
    if (!enabled || !navigator.wakeLock) return;

    let sentinel = null;
    let released = false;

    const acquire = async () => {
      if (released || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        // Denied (low battery, no permission): the workout carries on regardless.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      sentinel?.release?.().catch(() => {});
    };
  }, [enabled]);
}
