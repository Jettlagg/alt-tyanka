import { useEffect, useRef, useState } from 'react';
import { Check, Activity, TriangleAlert, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { dossier } from '../config/dossierData';
import { reducedMotion, useReveal, useTypedLines } from '../hooks/useMotion';
import { ActionButton, Eyebrow, SkipButton, TerminalLines } from '../components/ui/Controls';

function Analysis({ next }: { next: () => void }) {
  const terminal = useTypedLines(dossier.analysis);
  const root = useReveal(terminal.done);
  return <div ref={root} className="quiz-analysis">
    <div className="analysis-icon" data-reveal><Activity size={30} strokeWidth={1} /></div>
    <Eyebrow>ОТДЕЛ СОМНИТЕЛЬНОЙ АНАЛИТИКИ</Eyebrow>
    <h2 data-reveal>{terminal.done ? 'Вердикт системы.' : 'Считаем. Пересчитываем.'}</h2>
    <div className="terminal-box"><div className="terminal-toolbar mono"><span>COMPATIBILITY.EXE</span><span>{terminal.done ? 'DONE' : 'RUNNING'}</span></div><TerminalLines lines={terminal.visible} done={terminal.done} />{!terminal.done && <SkipButton onClick={terminal.skip} />}</div>
    {terminal.done && <div className="compatibility-result" data-reveal><span className="mono">СОВМЕСТИМОСТЬ</span><div>999<span>%</span></div><div className="compatibility-rule" /><div className="compatibility-copy">{dossier.compatibility.map(line => <p key={line}>{line}</p>)}</div><span className="mono small-note">ШУТОЧНЫЙ РЕЗУЛЬТАТ. НАУКА ВЫШЛА ИЗ ЧАТА.</span></div>}
    {terminal.done && <ActionButton onClick={next}>{dossier.ui.quiz}</ActionButton>}
  </div>;
}

export default function PensionQuiz({ answers, onAnswer, next }: { answers: number[]; onAnswer: (index: number, value: number) => void; next: () => void }) {
  const [index, setIndex] = useState(Math.min(answers.length, 3));
  const [selected, setSelected] = useState<number | null>(null);
  const lock = useRef(false);
  const root = useReveal(index);
  const progressBar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!progressBar.current) return;
    const tween = gsap.to(progressBar.current, { scaleX: Math.min(index + (selected === null ? 0 : 1), 3) / 3, transformOrigin: 'left', duration: reducedMotion() ? 0 : .4 });
    return () => { tween.kill(); };
  }, [index, selected]);
  const answer = (value: number) => {
    if (lock.current || selected !== null) return;
    lock.current = true; setSelected(value); onAnswer(index, value);
  };
  const advance = () => { if (selected === null) return; setIndex(i => i + 1); setSelected(null); lock.current = false; };
  const question = dossier.quiz[index];
  if (index === 3) return <div ref={root} className="narrow-screen"><Analysis next={next} /></div>;
  return <div ref={root} className="narrow-screen quiz-screen">
    <div data-reveal><Eyebrow>ПРОТОКОЛ 04 / СТРЕСС-ТЕСТ</Eyebrow><div className="quiz-warning mono"><TriangleAlert size={15} />ВОЗРАСТНЫЕ ШУТКИ ВПЕРЕДИ</div><h1>{dossier.ui.quizTitle}</h1><p className="intro-copy">{dossier.ui.quizIntro}</p></div>
    <div className="quiz-question-count mono"><span>ВОПРОС 0{index + 1}</span><span>ИЗ 03</span></div><div className="quiz-progress-track"><div ref={progressBar} /></div>
    <div className="question-card" data-reveal><h2>{question.question}</h2><div className="answer-list">{question.answers.map((label, i) => <button key={label} className={`answer-button ${selected === i ? 'selected' : ''} ${selected !== null && selected !== i ? 'unselected' : ''}`} onClick={() => answer(i)} disabled={selected !== null} aria-pressed={selected === i}><span className="answer-index mono">{selected === i ? <Check size={14} /> : `0${i + 1}`}</span><span>{label}</span></button>)}</div></div>
    {selected !== null ? <div className="quiz-response" role="status"><div className="reaction-copy"><Activity size={19} /><div>{question.reaction.map(line => <p key={line}>{line}</p>)}</div></div><ActionButton onClick={advance}>{index === 2 ? 'Узнать результат' : 'Следующий вопрос'}</ActionButton></div> : <p className="small-note quiz-note"><Sparkles size={12} />Здесь любой ответ — улика. И каждый правильный.</p>}
  </div>;
}
