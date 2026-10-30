import { useEffect, useRef } from 'react';
import { TriangleAlert, X } from 'lucide-react';
import gsap from 'gsap';
import { reducedMotion } from '../../hooks/useMotion';
export interface Notice { id: number; lines: readonly string[] }
export function Notification({ notice, close }: { notice: Notice | null; close: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!notice) return;
    const ctx = gsap.context(() => { gsap.fromTo(ref.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: reducedMotion() ? 0 : .3 }); });
    const timer = window.setTimeout(close, 5500);
    return () => { window.clearTimeout(timer); ctx.revert(); };
  }, [notice, close]);
  return <div className="notification-slot" aria-live="polite" aria-atomic="true">{notice && <div ref={ref} className="notification"><TriangleAlert size={15} aria-hidden="true" /><div>{notice.lines.map((line, i) => <p key={i}>{line}</p>)}</div><button aria-label="Закрыть уведомление" onClick={close}><X size={15} /></button></div>}</div>;
}
