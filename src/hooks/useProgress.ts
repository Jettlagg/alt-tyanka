import { useEffect, useState } from 'react';
export interface Progress { stage: number; answers: number[]; complete: boolean }
const fresh = (): Progress => ({ stage: 0, answers: [], complete: false });
const key = 'classified-laura-progress-v1';
function restore(): Progress {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (data && Number.isInteger(data.stage) && data.stage >= 0 && data.stage <= 4 && Array.isArray(data.answers) && data.answers.length <= 3 && data.answers.every((v: unknown) => Number.isInteger(v) && Number(v) >= 0 && Number(v) < 3) && typeof data.complete === 'boolean' && (data.stage < 4 || data.answers.length === 3)) return data;
  } catch { /* Storage may be unavailable in private in-app browsers. */ }
  return fresh();
}
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(restore);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* The story also works in memory. */ } }, [progress]);
  return { progress, setProgress, reset: () => setProgress(fresh()) };
}
