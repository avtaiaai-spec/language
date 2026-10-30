import { Component } from 'react';
import type { ReactNode } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { useStore } from './lib/store';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { LessonPage } from './pages/Lesson';
import { Practice, ResultPage } from './pages/Practice';
import { Vocabulary } from './pages/Vocabulary';
import { Listening, ListeningDetail } from './pages/Listening';
import { Insights } from './pages/Insights';
import { Settings } from './pages/Settings';
import { Empty } from './components/ui';
export function App() {
  const { state } = useStore();
  return (
    <HashRouter>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Перейти к содержимому
      </a>
      {!state.profile.onboarding ? (
        <Onboarding />
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="learn" element={<Catalog />} />
            <Route path="lesson/:id" element={<LessonPage />} />
            <Route path="practice" element={<Practice />} />
            <Route path="result/:id" element={<ResultPage />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="listening" element={<Listening />} />
            <Route path="listening/:id" element={<ListeningDetail />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <Empty title="Такой страницы нет">
                  <Link to="/">На главную</Link>
                </Empty>
              }
            />
          </Route>
        </Routes>
      )}
    </HashRouter>
  );
}
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="fatal-error">
        <h1>Не удалось открыть студию</h1>
        <p>Данные в браузере не удалены. Попробуйте обновить страницу.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Обновить
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
