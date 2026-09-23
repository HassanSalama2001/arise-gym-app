import { useState, useEffect, useEffectEvent } from 'react';
import { getExerciseVisuals } from '../utils/exerciseImages';

/**
 * Loads an exercise's GIF (from the offline cache or the CDN) as an object URL.
 * Returns { url, loading }; url is null when the exercise has no visual.
 */
export function useExerciseVisual(exercise) {
  const key = exercise ? `${exercise.id}|${exercise.gifUrl ?? ''}` : null;
  const [loaded, setLoaded] = useState({ key: null, url: null });
  const load = useEffectEvent(() => getExerciseVisuals(exercise));

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    let url = null;
    load()
      .then(result => {
        if (cancelled) return;
        url = result?.type === 'gif' ? URL.createObjectURL(result.blob) : null;
        setLoaded({ key, url });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key, url: null });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key]);

  // Ignore a result that belongs to a previous exercise.
  const current = loaded.key === key;
  return { url: current ? loaded.url : null, loading: !!key && !current };
}
