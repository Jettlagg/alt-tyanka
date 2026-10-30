import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

export function useReveal(key?: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-reveal]', { opacity: 0, y: reducedMotion() ? 0 : 15 }, { opacity: 1, y: 0, duration: reducedMotion() ? 0 : .65, stagger: .07, ease: 'power2.out' });
    }, ref);
    return () => ctx.revert();
  }, [key]);
  return ref;
}

export function useTypedLines(lines: readonly string[], enabled = true) {
  const [visible, setVisible] = useState<string[]>(() => reducedMotion() ? [...lines] : []);
  const [done, setDone] = useState(reducedMotion);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (reducedMotion()) { setVisible([...lines]); setDone(true); return; }
    setVisible([]); setDone(false);
    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    timeline.current = tl;
    lines.forEach((line, i) => {
      const cursor = { value: 0 };
      tl.to(cursor, { value: line.length, duration: Math.min(.48, line.length * .009), ease: 'none', onUpdate: () => {
        setVisible([...lines.slice(0, i), line.slice(0, Math.round(cursor.value))]);
      } }, '+=.08');
    });
    return () => { tl.kill(); timeline.current = null; };
  }, [lines, enabled]);
  const skip = () => { timeline.current?.kill(); setVisible([...lines]); setDone(true); };
  return { visible, done, skip };
}
