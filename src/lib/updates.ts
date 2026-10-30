import { registerSW } from 'virtual:pwa-register';
export const APP_RELEASE = '1.1.1';
export const APP_BUILD = __APP_BUILD_ID__;
export interface UpdateState {
  available: boolean;
  checking: boolean;
  applying: boolean;
  message: string;
}
let state: UpdateState = { available: false, checking: false, applying: false, message: '' };
const listeners = new Set<() => void>();
export const subscribeUpdates = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getUpdateState = () => state;
function publish(next: Partial<UpdateState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
let registration: ServiceWorkerRegistration | undefined;
let initialized = false;
let lastCheck = 0;
let inFlight: Promise<void> | null = null;
let requestedReload = false;
let reloaded = false;
function reloadOnce() {
  if (requestedReload && !reloaded) {
    reloaded = true;
    window.location.reload();
  }
}
function watchRegistration(r: ServiceWorkerRegistration) {
  registration = r;
  const watch = () => {
    const worker = r.installing;
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller)
        publish({ available: true, message: 'Готова новая версия English Studio.' });
    });
  };
  r.addEventListener('updatefound', watch);
  watch();
  if (r.waiting) publish({ available: true });
}
export function initializeUpdates() {
  if (initialized || import.meta.env.DEV) return;
  initialized = true;
  registerSW({
    immediate: true,
    onNeedRefresh() {
      publish({ available: true, message: 'Готова новая версия English Studio.' });
    },
    onNeedReload: reloadOnce,
    onRegisteredSW(_url, r) {
      if (r) {
        watchRegistration(r);
        void checkForUpdates(false);
      }
    },
    onRegisterError() {
      publish({
        message:
          'Не удалось проверить офлайн-оболочку. Проверьте подключение и повторите проверку в настройках.',
      });
    },
  });
  navigator.serviceWorker?.addEventListener('controllerchange', reloadOnce);
  const onReturn = () => {
    if (document.visibilityState === 'visible') void checkForUpdates(false);
  };
  window.addEventListener('focus', onReturn);
  window.addEventListener('online', () => {
    lastCheck = 0;
    onReturn();
  });
  document.addEventListener('visibilitychange', onReturn);
  window.setInterval(onReturn, 120000);
}
export function checkForUpdates(manual = true): Promise<void> {
  if (inFlight) return inFlight;
  if (import.meta.env.DEV) {
    publish({
      message: 'Открыта версия для разработки. Изменения применяются сервером разработки.',
    });
    return Promise.resolve();
  }
  if (!manual && Date.now() - lastCheck < 60000) return Promise.resolve();
  lastCheck = Date.now();
  inFlight = (async () => {
    publish({ checking: true, message: manual ? 'Проверяем обновления…' : state.message });
    try {
      if (!navigator.onLine) throw new Error('offline');
      const response = await fetch(`${import.meta.env.BASE_URL}version.json?check=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('version unavailable');
      const remote: unknown = await response.json();
      if (
        !remote ||
        typeof remote !== 'object' ||
        !('buildId' in remote) ||
        typeof remote.buildId !== 'string'
      )
        throw new Error('invalid version');
      if (!registration && 'serviceWorker' in navigator)
        registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
      await registration?.update();
      if (remote.buildId !== APP_BUILD || registration?.waiting)
        publish({
          available: true,
          message: 'Найдена новая версия. Нажмите «Обновить приложение».',
        });
      else if (manual) publish({ message: 'У вас актуальная версия приложения.' });
    } catch {
      if (manual)
        publish({
          message: navigator.onLine
            ? 'Не удалось проверить обновление. Попробуйте ещё раз позже.'
            : 'Нет подключения к сети. Сохранённые уроки и прогресс доступны офлайн.',
        });
    } finally {
      publish({ checking: false });
      inFlight = null;
    }
  })();
  return inFlight;
}
function waitForInstallation(worker: ServiceWorker): Promise<void> {
  if (['installed', 'activated', 'redundant'].includes(worker.state)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      worker.removeEventListener('statechange', change);
    };
    const change = () => {
      if (worker.state === 'installed' || worker.state === 'activated') {
        cleanup();
        resolve();
      } else if (worker.state === 'redundant') {
        cleanup();
        reject(new Error('installation failed'));
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('installation pending'));
    }, 20000);
    worker.addEventListener('statechange', change);
    change();
  });
}
export async function applyUpdate() {
  if (state.applying) return;
  publish({ applying: true, message: 'Загружаем обновление…' });
  try {
    if (!navigator.onLine) throw new Error('offline');
    if (!registration && 'serviceWorker' in navigator)
      registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
    await registration?.update();
    if (registration?.installing) await waitForInstallation(registration.installing);
    requestedReload = true;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      publish({ message: 'Применяем обновление…' });
    } else reloadOnce();
  } catch {
    requestedReload = false;
    publish({
      applying: false,
      message:
        'Обновление пока не удалось применить. Проверьте сеть и повторите. Ваши данные не очищены.',
    });
  }
}
