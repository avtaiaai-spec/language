import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Upload,
  Cloud,
  UserRound,
  MonitorSmartphone,
  LogOut,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useStore, freshState } from '../lib/store';
import { parseBackup, STORAGE_KEY } from '../lib/storage';
import { cloud, cloudConfigError } from '../lib/cloud';
import { contexts, levels } from '../data/curriculum';
import { AudioButton, Badge, Button, Card, Input, Modal, PageTitle } from '../components/ui';
import type { AppState, LevelId } from '../types';
function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Settings() {
  const {
    state,
    update,
    notify,
    restore,
    user,
    syncStatus,
    cloudReady,
    retrySync,
    cloudConflict,
    resolveCloud,
  } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<AppState | null>(null);
  const [reset, setReset] = useState(false);
  const [goalsDraft, setGoalsDraft] = useState(state.profile.goals.join(', '));
  useEffect(() => setGoalsDraft(state.profile.goals.join(', ')), [state.profile.goals]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState(false);
  const setting = <K extends keyof AppState['settings']>(key: K, value: AppState['settings'][K]) =>
    update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
  const authenticate = async () => {
    if (!cloud) return;
    setBusy(true);
    setAuthMessage('');
    setAuthError(false);
    try {
      const result =
        authMode === 'login'
          ? await cloud.auth.signInWithPassword({ email, password })
          : await cloud.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
            });
      if (result.error) throw result.error;
      setPassword('');
      setAuthMessage(
        authMode === 'signup' && !result.data.session
          ? 'Проверьте почту и подтвердите регистрацию.'
          : 'Вы вошли в аккаунт.',
      );
    } catch (e) {
      setAuthError(true);
      setAuthMessage(e instanceof Error ? e.message : 'Не удалось войти.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="MAKE IT YOURS"
        title="Ваше пространство"
        description="Настройте студию под себя. Всё можно изменить в любой момент."
      />
      <div className="settings-grid">
        <div>
          <Card>
            <h2>
              <UserRound size={23} /> Профиль
            </h2>
            <label>
              Как к вам обращаться
              <Input
                maxLength={60}
                value={state.profile.name}
                onChange={(e) =>
                  update((s) => ({ ...s, profile: { ...s.profile, name: e.target.value } }))
                }
                placeholder="Ваше имя"
              />
            </label>
            <div className="form-grid">
              <label>
                Текущий уровень
                <select
                  value={state.profile.level}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      profile: { ...s.profile, level: e.target.value as LevelId },
                    }))
                  }
                >
                  {levels.map((l) => (
                    <option value={l.id} key={l.id}>
                      {l.id} · {l.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ежедневная цель
                <select
                  value={state.settings.dailyGoal}
                  onChange={(e) => setting('dailyGoal', Number(e.target.value))}
                >
                  {[10, 15, 20, 30].map((v) => (
                    <option value={v} key={v}>
                      {v} минут
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Цели изучения
              <Input
                value={goalsDraft}
                placeholder="Работа, общение, путешествия…"
                onChange={(e) => setGoalsDraft(e.target.value)}
                onBlur={() =>
                  update((s) => ({
                    ...s,
                    profile: {
                      ...s.profile,
                      goals: goalsDraft
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </label>
            <h3>Любимые темы примеров</h3>
            <p className="muted fine">
              Первая выбранная тема используется по умолчанию. Внутри урока можно выбрать любую.
            </p>
            <div className="choice-grid">
              {contexts.map((c) => (
                <button
                  className={`choice ${state.settings.contexts.includes(c.id) ? 'selected' : ''}`}
                  key={c.id}
                  aria-pressed={state.settings.contexts.includes(c.id)}
                  onClick={() => {
                    const next = state.settings.contexts.includes(c.id)
                      ? state.settings.contexts.filter((id) => id !== c.id)
                      : [...state.settings.contexts, c.id];
                    if (next.length) setting('contexts', next);
                    else notify('Оставьте хотя бы одну тему.');
                  }}
                >
                  {c.title}
                </button>
              ))}
            </div>
            <p className="success-text fine">
              <ShieldCheck size={15} /> Настройки сохраняются автоматически
            </p>
          </Card>
          <Card>
            <h2>Звук и оформление</h2>
            <div className="form-grid">
              <label>
                Произношение
                <select
                  value={state.settings.accent}
                  onChange={(e) => setting('accent', e.target.value as 'en-US' | 'en-GB')}
                >
                  <option value="en-GB">Британское · en-GB</option>
                  <option value="en-US">Американское · en-US</option>
                </select>
              </label>
              <label>
                Скорость
                <select
                  value={state.settings.rate}
                  onChange={(e) => setting('rate', Number(e.target.value))}
                >
                  {[0.75, 1, 1.25].map((v) => (
                    <option key={v} value={v}>
                      {v}×
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <AudioButton
              text="Welcome to English Studio. A little practice every day."
              label="Проверить произношение"
            />
            <p className="muted fine">
              Если выбранного акцента нет, используется другой доступный английский голос.
              Установите английский голос в настройках устройства. Сетевая озвучка требует
              подключения.
            </p>
            <label>
              Тема
              <select
                aria-label="Тема"
                value={state.settings.theme}
                onChange={(e) => setting('theme', e.target.value as 'dark' | 'light' | 'system')}
              >
                <option value="dark">Тёмная</option>
                <option value="light">Светлая</option>
                <option value="system">Системная</option>
              </select>
            </label>
          </Card>
          <Card>
            <h2>
              <Download size={23} /> Управление данными
            </h2>
            <p className="muted">
              Гостевые данные хранятся в этом браузере. Для переноса на другое устройство
              используйте JSON-копию или облачный аккаунт. Очистка браузера удалит локальную копию.
            </p>
            <div className="row wrap">
              <Button
                variant="secondary"
                onClick={() =>
                  download(JSON.stringify(state, null, 2), 'english-studio-backup.json')
                }
              >
                <Download size={17} /> Экспорт JSON
              </Button>
              <Button variant="secondary" onClick={() => file.current?.click()}>
                <Upload size={17} /> Импорт копии
              </Button>
            </div>
            <input
              hidden
              ref={file}
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  if (f.size > 10_000_000) throw new Error('Размер файла больше 10 МБ.');
                  setImported(parseBackup(await f.text()));
                } catch (error) {
                  notify(error instanceof Error ? error.message : 'Не удалось прочитать копию.');
                }
                e.target.value = '';
              }}
            />
            <details>
              <summary>Восстановление и сброс</summary>
              <p className="muted fine">
                При повреждении хранилища сначала сохраните исходный файл для восстановления.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  const raw = localStorage.getItem(STORAGE_KEY);
                  if (raw) download(raw, 'english-studio-raw-recovery.json');
                  else notify('Исходных данных в хранилище нет.');
                }}
              >
                Экспорт исходного хранилища
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const raw = localStorage.getItem('english-studio:before-cloud-selection');
                  if (raw) download(raw, 'english-studio-before-cloud-selection.json');
                  else notify('Копии до выбора облачных данных пока нет.');
                }}
              >
                Копия до выбора облачных данных
              </Button>
              <Button variant="danger" onClick={() => setReset(true)}>
                <Trash2 size={16} /> Сбросить локальный прогресс
              </Button>
            </details>
          </Card>
        </div>
        <aside>
          <Card>
            <h2>
              <Cloud size={23} /> Облачный аккаунт
            </h2>
            {!cloud ? (
              <>
                <Badge>ГОСТЕВОЙ РЕЖИМ</Badge>
                {cloudConfigError && (
                  <p className="error-text" role="alert">
                    {cloudConfigError}
                  </p>
                )}
                <p className="muted">
                  Облачная синхронизация не подключена. Все функции обучения доступны локально.
                </p>
                <p className="fine muted">
                  Для подключения владельцу сайта нужно создать Supabase-проект, применить миграцию
                  и задать публичные параметры окружения. Инструкция — в README проекта.
                </p>
              </>
            ) : !cloudReady ? (
              <p role="status">Проверяем аккаунт…</p>
            ) : user ? (
              <>
                <p>
                  Вы вошли как <strong>{user.email}</strong>
                </p>
                <p className="muted" role="status">
                  {syncStatus || 'Подготавливаем синхронизацию…'}
                </p>
                {cloudConflict ? (
                  <div className="cloud-conflict">
                    <p>
                      Облачная копия: {Object.keys(cloudConflict.progress).length} уроков,{' '}
                      {cloudConflict.vocabulary.length} слов. Локальная:{' '}
                      {Object.keys(state.progress).length} уроков, {state.vocabulary.length} слов.
                    </p>
                    <p className="fine muted">
                      Выберите копию для этого устройства и облака. Сначала можно экспортировать
                      текущую. Данные не объединяются автоматически.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        download(JSON.stringify(state, null, 2), 'english-studio-before-cloud.json')
                      }
                    >
                      Экспорт текущей копии
                    </Button>
                    <Button onClick={() => resolveCloud('remote')}>Использовать облачную</Button>
                    <Button variant="secondary" onClick={() => resolveCloud('local')}>
                      Использовать локальную
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={retrySync}>
                    Повторить синхронизацию
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const { error } = await cloud!.auth.signOut();
                    notify(error ? error.message : 'Вы вышли. Локальные данные сохранены.');
                  }}
                >
                  <LogOut size={16} /> Выйти
                </Button>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void authenticate();
                }}
              >
                <p className="muted">
                  Войдите, чтобы сохранить копию в облаке. Перед первым входом рекомендуем
                  экспортировать JSON.
                </p>
                <p className="fine muted">
                  При отличии облачной копии вы выбираете, какие данные сохранить. Одновременное
                  обучение на нескольких устройствах не объединяется. На общем устройстве
                  используйте отдельные профили браузера.
                </p>
                <div className="tabs">
                  <button
                    type="button"
                    className={authMode === 'login' ? 'active' : ''}
                    onClick={() => setAuthMode('login')}
                  >
                    Вход
                  </button>
                  <button
                    type="button"
                    className={authMode === 'signup' ? 'active' : ''}
                    onClick={() => setAuthMode('signup')}
                  >
                    Регистрация
                  </button>
                </div>
                <label>
                  Email
                  <Input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  Пароль
                  <Input
                    required
                    type="password"
                    minLength={8}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Подождите…' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
                </Button>
                {authMessage && (
                  <p
                    className={authError ? 'error-text' : 'success-text'}
                    role={authError ? 'alert' : 'status'}
                  >
                    {authMessage}
                  </p>
                )}
              </form>
            )}
          </Card>
          <Card>
            <h2>
              <MonitorSmartphone size={23} /> Студия на iPhone
            </h2>
            <p className="muted">
              Откройте опубликованный сайт в Safari, нажмите «Поделиться» → «На экран “Домой”».
            </p>
            <p className="fine muted">
              Для установки нужен HTTPS. После первого открытия оболочка и учебные материалы
              доступны офлайн. YouTube и сетевые голоса не кешируются.
            </p>
          </Card>
          <div className="quote-card">
            <span>“</span>
            <blockquote>
              Make room for
              <br />
              something new.
            </blockquote>
            <p>ВАШЕ ВРЕМЯ ДЛЯ РОСТА</p>
          </div>
        </aside>
      </div>
      {imported && (
        <Modal title="Восстановить резервную копию?" onClose={() => setImported(null)}>
          <p>
            Копия от {new Date(imported.updatedAt).toLocaleString('ru-RU')}:{' '}
            {Object.keys(imported.progress).length} уроков, {imported.vocabulary.length} слов. Она
            заменит текущий прогресс и при подключении синхронизируется с облаком.
          </p>
          <p className="muted">Перед заменой сохраните текущие данные.</p>
          <div className="row wrap">
            <Button
              variant="secondary"
              onClick={() =>
                download(JSON.stringify(state, null, 2), 'english-studio-before-import.json')
              }
            >
              Скачать текущую копию
            </Button>
            <Button
              onClick={() => {
                if (!restore(imported)) return;
                setImported(null);
                notify('Данные восстановлены.');
              }}
            >
              Восстановить
            </Button>
          </div>
        </Modal>
      )}
      {reset && (
        <Modal title="Начать с чистого листа?" onClose={() => setReset(false)}>
          <p>
            Это удалит текущий прогресс на устройстве. При активном аккаунте сброс также сохранится
            в облаке. Сначала экспортируйте резервную копию.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (!restore(freshState())) return;
              setReset(false);
            }}
          >
            Сбросить прогресс
          </Button>
        </Modal>
      )}
    </>
  );
}
