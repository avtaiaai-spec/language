import { Link } from 'react-router-dom';
import { Clock3, Target, BookOpen, Layers, ArrowUpRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { lessons, modules } from '../data/curriculum';
import { listeningMaterials } from '../data/listening';
import { getStats, weekActivity } from '../lib/learning';
import { Badge, Card, Empty, PageTitle, Progress } from '../components/ui';
export function Insights() {
  const { state } = useStore();
  const stats = getStats(state);
  const week = weekActivity(state.sessions);
  const weak = Object.entries(
    state.attempts
      .filter((a) => !a.correct)
      .reduce<Record<string, number>>(
        (r, a) => ({ ...r, [a.lessonId]: (r[a.lessonId] || 0) + 1 }),
        {},
      ),
  ).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <PageTitle
        eyebrow="SMALL STEPS, REAL PROGRESS"
        title="Learning Insights"
        description="Ваш путь в цифрах. Только реальные занятия, ответы и открытия."
      />
      <div className="stats-grid">
        {[
          { Icon: BookOpen, n: stats.completed, label: 'уроков завершено' },
          { Icon: Target, n: `${stats.accuracy}%`, label: `точность · ${stats.total} ответов` },
          { Icon: Clock3, n: Math.floor(stats.seconds / 60), label: 'минут занятий' },
          { Icon: Layers, n: stats.learned, label: `слов изучено · ${stats.due} на повторении` },
        ].map((s) => (
          <Card key={s.label}>
            <s.Icon size={22} />
            <strong>{s.n}</strong>
            <span className="muted">{s.label}</span>
          </Card>
        ))}
      </div>
      <div className="insights-grid">
        <Card>
          <div className="section-heading">
            <h2>Ритм вашей недели</h2>
            <Badge>ПОСЛЕДНИЕ 7 ДНЕЙ</Badge>
          </div>
          <div className="activity-chart">
            {week.map((d) => (
              <div key={d.date.toISOString()}>
                <span className="fine muted">{Math.floor(d.seconds / 60)} мин</span>
                <div className="activity-track">
                  <span
                    style={{
                      height: d.seconds
                        ? `${Math.max(3, (d.seconds / Math.max(60, ...week.map((x) => x.seconds))) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
                <small>
                  {d.date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}
                </small>
              </div>
            ))}
          </div>
          {!state.sessions.length && (
            <p className="muted fine">
              Завершите первое занятие — и здесь появится ваша активность.
            </p>
          )}
        </Card>
        <Card>
          <h2>Профиль навыков</h2>
          {(['Vocabulary', 'Grammar', 'Listening', 'Writing'] as const).map((skill) => {
            const attempts = state.attempts.filter((a) => a.skill === skill);
            const pct = attempts.length
              ? (attempts.filter((a) => a.correct).length / attempts.length) * 100
              : 0;
            return (
              <div className="skill" key={skill}>
                <div className="row between">
                  <span>{skill}</span>
                  <span className="muted fine">
                    {attempts.length
                      ? `${Math.round(pct)}% · ${attempts.length} ответов`
                      : 'Нет ответов'}
                  </span>
                </div>
                <Progress label={skill} value={pct} />
              </div>
            );
          })}
          <p className="fine muted">
            Pronunciation: озвучка доступна, оценка произношения не выполняется.
          </p>
        </Card>
      </div>
      <div className="section-heading">
        <h2>Ваш учебный маршрут</h2>
        <Badge>{state.profile.level}</Badge>
      </div>
      <div className="module-progress-grid">
        {modules
          .filter((m) => m.level === state.profile.level)
          .map((m) => {
            const all = lessons.filter((l) => l.moduleId === m.id);
            const complete = all.filter((l) => state.progress[l.id]).length;
            return (
              <Card key={m.id}>
                <h3>{m.title}</h3>
                <p className="muted fine">
                  {all.length
                    ? `${complete} / ${all.length} уроков завершено`
                    : 'Материалы планируются'}
                </p>
                <Progress label={m.title} value={all.length ? (complete / all.length) * 100 : 0} />
              </Card>
            );
          })}
      </div>
      <div className="section-heading">
        <h2>Мои слабые места</h2>
      </div>
      {weak.length ? (
        <div className="lesson-grid">
          {weak.map(([id, count]) => (
            <Link
              key={id}
              className="lesson-card"
              to={
                lessons.some((l) => l.id === id)
                  ? `/lesson/${id}`
                  : listeningMaterials.some((l) => l.id === id)
                    ? `/listening/${id}`
                    : '/practice?mode=mixed'
              }
            >
              <Badge>{count} ошибок в истории</Badge>
              <h3>
                {lessons.find((l) => l.id === id)?.title ||
                  listeningMaterials.find((l) => l.id === id)?.title ||
                  'Смешанная практика'}
              </h3>
              <p className="muted">Вернитесь к правилу и попробуйте снова.</p>
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="Чистая страница">
          <p>Ошибки — полезная часть обучения. Когда они появятся, здесь будут рекомендации.</p>
        </Empty>
      )}
      <div className="section-heading">
        <h2>История ошибок</h2>
        <span className="fine muted">Последние 30</span>
      </div>
      {state.attempts.some((a) => !a.correct) ? (
        <Card className="error-history">
          {state.attempts
            .filter((a) => !a.correct)
            .slice(-30)
            .reverse()
            .map((a) => (
              <div key={a.id}>
                <div className="row between">
                  <Badge>{a.skill}</Badge>
                  <small className="muted">{new Date(a.at).toLocaleDateString('ru-RU')}</small>
                </div>
                <p>{a.prompt}</p>
                <p className="muted">Ваш ответ: {a.answer}</p>
                <p className="success-text">Верный вариант: {a.expected}</p>
              </div>
            ))}
        </Card>
      ) : (
        <p className="muted">Здесь пока пусто.</p>
      )}
      <div className="section-heading">
        <h2>Результаты аудирования</h2>
      </div>
      {state.listeningAttempts.length ? (
        <div className="module-progress-grid">
          {state.listeningAttempts.map((a) => (
            <Link className="card" key={a.sessionId} to={`/result/${a.sessionId}`}>
              <h3>{listeningMaterials.find((m) => m.id === a.materialId)?.title}</h3>
              <p className="muted">
                {a.correct} / {a.total} · {new Date(a.at).toLocaleDateString('ru-RU')}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted">Пройдите задания к одному из диалогов в Listening Studio.</p>
      )}
    </>
  );
}
