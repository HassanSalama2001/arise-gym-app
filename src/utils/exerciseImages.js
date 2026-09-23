import db from '../db/db';

// Measured across the dataset: GIFs average ~90 KB.
export const AVERAGE_VISUAL_BYTES = 92 * 1024;

/**
 * Attempts to fetch a visual (gif) for the exercise.
 */
async function fetchVisual(exercise, signal) {
  const gifUrl = exercise.gifUrl;

  if (!gifUrl) {
    return null;
  }

  try {
    const res = await fetch(gifUrl, { signal });
    if (res.ok) {
      const blob = await res.blob();
      return { blob, type: 'gif' };
    }
  } catch (e) {
    if (e.name === 'AbortError') throw e;
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

/** IDs of exercises whose visual is already stored on this device. */
export async function cachedVisualIds() {
  return new Set(await db.exerciseImageCache.toCollection().primaryKeys());
}

/** Exercises used by the user's saved plans (what most people want offline). */
export async function exercisesInPlans() {
  const planExercises = await db.planExercises.toArray();
  const ids = [...new Set(planExercises.map(pe => pe.exerciseId))];
  return (await db.exercises.bulkGet(ids)).filter(Boolean);
}

/**
 * Downloads and stores the visuals for `exercises` that aren't cached yet.
 * onProgress({ done, total, failed }) is called as it goes; pass an AbortSignal to stop early.
 */
export async function downloadVisuals(exercises, { onProgress, signal, concurrency = 4 } = {}) {
  const cached = await cachedVisualIds();
  const pending = exercises.filter(ex => ex.gifUrl && !cached.has(ex.id));
  const total = pending.length;
  let done = 0;
  let failed = 0;

  async function worker() {
    while (pending.length) {
      if (signal?.aborted) return;
      const exercise = pending.pop();
      try {
        const result = await fetchVisual(exercise, signal);
        if (result) {
          await db.exerciseImageCache.put({ exerciseId: exercise.id, ...result });
        } else {
          failed++;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        failed++;
      }
      done++;
      onProgress?.({ done, total, failed });
    }
  }

  onProgress?.({ done: 0, total, failed: 0 });
  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker));
  return { done, total, failed, cancelled: !!signal?.aborted };
}

export async function clearVisualCache() {
  await db.exerciseImageCache.clear();
}

/** Bytes used and available, when the browser reports them. */
export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null;
  try {
    return await navigator.storage.estimate();
  } catch {
    return null;
  }
}

/** Asks the browser not to evict our data when space runs low. */
export async function requestPersistentStorage() {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
