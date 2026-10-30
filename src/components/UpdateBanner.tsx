import { useSyncExternalStore } from 'react';
import { RefreshCw } from 'lucide-react';
import { applyUpdate, getUpdateState, subscribeUpdates } from '../lib/updates';
import { Button } from './ui';
export function UpdateBanner() {
  const status = useSyncExternalStore(subscribeUpdates, getUpdateState);
  if (!status.available) return null;
  return (
    <aside className="app-update-banner" aria-label="Обновление приложения" role="status">
      <RefreshCw size={21} />
      <div>
        <strong>Доступна новая версия</strong>
        <p>{status.message || 'Установите обновлённые уроки. Данные приложения не очищаются.'}</p>
      </div>
      <Button disabled={status.applying} onClick={() => void applyUpdate()}>
        {status.applying ? 'Применяем…' : 'Обновить приложение'}
      </Button>
    </aside>
  );
}
