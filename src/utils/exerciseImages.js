import db from '../db/db';

/**
 * Attempts to fetch a visual (gif) for the exercise.
 */
async function fetchVisual(exercise) {
  let gifUrl = exercise.gifUrl;

  if (!gifUrl) {
    return null;
  }

  try {
    const res = await fetch(gifUrl);
    if (res.ok) {
      const blob = await res.blob();
      return { blob, type: 'gif' };
    }
  } catch (e) {
    console.warn('Failed to fetch GIF', e);
  }

  return null;
}

/**
 * Get exercise visuals. 
 * Checks local Dexie cache first. If not found, fetches from CDN, caches, and returns.
 */
export async function getExerciseVisuals(exercise) {
  // Check cache
  const cached = await db.exerciseImageCache.get(exercise.id);
  if (cached && cached.blob) {
    return cached;
  }

  const result = await fetchVisual(exercise);
  
  if (result) {
    // Save to cache
    await db.exerciseImageCache.put({
      exerciseId: exercise.id,
      ...result
    });
    return result;
  }

  return null;
}
