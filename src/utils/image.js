/**
 * Downscales an image file and re-encodes it as JPEG, returning a data URL.
 * Phone photos are several MB; stored raw they bloat IndexedDB and every cloud backup.
 */
export async function compressImageToDataUrl(file, { maxDimension = 1600, quality = 0.8 } = {}) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close();
  }
}
