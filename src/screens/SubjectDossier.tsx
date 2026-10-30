import { FileText, Eye, Paperclip } from 'lucide-react';
import { useRef } from 'react';
import { dossier } from '../config/dossierData';
import { useReveal } from '../hooks/useMotion';
import { ActionButton, Eyebrow } from '../components/ui/Controls';
import { Accordion } from '../components/ui/Accordion';

export default function SubjectDossier({ next, notify }: { next: () => void; notify: (lines: readonly string[]) => void }) {
  const root = useReveal();
  const taps = useRef(0);
  const pensionClick = () => { taps.current++; if (taps.current % 5 === 0) notify(dossier.easterEgg); };
  return <div ref={root} className="narrow-screen dossier-screen">
    <div data-reveal><Eyebrow>АРХИВ 03 / ЛИЧНОЕ ДЕЛО №001</Eyebrow><h1>Улики говорят<br /><span className="serif-word">сами за себя.</span></h1></div>
    <article className="dossier-sheet" data-reveal>
      <div className="dossier-sheet-top mono"><span><FileText size={13} />SUBJECT DOSSIER</span><span className="small-stamp">CLASSIFIED</span></div>
      <div className="subject-identity"><div className="subject-monogram" aria-hidden="true">L<span>001</span></div><div><span className="mono muted">ИМЯ ОБЪЕКТА</span><h2>{dossier.name}</h2><span className="subject-status"><span className="status-dot" />Под особым наблюдением</span></div></div>
      <div className="codename"><span className="mono muted">КОДОВОЕ ИМЯ</span><strong>«{dossier.codename}»</strong></div>
      <Accordion title="Особые приметы" number="01" initialOpen><ul className="trait-list">{dossier.traits.map(trait => <li key={trait}><span />{trait}</li>)}</ul></Accordion>
      <Accordion title="Характер угрозы" number="02"><p>{dossier.threat}</p><div className="threat-note"><Eye size={15} /><span>Вероятность быть забытой:<br /><strong>{dossier.forgotten}</strong></span></div></Accordion>
      <Accordion title="Заметки агента" number="03" initialOpen><div className="agent-notes"><Paperclip size={19} aria-hidden="true" /><ol>{dossier.notes.map((note, i) => <li key={i}>{i === 1 ? <>Использует слово «<button className="pension-word" onClick={pensionClick} aria-label="Пенсия. Секретная кнопка.">пенсия</button>» как психологическое оружие.</> : note}</li>)}</ol><span className="mono notes-footnote">ДОКУМЕНТ ПРОВЕРЕН. АГЕНТ — НЕ ОЧЕНЬ.</span></div></Accordion>
      <div className="dossier-bottom mono">К ДОСЬЕ ПРИЛАГАЕТСЯ: НЕКОНТРОЛИРУЕМАЯ СИМПАТИЯ</div>
    </article>
    <ActionButton onClick={next}>{dossier.ui.dossier}</ActionButton>
  </div>;
}
