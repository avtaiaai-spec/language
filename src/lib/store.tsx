import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppState } from '../types';
import { freshState, loadState, parseBackup, saveState, STORAGE_KEY } from './storage';
import { cloud } from './cloud';
type Update = (fn: (prev: AppState) => AppState) => void;
const Store = createContext<{
  state: AppState;
  update: Update;
  notice: string;
  notify: (s: string) => void;
  storageError: string;
  restore: (s: AppState) => boolean;
  user: User | null;
  syncStatus: string;
  cloudReady: boolean;
  retrySync: () => void;
  cloudConflict: AppState | null;
  resolveCloud: (source: 'local' | 'remote') => void;
}>(null!);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadState);
  const [state, setState] = useState(initial.state);
  const [storageError, setStorageError] = useState(initial.error || '');
  const [notice, notify] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [cloudReady, setCloudReady] = useState(!cloud);
  const [syncStatus, setSyncStatus] = useState('');
  const [retry, setRetry] = useState(0);
  const [cloudConflict, setCloudConflict] = useState<AppState | null>(null);
  const corrupt = useRef(!!initial.error);
  const latest = useRef(state);
  latest.current = state;
  const hydrated = useRef(false);
  const generation = useRef(0);
  const update = useCallback<Update>(
    (fn) => setState((prev) => ({ ...fn(prev), updatedAt: Date.now() })),
    [],
  );
  const restore = (s: AppState) => {
    try {
      const restored = { ...s, updatedAt: Date.now() };
      saveState(restored);
      corrupt.current = false;
      setStorageError('');
      setState(restored);
      return true;
    } catch {
      setStorageError('Не удалось сохранить данные. Освободите место или разрешите localStorage.');
      return false;
    }
  };
  useEffect(() => {
    if (corrupt.current) return;
    try {
      saveState(state);
      setStorageError('');
    } catch {
      setStorageError(
        'Не удалось сохранить изменения на устройстве. Экспортируйте данные в настройках.',
      );
    }
  }, [state]);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () =>
      (document.documentElement.dataset.theme =
        state.settings.theme === 'system' ? (mq.matches ? 'dark' : 'light') : state.settings.theme);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [state.settings.theme]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => notify(''), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (!cloud) return;
    cloud.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) setSyncStatus(error.message);
        setUser(data.session?.user || null);
        setCloudReady(true);
      })
      .catch(() => {
        setSyncStatus('Не удалось проверить аккаунт. Гостевой режим доступен.');
        setCloudReady(true);
      });
    const { data } = cloud.auth.onAuthStateChange((_event, session) => {
      setUser((previous) =>
        previous?.id === session?.user?.id ? previous : session?.user || null,
      );
      setCloudReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!cloud || !user) {
      hydrated.current = false;
      setCloudConflict(null);
      setSyncStatus('');
      return;
    }
    const client = cloud;
    let cancelled = false;
    const g = ++generation.current;
    hydrated.current = false;
    setCloudConflict(null);
    setSyncStatus('Загрузка облачной копии…');
    (async () => {
      try {
        const { data, error } = await client
          .from('user_data')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled || generation.current !== g) return;
        if (data?.data) {
          const remote = parseBackup(JSON.stringify(data.data));
          if (JSON.stringify(remote) !== JSON.stringify(latest.current)) {
            setCloudConflict(remote);
            setSyncStatus('В облаке есть другая копия. Выберите данные в настройках.');
            return;
          }
        }
        hydrated.current = true;
        setSyncStatus('Синхронизация…');
        setRetry((n) => n + 1);
      } catch (e) {
        if (!cancelled)
          setSyncStatus(
            `Облако недоступно: ${e instanceof Error ? e.message : 'ошибка загрузки'}. Локальная копия сохранена.`,
          );
      }
    })();
    return () => {
      cancelled = true;
      generation.current++;
    };
  }, [user]);
  // Uploads are serialized; a slow older request cannot finish after a newer one from this tab.
  const uploadQueue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    if (!cloud || !user || !hydrated.current || corrupt.current) return;
    let cancelled = false;
    const client = cloud;
    const g = generation.current;
    const userId = user.id;
    const t = setTimeout(() => {
      uploadQueue.current = uploadQueue.current
        .catch(() => {})
        .then(async () => {
          if (cancelled || g !== generation.current) return;
          setSyncStatus('Синхронизация…');
          try {
            const { error } = await client
              .from('user_data')
              .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
            if (!cancelled && g === generation.current)
              setSyncStatus(
                error ? `Ошибка синхронизации: ${error.message}` : 'Сохранено в облаке',
              );
          } catch {
            if (!cancelled)
              setSyncStatus(
                'Сеть недоступна. Изменения сохранены локально. Повторите синхронизацию позже.',
              );
          }
        });
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [state, user, retry]);
  const resolveCloud = (source: 'local' | 'remote') => {
    if (!cloudConflict) return;
    try {
      localStorage.setItem('english-studio:before-cloud-selection', JSON.stringify(latest.current));
    } catch {
      notify('Перед заменой данных экспортируйте JSON: резервная копия в браузере недоступна.');
      return;
    }
    if (source === 'remote' && !restore(cloudConflict)) return;
    hydrated.current = true;
    if (source === 'local') update((s) => s);
    setCloudConflict(null);
    setRetry((n) => n + 1);
  };
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const next = parseBackup(e.newValue);
        if (next.updatedAt > latest.current.updatedAt) {
          if (latest.current.active)
            notify('Данные изменены в другой вкладке. Завершите занятие и обновите страницу.');
          else setState(next);
        }
      } catch {
        /* Ignore malformed data from another tab. */
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  return (
    <Store.Provider
      value={{
        state,
        update,
        notice,
        notify,
        storageError,
        restore,
        user,
        syncStatus,
        cloudReady,
        cloudConflict,
        resolveCloud,
        retrySync: () => {
          if (hydrated.current) setRetry((x) => x + 1);
          else setUser((u) => (u ? { ...u } : null));
        },
      }}
    >
      {children}
    </Store.Provider>
  );
}
export const useStore = () => useContext(Store);
export { freshState };
