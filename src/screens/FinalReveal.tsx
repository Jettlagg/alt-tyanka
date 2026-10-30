import { useLayoutEffect, useRef, useState } from 'react';
import { Check, Heart, RotateCcw, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { dossier } from '../config/dossierData';
import { reducedMotion } from '../hooks/useMotion';
import { ActionButton, Eyebrow, SkipButton } from '../components/ui/Controls';

export default function FinalReveal({ complete, finish, restart }: { complete: boolean; finish: () => void; restart: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [revealed, setRevealed] = useState(() => complete || reducedMotion());
  const [imageError, setImageError] = useState(false);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (complete) {
        gsap.fromTo('.mission-stamp', { opacity: 0, scale: reducedMotion() ? 1 : 1.3, rotation: -7 }, { opacity: 1, scale: 1, rotation: -7, duration: reducedMotion() ? 0 : .6, ease: 'back.out(1.8)' });
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setRevealed(true) });
      timeline.current = tl;
      const duration = reducedMotion() ? 0 : .7;
      tl.fromTo('.final-heading', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration })
        .fromTo('.portrait-frame', { opacity: 0, scale: reducedMotion() ? 1 : .97 }, { opacity: 1, scale: 1, duration }, reducedMotion() ? 0 : '-=.3')
        .fromTo('.final-finding', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: duration * .7, stagger: reducedMotion() ? 0 : .2 })
        .fromTo('.sincere-message', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration }, reducedMotion() ? '+=0' : '+=.3');
    }, root);
    return () => { ctx.revert(); timeline.current = null; };
  }, [complete]);
  const skip = () => { timeline.current?.progress(1); setRevealed(true); };
  return <div ref={root} className={`narrow-screen final-screen ${complete ? 'is-complete' : ''}`}>
    {complete ? <div className="mission-complete"><div className="mission-emblem"><ShieldCheck size={42} strokeWidth={1} /></div><Eyebrow>ОПЕРАЦИЯ: ХОРОШЕЕ НАСТРОЕНИЕ</Eyebrow><div className="mission-stamp">MISSION<br />COMPLETE<Check size={25} /></div><h1>Дело закрыто.<br /><span className="serif-word">Улыбка — нет.</span></h1><p>{dossier.final.complete[0]}</p><div className="mission-budget mono">{dossier.final.complete[1]}</div><ActionButton onClick={restart}><span className="inline-icon"><RotateCcw size={16} />{dossier.ui.replay}</span></ActionButton><div className="end-heart" aria-hidden="true">♡</div></div> : <>
      <div className="reveal-status mono"><span className="status-dot" />РАССЕКРЕЧИВАНИЕ МАТЕРИАЛОВ…</div>
      {!revealed && <SkipButton onClick={skip}>Раскрыть всё сразу</SkipButton>}
      <div className="final-heading"><Eyebrow>{dossier.final.operation}</Eyebrow><h1>{dossier.final.title}</h1><p className="intro-copy">{dossier.final.intro}</p></div>
      <figure className="portrait-frame"><div className="portrait-topline mono"><span>SUBJECT: LAURA</span><span>DECLASSIFIED</span></div>{imageError ? <div className="art-unavailable"><Heart size={40} strokeWidth={1} /><span>LAURA</span><p>Материал пока не загружен</p></div> : <img src={dossier.art} alt="Иллюстрированный портрет Лауры в стиле dark spy" width={1086} height={1448} onError={() => setImageError(true)} /> }<figcaption className="mono"><span>ДЕЛО №001</span><span>УЛИКА, НЕ ТРЕБУЮЩАЯ ДОКАЗАТЕЛЬСТВ</span></figcaption></figure>
      <div className="final-findings">{dossier.final.findings.map((line, i) => <div key={line} className="final-finding"><span className="finding-check"><Check size={13} /></span><p>{line}</p><span className="mono muted">0{i + 1}</span></div>)}</div>
      <div className="sincere-message"><Heart size={21} strokeWidth={1} aria-hidden="true" /><div className="mono sincere-label">{dossier.final.sincere}</div><h2>{dossier.final.message[0]}</h2><p>{dossier.final.message[1]}</p><p className="warm-wish">{dossier.final.message[2]}</p><span className="floating-heart heart-one" aria-hidden="true">♡</span><span className="floating-heart heart-two" aria-hidden="true">♡</span></div>
      <ActionButton onClick={() => { skip(); finish(); }} disabled={!revealed}>{dossier.ui.final}</ActionButton>
    </>}
  </div>;
}
