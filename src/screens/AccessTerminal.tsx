import { Fingerprint, ShieldCheck, ArrowDown, ScanLine } from 'lucide-react';
import { dossier } from '../config/dossierData';
import { useReveal, useTypedLines } from '../hooks/useMotion';
import { ActionButton, Eyebrow, SecurityNote, SkipButton, TerminalLines } from '../components/ui/Controls';

export default function AccessTerminal({ next }: { next: () => void }) {
  const root = useReveal();
  const terminal = useTypedLines(dossier.terminal);
  return <div ref={root} className="access-screen">
    <div className="access-heading" data-reveal>
      <Eyebrow>ЗАЩИЩЁННЫЙ АРХИВ / УРОВЕНЬ 01</Eyebrow>
      <h1>Доступ<br /><span className="serif-word">ограничен.</span><span className="heading-dot">●</span></h1>
      <p className="intro-copy">{dossier.ui.intro}</p>
      <div className="access-meta mono"><span><span className="status-dot" />КАНАЛ ЗАЩИЩЁН</span><span>AES–256</span></div>
    </div>
    <div className="classified-file" data-reveal>
      <div className="file-tab mono"><span />PERSONAL ARCHIVE</div>
      <div className="file-paper">
        <div className="file-topline mono"><span>TOP SECRET</span><ScanLine size={17} aria-hidden="true" /></div>
        <div className="file-number" aria-hidden="true">001</div>
        <div className="fingerprint-frame" aria-hidden="true"><div className="fingerprint-orbit" /><Fingerprint strokeWidth={.65} /><span className="fingerprint-scan" /></div>
        <div className="classified-stamp">CLASSIFIED</div>
        <div className="file-subject"><span className="mono">ДЕЛО №001 / SUBJECT</span><strong>LAURA<span>_</span></strong></div>
        <div className="file-bottom"><div className="barcode" aria-hidden="true" /><span className="mono">LRA—001—XX</span><ShieldCheck size={18} aria-hidden="true" /></div>
      </div>
      <span className="file-caption mono">НЕОБЫЧНЫЙ ОБЪЕКТ. ОСОБОЕ ВНИМАНИЕ.</span>
    </div>
    <section className="terminal-box" data-reveal aria-label="Терминал доступа">
      <div className="terminal-toolbar mono"><span><span className="status-dot" />SYSTEM.LOG</span><span>{terminal.done ? 'CONNECTED' : 'CONNECTING…'}</span></div>
      <TerminalLines lines={terminal.visible} done={terminal.done} />
      {!terminal.done && <SkipButton onClick={terminal.skip} />}
    </section>
    <div className="access-action" data-reveal><div className="action-hint mono"><ArrowDown size={13} aria-hidden="true" />ТВОЙ ДОПУСК УЖЕ ОДОБРЕН</div><ActionButton onClick={() => { terminal.skip(); next(); }}>{dossier.ui.access}</ActionButton><SecurityNote /></div>
  </div>;
}
