import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Volume2, Square, X, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { speak, stopAudio } from '../lib/audio';
import { useStore } from '../lib/store';
export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />;
}
export function Card({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`card ${className}`} {...props} />;
}
export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>;
}
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...props} />;
}
export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card className="empty">
      <div className="empty-mark">✦</div>
      <h3>{title}</h3>
      <div className="muted">{children}</div>
    </Card>
  );
}
export function AudioButton({
  text,
  label = 'Прослушать',
  small = false,
}: {
  text: string;
  label?: string;
  small?: boolean;
}) {
  const { state, notify } = useStore();
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  useEffect(() => () => stopAudio(), [text]);
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const load = () => speechSynthesis.getVoices();
      speechSynthesis.addEventListener('voiceschanged', load);
      load();
      return () => speechSynthesis.removeEventListener('voiceschanged', load);
    }
  }, []);
  return (
    <Button
      variant="ghost"
      className={`audio ${small ? 'icon-btn' : ''}`}
      aria-label={label}
      title={label}
      aria-pressed={playing}
      aria-busy={pending}
      onClick={() => {
        if (playing || pending) {
          stopAudio();
          setPlaying(false);
          setPending(false);
        } else {
          setPending(true);
          speak(
            text,
            state.settings.accent,
            state.settings.rate,
            () => {
              setPlaying(false);
              setPending(false);
            },
            (m) => {
              setPlaying(false);
              setPending(false);
              notify(m);
            },
            () => {
              setPending(false);
              setPlaying(true);
            },
          );
        }
      }}
    >
      {playing ? <Square size={17} /> : <Volume2 size={18} />}{' '}
      {!small && (pending ? 'Запускаем…' : playing ? 'Остановить' : label)}
    </Button>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    d?.showModal();
    return () => {
      d?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="row between">
        <h2>{title}</h2>
        <Button variant="ghost" aria-label="Закрыть" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: T; title: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((i) => (
        <button
          key={i.id}
          className={value === i.id ? 'active' : ''}
          aria-pressed={value === i.id}
          onClick={() => onChange(i.id)}
        >
          {i.title}
        </button>
      ))}
    </div>
  );
}
export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
