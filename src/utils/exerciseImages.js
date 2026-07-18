import db from '../db/db';

// Using jsDelivr to serve github content directly.
const YUHONAS_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';
const HASAN_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/exercises';

function formatYuhonasName(name) {
  if (!name) return '';
  let formatted = name.replace(/\//g, '_');
  formatted = formatted.split(/([\s-]+)/).map(word => {
    if (word.match(/^[\s-]+$/)) return word; 
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
  return formatted.replace(/ /g, '_');
}

/**
 * Attempts to fetch a visual (image or gif) for the exercise.
 * Falls back to images if the GIF mode fails.
 */
async function fetchVisual(exercise, mode) {
  console.log('[fetchVisual] START - exercise:', exercise.name, 'mode:', mode);
  console.log('[fetchVisual] URLs from DB -> gifUrl:', exercise.gifUrl, 'imageUrls:', exercise.imageUrls);
  let gifUrl = exercise.gifUrl;
  let imageUrls = exercise.imageUrls;

  // Fallbacks for older DB items that might not have migrated yet
  if (!gifUrl && exercise.videoUri) {
    gifUrl = exercise.videoUri;
    if (gifUrl.includes('hasaneyldrm/exercises-dataset/main/data/videos/')) {
      const filename = gifUrl.split('/').pop();
      gifUrl = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/${filename}`;
    }
  }

  if (!imageUrls && !gifUrl) {
    const normName = formatYuhonasName(exercise.name);
    imageUrls = [
      `${YUHONAS_BASE}/${normName}/0.jpg`,
      `${YUHONAS_BASE}/${normName}/1.jpg`
    ];
  }

  if (mode === 'gifs' && gifUrl) {
    try {
      const res = await fetch(gifUrl);
      if (res.ok) {
        console.log('[fetchVisual] GIF fetched successfully!');
        const blob = await res.blob();
        return { blob, type: 'gif' };
      } else {
        console.log('[fetchVisual] GIF fetch failed with status:', res.status);
      }
    } catch (e) {
      console.warn('Failed to fetch GIF, falling back to images...', e);
    }
  }

  // Try to fetch static images
  if (imageUrls && imageUrls.length === 2) {
    try {
      const [res0, res1] = await Promise.all([
        fetch(imageUrls[0]).catch(() => null),
        fetch(imageUrls[1]).catch(() => null)
      ]);

      if (res0 && res0.ok && res1 && res1.ok) {
        console.log('[fetchVisual] Images fetched successfully!');
        const blob0 = await res0.blob();
        const blob1 = await res1.blob();
        return { blob0, blob1, type: 'images' };
      } else {
        console.log('[fetchVisual] Images fetch failed - res0.ok:', res0?.ok, 'res1.ok:', res1?.ok);
      }
    } catch (e) {
      console.warn('Failed to fetch images', e);
    }
  }

  // Ultimate fallback: if mode was 'images' but Yuhonas failed, try the GIF instead of returning nothing.
  if (mode === 'images' && gifUrl) {
    console.log('[fetchVisual] Trying ultimate fallback to GIF...');
    try {
      const res = await fetch(gifUrl);
      if (res.ok) {
        console.log('[fetchVisual] Ultimate fallback GIF fetched successfully!');
        const blob = await res.blob();
        return { blob, type: 'gif' };
      } else {
        console.log('[fetchVisual] Ultimate fallback GIF failed with status:', res.status);
      }
    } catch(e) {
      console.error('[fetchVisual] Ultimate fallback GIF error:', e);
    }
  }

  console.log('[fetchVisual] END - Returning null. All attempts failed.');
  return null;
}

/**
 * Get exercise visuals. 
 * Checks local Dexie cache first. If not found, fetches from CDN, caches, and returns.
 */
export async function getExerciseVisuals(exercise, visualsMode = 'images') {
  console.log('[getExerciseVisuals] Called for:', exercise.name, 'mode:', visualsMode);
  // Check cache
  const cached = await db.exerciseImageCache.get(exercise.id);
  if (cached && cached.mode === visualsMode && (cached.blob || (cached.blob0 && cached.blob1))) {
    console.log('[getExerciseVisuals] Returning from cache');
    return cached;
  }

  console.log('[getExerciseVisuals] Cache miss, calling fetchVisual...');
  const result = await fetchVisual(exercise, visualsMode);
  
  if (result) {
    console.log('[getExerciseVisuals] Saving result to cache');
    // Save to cache
    await db.exerciseImageCache.put({
      exerciseId: exercise.id,
      mode: visualsMode,
      ...result
    });
    return result;
  }

  return null;
}
