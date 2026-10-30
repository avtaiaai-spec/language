import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Clock3, LockKeyhole } from 'lucide-react';
import { levels, modules, lessons } from '../data/curriculum';
import { useStore } from '../lib/store';
import { PageTitle, Tabs, Card, Badge, Progress } from '../components/ui';
import type { LevelId } from '../types';
export function Catalog() {
  const { state } = useStore();
  const [selected, setSelected] = useState<LevelId>(state.profile.level);
  const level = levels.find((l) => l.id === selected)!;
  const all = lessons.filter((l) => l.level === selected);
  const count = all.filter((l) => state.progress[l.id]).length;
  return (
    <>
      <PageTitle
        eyebrow="YOUR LEARNING PATH"
        title="Одна глава за другой."
        description="Последовательный маршрут от первых слов к свободе выражения."
      />
      <Tabs
        label="Уровни курса"
        value={selected}
        onChange={setSelected}
        items={levels.map((l) => ({ id: l.id, title: l.id }))}
      />
      <Card className="catalog-banner">
        <div>
          <Badge>{level.planned ? 'В разработке' : 'Доступно для изучения'}</Badge>
          <h2>
            <span className="gold">{level.id}</span> {level.title}
          </h2>
          <p className="muted">{level.description}</p>
        </div>
        <div className="catalog-progress">
          <b>{Math.round(all.length ? (count / all.length) * 100 : 0)}%</b>
          <Progress label="Прогресс курса" value={all.length ? (count / all.length) * 100 : 0} />
          <small className="muted">
            {count} из {all.length} уроков завершено
          </small>
        </div>
      </Card>
      {modules
        .filter((m) => m.level === selected)
        .map((m, i) => {
          const ls = all.filter((l) => l.moduleId === m.id);
          const completed = ls.filter((l) => state.progress[l.id]).length;
          return (
            <section key={m.id} className="module-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">МОДУЛЬ {String(i + 1).padStart(2, '0')}</p>
                  <h2>{m.title}</h2>
                  <p className="muted">{m.description}</p>
                </div>
                <span className="muted fine">
                  {ls.length ? `${completed} / ${ls.length} уроков` : 'Скоро'}
                </span>
              </div>
              {!ls.length ? (
                <Card className="planned-card">
                  <LockKeyhole size={25} />
                  <h3>Новая глава ещё пишется</h3>
                  <p className="muted">
                    Материалы этого модуля пока не опубликованы. Доступные уроки A1–B1 можно открыть
                    в любое время.
                  </p>
                  <button className="btn btn-secondary" onClick={() => setSelected('A1')}>
                    К доступным урокам
                  </button>
                </Card>
              ) : (
                <div className="lesson-grid">
                  {ls.map((l, j) => (
                    <Link key={l.id} className="lesson-card" to={`/lesson/${l.id}`}>
                      <div className="row between">
                        <span className={`lesson-index ${state.progress[l.id] ? 'done' : ''}`}>
                          {state.progress[l.id] ? (
                            <Check size={22} />
                          ) : (
                            String(j + 1).padStart(2, '0')
                          )}
                        </span>
                        <ArrowUpRight size={20} />
                      </div>
                      <Badge>
                        {l.level} ·{' '}
                        {l.id === 'alphabet' || l.id === 'reading'
                          ? 'Звуки и чтение'
                          : 'Грамматика и лексика'}
                      </Badge>
                      <h3>{l.title}</h3>
                      <p className="muted">{l.subtitle}</p>
                      <div className="row fine muted">
                        <Clock3 size={14} />
                        {l.minutes} мин<span>·</span>
                        {state.progress[l.id]
                          ? `Лучший результат ${state.progress[l.id].bestScore}%`
                          : `${l.contexts.length} контекстов · ${l.contexts[0].exercises.length} заданий`}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
    </>
  );
}
