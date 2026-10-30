import { useEffect, useRef, useState } from 'react';
import { Fingerprint, ShieldCheck, Crosshair } from 'lucide-react';
import gsap from 'gsap';
import { dossier } from '../config/dossierData';
import { reducedMotion, useReveal } from '../hooks/useMotion';
import { ActionButton, Eyebrow, SkipButton } from '../components/ui/Controls';

export default function IdentityScan({ next }: { next: () => void }) {
  const root = useReveal();
  const [progress, setProgress] = useState(() => reducedMotion() ? 100 : 0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    const counter = { value: 0 };
    const tl = gsap.timeline();
    tl.to(counter, { value: 100, duration: reducedMotion() ? 0 : 3.4, ease: 'power1.inOut', onUpdate: () => setProgress(Math.round(counter.value)) });
    timeline.current = tl;
    return () => { tl.kill(); };
  }, []);
  const done = progress === 100;
  const skip = () => { timeline.current?.kill(); setProgress(100); };
  return <div ref={root} className="narrow-screen">
    <div data-reveal><Eyebrow>ПРОТОКОЛ 02 / ИДЕНТИФИКАЦИЯ</Eyebrow><h1>{dossier.scan.title}</h1><p className="intro-copy scan-intro">{dossier.scan.intro}</p></div>
    <div className={`scanner ${done ? 'scan-complete' : ''}`} data-reveal>
      <span className="scanner-coordinate mono">LRA / 001</span><Crosshair className="scanner-crosshair" size={16} aria-hidden="true" />
      <div className="scanner-ring"><svg viewBox="0 0 200 200" className="progress-circle" aria-hidden="true"><circle cx="100" cy="100" r="92" /><circle cx="100" cy="100" r="92" style={{ strokeDashoffset: 578 - 578 * progress / 100 }} /></svg><div className="hud-ring" /><Fingerprint className="scan-fingerprint" strokeWidth={.7} aria-hidden="true" /><span className="scan-beam" /></div>
      <div className="scan-progress mono" role="progressbar" aria-label="Сканирование" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>{progress}<span>%</span></div>
      <span className="scan-caption mono">{done ? 'СОВПАДЕНИЕ НАЙДЕНО' : 'АНАЛИЗ ПАТТЕРНА…'}</span>
    </div>
    <div className="metrics" aria-live="polite">{dossier.scan.metrics.map((metric, i) => <div key={metric.label} className={`metric ${progress >= (i + 1) * 24 ? 'metric-visible' : ''}`}><span>{metric.label}</span><strong className="mono">{progress >= (i + 1) * 24 ? metric.value : '···'}</strong></div>)}</div>
    {!done && <SkipButton onClick={skip}>Завершить сканирование</SkipButton>}
    {done && <div className="scan-result" role="status"><ShieldCheck size={19} /><div><strong className="mono">{dossier.scan.confirmed}</strong><p>{dossier.scan.warning}</p></div></div>}
    <ActionButton onClick={next} disabled={!done}>{dossier.ui.scan}</ActionButton>
    <p className="small-note">Игровое сканирование. Камера и биометрия не используются.</p>
  </div>;
}
