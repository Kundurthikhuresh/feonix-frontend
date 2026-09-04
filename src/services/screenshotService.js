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

/**
 * Grabs a single still frame of whatever the user picks in the browser's
 * share picker (screen / window / tab) and returns it as a PNG data URL.
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

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1920;
  canvas.height = video.videoHeight || 1080;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/png');
  videoTrack.stop();
  video.pause();

  return dataUrl;
}
