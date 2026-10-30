import { ArrowUpRight, FastForward, LockKeyhole } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function ActionButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="action-button group" {...props}><span>{children}</span><ArrowUpRight size={19} aria-hidden="true" /></button>;
}
export function SkipButton({ onClick, children = 'Пропустить анимацию' }: { onClick: () => void; children?: ReactNode }) {
  return <button className="skip-button" onClick={onClick}><FastForward size={12} aria-hidden="true" />{children}</button>;
}
export function Eyebrow({ children }: { children: ReactNode }) { return <div className="eyebrow"><span className="tiny-square" />{children}</div>; }
export function SecurityNote() { return <div className="security-note"><LockKeyhole size={11} aria-hidden="true" /><span>ТОЛЬКО ДЛЯ ТВОИХ ГЛАЗ</span><span className="security-line" /><span>№001</span></div>; }
export function TerminalLines({ lines, done }: { lines: readonly string[]; done: boolean }) {
  return <div className="terminal-lines" aria-label="Системный журнал">{lines.map((line, i) => <div key={i} className={line.includes('ОШИБКА') || line.includes('ВНИМАНИЕ') ? 'terminal-warning' : ''}><span className="terminal-prefix">›</span><span>{line}{i === lines.length - 1 && !done && <span className="cursor">▌</span>}</span></div>)}</div>;
}
