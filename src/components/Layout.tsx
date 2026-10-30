import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  BookOpen,
  House,
  Library,
  Headphones,
  ChartNoAxesCombined,
  Settings,
  Search,
  ArrowUpRight,
  Sun,
  Moon,
  X,
  WifiOff,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { stopAudio } from '../lib/audio';
import { lessons } from '../data/curriculum';
import { Button, Input, Modal, Progress } from './ui';
import { dayKey } from '../lib/learning';
const nav = [
  { to: '/', label: 'Главная', Icon: House },
  { to: '/learn', label: 'Обучение', Icon: BookOpen },
  { to: '/vocabulary', label: 'Словарь', Icon: Library },
  { to: '/listening', label: 'Аудирование', Icon: Headphones },
  { to: '/insights', label: 'Прогресс', Icon: ChartNoAxesCombined },
];
export function Layout() {
  const { state, update, notice, notify, storageError } = useStore();
  const loc = useLocation();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    stopAudio();
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  useEffect(() => {
    const a = () => setOffline(!navigator.onLine);
    window.addEventListener('online', a);
    window.addEventListener('offline', a);
    return () => {
      window.removeEventListener('online', a);
      window.removeEventListener('offline', a);
    };
  }, []);
  const today = state.sessions
    .filter((s) => dayKey(s.at) === dayKey(Date.now()))
    .reduce((n, s) => n + s.seconds, 0);
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <BookOpen size={24} />
          </span>
          <span>
            ENGLISH<span className="brand-sub">STUDIO</span>
          </span>
        </Link>
        <p className="nav-label">ВАШЕ ПРОСТРАНСТВО</p>
        <nav>
          {nav.map(({ to, label, Icon }) => (
            <NavLink to={to} end={to === '/'} key={to}>
              <Icon size={20} />
              <span>{label}</span>
              {to === '/learn' && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="daily-card">
            <div className="row between">
              <span>Ежедневная цель</span>
              <span className="gold">✦</span>
            </div>
            <p>
              <strong>{Math.floor(today / 60)}</strong>
              <span className="muted"> / {state.settings.dailyGoal} мин</span>
            </p>
            <Progress
              value={(today / 60 / state.settings.dailyGoal) * 100}
              label="Ежедневная цель"
            />
            <small className="muted">Понемногу. Но каждый день.</small>
          </div>
          <NavLink className="settings-link" to="/settings">
            <Settings size={19} /> Настройки
          </NavLink>
          <Link to="/settings" className="user-link">
            <span className="avatar">{state.profile.name.slice(0, 1).toUpperCase() || 'E'}</span>
            <span>
              {state.profile.name || 'Ваше пространство'}
              <small>
                Личный кабинет <ArrowUpRight size={12} />
              </small>
            </span>
          </Link>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="topbar-label">ЛИЧНАЯ БИБЛИОТЕКА ЗНАНИЙ</span>
          <Link className="mobile-brand" to="/">
            ENGLISH STUDIO
          </Link>
          <div className="row">
            <button
              className="search-trigger"
              onClick={() => setSearch(true)}
              aria-label="Поиск по урокам и словам"
            >
              <Search size={17} />
              <span>Найти в студии</span>
              <kbd>⌕</kbd>
            </button>
            <Button
              variant="ghost"
              className="icon-btn"
              aria-label="Сменить тему"
              onClick={() =>
                update((s) => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    theme: document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark',
                  },
                }))
              }
            >
              {state.settings.theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </Button>
            <Link className="mobile-settings" to="/settings" aria-label="Профиль и настройки">
              <Settings size={19} />
            </Link>
            <Link className="level-chip" to="/learn">
              {state.profile.level} <span>Ваш уровень</span>
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {offline && (
            <p className="alert">
              <WifiOff size={17} /> Вы офлайн. Уроки и прогресс доступны локально; озвучка зависит
              от голосов устройства.
            </p>
          )}
          {storageError && (
            <p className="alert error" role="alert">
              {storageError} <Link to="/settings">Управление данными</Link>
            </p>
          )}
          <Outlet />
        </main>
        <footer className="footer">
          ENGLISH STUDIO <span>С любопытством к миру. С вниманием к себе.</span>
          <span>LEARN · EXPLORE · GROW</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Основная навигация">
        {nav.map(({ to, label, Icon }) => (
          <NavLink end={to === '/'} to={to} key={to}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button aria-label="Закрыть уведомление" onClick={() => notify('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {search && (
        <Modal title="Поиск в студии" onClose={() => setSearch(false)}>
          <Input
            autoFocus
            placeholder="Урок, слово или тема…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="search-results">
            {query.trim() ? (
              <>
                {lessons
                  .filter((l) => `${l.title} ${l.rule}`.toLowerCase().includes(query.toLowerCase()))
                  .map((l) => (
                    <Link onClick={() => setSearch(false)} key={l.id} to={`/lesson/${l.id}`}>
                      <BookOpen size={18} />
                      <span>
                        {l.title}
                        <small>{l.level} · Урок</small>
                      </span>
                      <ArrowUpRight size={17} />
                    </Link>
                  ))}
                {state.vocabulary
                  .filter((w) => `${w.en} ${w.ru}`.toLowerCase().includes(query.toLowerCase()))
                  .map((w) => (
                    <Link
                      key={w.id}
                      to={`/vocabulary?q=${encodeURIComponent(w.en)}`}
                      onClick={() => setSearch(false)}
                    >
                      <Library size={18} />
                      <span>
                        {w.en}
                        <small>{w.ru}</small>
                      </span>
                    </Link>
                  ))}
                {!lessons.some((l) =>
                  `${l.title} ${l.rule}`.toLowerCase().includes(query.toLowerCase()),
                ) &&
                  !state.vocabulary.some((w) =>
                    `${w.en} ${w.ru}`.toLowerCase().includes(query.toLowerCase()),
                  ) && <p className="muted">Ничего не найдено. Попробуйте другое слово.</p>}
              </>
            ) : (
              <p className="muted">Ищите по названию урока или слову на русском и английском.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
