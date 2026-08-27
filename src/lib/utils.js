export function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d)
    ? ''
    : d.toLocaleDateString([], {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function formatTimeSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
