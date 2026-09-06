// Screenshot capture — from a chosen file, or a live screen/window snapshot
// via getDisplayMedia. Pure browser-API wrappers, no React.

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

// A full native-resolution desktop capture (often 2560x1440+) exported as
// lossless PNG easily runs several MB as a data URL — slow to upload, and
// GPT-4o's own image processing latency scales with resolution, so it made
// "solve this screenshot" noticeably slower than a plain text question, in
// the worst case pushing close to the backend's 4MB JSON body limit. Nothing
// on screen worth reading (interview questions, code) needs more than this
// to stay legible, and JPEG compresses far better than PNG for a screen
// capture like this.
const MAX_SCREENSHOT_DIMENSION = 1280;
const SCREENSHOT_JPEG_QUALITY = 0.85;

/**
 * Applies the same size cap to a pasted (Ctrl+V) or manually uploaded image
 * as captureScreenSnapshot already applies to its own captures — a Windows
 * Snipping Tool grab is just as often full native resolution, so without
 * this the "solve it fast" fix only covered one of the three ways to attach
 * a screenshot. Already-small images (a cropped snip, a small upload) pass
 * through unchanged since scale is capped at 1.
 */
export function downscaleDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SCREENSHOT_DIMENSION / Math.max(img.width, img.height));
      if (scale === 1) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', SCREENSHOT_JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error('Could not read image.'));
    img.src = dataUrl;
  });
}

/**
 * Grabs a single still frame of whatever the user picks in the browser's
 * share picker (screen / window / tab) and returns it as a JPEG data URL,
 * downscaled to a size that stays fast to send without losing legibility.
 * Throws NOT_SUPPORTED if the platform has no getDisplayMedia at all, so the
 * caller can fall back to the file picker instead of showing a dead end.
 */
export async function captureScreenSnapshot() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    const err = new Error('Screen capture not supported in this browser.');
    err.code = 'NOT_SUPPORTED';
    throw err;
  }

  const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const videoTrack = displayStream.getVideoTracks()[0];
  const video = document.createElement('video');
  video.srcObject = displayStream;
  await video.play();

  const nativeWidth = video.videoWidth || 1920;
  const nativeHeight = video.videoHeight || 1080;
  const scale = Math.min(1, MAX_SCREENSHOT_DIMENSION / Math.max(nativeWidth, nativeHeight));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(nativeWidth * scale);
  canvas.height = Math.round(nativeHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', SCREENSHOT_JPEG_QUALITY);
  videoTrack.stop();
  video.pause();

  return dataUrl;
}
