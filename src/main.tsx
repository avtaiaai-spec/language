import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import { registerSW } from 'virtual:pwa-register';
import { App, ErrorBoundary } from './App';
import { StoreProvider } from './lib/store';
import './styles.css';
const update = registerSW({
  onNeedRefresh() {
    const el = document.createElement('button');
    el.className = 'update-prompt btn btn-secondary';
    el.textContent = 'Доступно обновление · Применить';
    el.onclick = () => {
      void update(true);
    };
    document.body.appendChild(el);
  },
});
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ErrorBoundary>,
);
