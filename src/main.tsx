import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import { initializeUpdates } from './lib/updates';
import { App, ErrorBoundary } from './App';
import { StoreProvider } from './lib/store';
import './styles.css';
initializeUpdates();
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ErrorBoundary>,
);
