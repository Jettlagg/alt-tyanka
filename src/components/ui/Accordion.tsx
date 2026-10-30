import { useLayoutEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { reducedMotion } from '../../hooks/useMotion';

export function Accordion({ title, number, children, initialOpen = false }: { title: string; number: string; children: ReactNode; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const tween = gsap.to(panel.current, { height: open ? 'auto' : 0, opacity: open ? 1 : 0, duration: reducedMotion() ? 0 : .3, ease: 'power2.inOut' });
    return () => { tween.kill(); };
  }, [open]);
  const id = `section-${number}`;
  return <section className={`accordion ${open ? 'is-open' : ''}`}>
    <h3><button onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls={id}><span className="mono accent">{number}</span><span>{title}</span>{open ? <Minus size={16} /> : <Plus size={16} />}</button></h3>
    <div ref={panel} id={id} className="accordion-panel" inert={!open}><div className="accordion-content">{children}</div></div>
  </section>;
}
