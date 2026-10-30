import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, AudioLines, Check, ChevronRight, Fingerprint, LockKeyhole, RotateCcw, Shield, Volume2, VolumeX, X } from 'lucide-react';
import gsap from 'gsap';
import { dossier } from './config/dossierData';
import { useProgress } from './hooks/useProgress';
import { reducedMotion } from './hooks/useMotion';
import { Notification } from './components/effects/Notification';
import type { Notice } from './components/effects/Notification';
import AccessTerminal from './screens/AccessTerminal';
import IdentityScan from './screens/IdentityScan';
import SubjectDossier from './screens/SubjectDossier';
import PensionQuiz from './screens/PensionQuiz';
import FinalReveal from './screens/FinalReveal';

export default function App() {
  const { progress, setProgress, reset } = useProgress();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [sound, setSound] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const transition = useRef<gsap.core.Tween | null>(null);
  const locked = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const notified = useRef(new Set<number>());
  const closeNotice = useCallback(() => setNotice(null), []);
  const notify = useCallback((lines: readonly string[]) => setNotice({ id: Date.now(), lines }), []);
  const beep = useCallback(() => {
    if (!sound || !audio.current) return;
    const ctx = audio.current;
    void ctx.resume().catch(() => undefined);
    const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(650, ctx.currentTime);
    gain.gain.setValueAtTime(.025, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .07);
    oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + .08);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }, [sound]);
  const toggleSound = () => {
    if (!sound) {
      try {
        const Audio = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Audio) { notify(['Звук недоступен в этом браузере. История продолжается.']); return; }
        audio.current ??= new Audio(); void audio.current.resume().catch(() => undefined);
      } catch { notify(['Звук недоступен в этом браузере. История продолжается.']); return; }
    }
    setSound(v => !v);
  };
  const move = (stage: number) => {
    if (locked.current || stage < 0 || stage > 4) return;
    locked.current = true; setBusy(true); closeNotice();
    transition.current?.kill();
    transition.current = gsap.to(content.current, { opacity: 0, y: reducedMotion() ? 0 : -9, duration: reducedMotion() ? 0 : .18, onComplete: () => {
      setProgress(p => ({ ...p, stage }));
      window.scrollTo({ top: 0, behavior: 'instant' });
    } });
  };
  useLayoutEffect(() => {
    transition.current?.kill();
    transition.current = gsap.fromTo(content.current, { opacity: 0, y: reducedMotion() ? 0 : 10 }, { opacity: 1, y: 0, duration: reducedMotion() ? 0 : .35, onComplete: () => {
      locked.current = false; setBusy(false);
      if (progress.stage > 0) content.current?.querySelector('h1, h2')?.setAttribute('tabindex', '-1');
      if (progress.stage > 0) (content.current?.querySelector('h1, h2') as HTMLElement | null)?.focus({ preventScroll: true });
    } });
    return () => { transition.current?.kill(); };
  }, [progress.stage]);
  useEffect(() => {
    const stage = progress.stage;
    if (![1, 2, 3].includes(stage) || notified.current.has(stage)) return;
    const timer = window.setTimeout(() => { notified.current.add(stage); const pool = stage === 1 ? [1, 4] : stage === 2 ? [3] : [0, 2]; notify([dossier.notifications[pool[Math.floor(Math.random() * pool.length)]]]); }, 3900);
    return () => window.clearTimeout(timer);
  }, [progress.stage, notify]);
  useEffect(() => () => { void audio.current?.close().catch(() => undefined); }, []);
  useEffect(() => {
    if (resetDialog && !modal.current?.open) modal.current?.showModal();
    if (!resetDialog && modal.current?.open) modal.current.close();
  }, [resetDialog]);
  const restart = () => { setResetDialog(false); closeNotice(); notified.current.clear(); locked.current = false; setBusy(false); reset(); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const answer = (index: number, value: number) => setProgress(p => ({ ...p, answers: [...p.answers.slice(0, index), value] }));
  return <div className={`app ${progress.stage === 4 ? 'warm-theme' : ''}`} onClick={beep}>
    <a className="skip-to-main" href="#main">Перейти к содержимому</a>
    <div className="ambient-light" aria-hidden="true" /><div className="noise-overlay" aria-hidden="true" />
    <header className="site-header"><div className="brand"><span className="brand-icon"><Shield size={22} strokeWidth={1.4} /><Fingerprint size={12} strokeWidth={1.3} /></span><div><strong>CLASSIFIED<span className="accent">.</span></strong><span className="mono">INDEPENDENT INTELLIGENCE BUREAU</span></div></div><div className="header-controls"><span className="header-live mono"><span className="status-dot" />СИСТЕМА ОНЛАЙН</span><button className={`icon-button ${sound ? 'sound-active' : ''}`} aria-label={sound ? 'Выключить звук' : 'Включить звук'} aria-pressed={sound} onClick={toggleSound}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><button className="icon-button" aria-label="Начать сначала" onClick={() => setResetDialog(true)}><RotateCcw size={16} /></button></div></header>
    <div className="mission-bar"><span className="mono"><span className="accent">ДЕЛО №001</span><ChevronRight size={11} />LAURA</span><span className="mission-bar-right mono"><LockKeyhole size={11} />СОВЕРШЕННО СЕКРЕТНО</span></div>
    <div className="story-layout"><aside className="story-navigation" aria-label="Прогресс операции"><div className="nav-caption mono">OPERATION INDEX</div><ol>{dossier.stages.map((label, i) => <li key={label} className={`${i === progress.stage ? 'current' : ''} ${i < progress.stage ? 'passed' : ''}`} aria-current={i === progress.stage ? 'step' : undefined}><span className="step-marker mono">{i < progress.stage ? <Check size={12} /> : `0${i + 1}`}</span><div><span className="nav-stage-name">{label}</span><span className="nav-stage-label mono">{dossier.stageLabels[i]}</span></div><span className="nav-active-dot" /></li>)}</ol><div className="nav-bottom mono"><AudioLines size={17} /><span>ЗАШИФРОВАННЫЙ КАНАЛ<br /><span className="muted">Никаких случайных совпадений.</span></span></div></aside>
    <main id="main" className="main-content"><div className="screen-topbar mono"><button onClick={() => move(progress.stage - 1)} disabled={progress.stage === 0 || busy} className="back-button"><ArrowLeft size={13} />НАЗАД</button><span>0{progress.stage + 1} <span className="muted">/ 05</span><span className="screen-topbar-divider">|</span>{dossier.stageLabels[progress.stage]}</span></div><div className="mobile-progress" aria-hidden="true">{dossier.stages.map((_, i) => <span key={i} className={i <= progress.stage ? 'active' : ''} />)}</div><div ref={content} className="screen-content" inert={busy}>
      {progress.stage === 0 && <AccessTerminal next={() => move(1)} />}
      {progress.stage === 1 && <IdentityScan next={() => move(2)} />}
      {progress.stage === 2 && <SubjectDossier next={() => move(3)} notify={notify} />}
      {progress.stage === 3 && <PensionQuiz answers={progress.answers} onAnswer={answer} next={() => move(4)} />}
      {progress.stage === 4 && <FinalReveal complete={progress.complete} finish={() => { setProgress(p => ({ ...p, complete: true })); window.scrollTo({ top: 0, behavior: 'instant' }); }} restart={restart} />}
    </div></main></div>
    <footer className="site-footer mono"><span><span className="status-dot" />END-TO-END GOOD VIBES</span><span>СОЗДАНО С ОСОБЫМ ВНИМАНИЕМ <span className="accent">↗</span></span><span>ARCHIVE / 001</span></footer>
    <Notification notice={notice} close={closeNotice} />
    <dialog ref={modal} className="reset-dialog" onCancel={() => setResetDialog(false)} onClick={e => { if (e.target === e.currentTarget) setResetDialog(false); }}><button className="dialog-close icon-button" aria-label="Закрыть" onClick={() => setResetDialog(false)}><X size={18} /></button><RotateCcw size={25} className="accent" /><h2>Новое расследование?</h2><p>Текущий прогресс будет сброшен. Все улики найдутся снова.</p><button className="action-button" onClick={restart}>Начать сначала<RotateCcw size={16} /></button><button className="dialog-cancel" onClick={() => setResetDialog(false)}>Продолжить операцию</button></dialog>
  </div>;
}
