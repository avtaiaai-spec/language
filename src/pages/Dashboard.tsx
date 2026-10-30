import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Headphones,
  Layers,
  PenLine,
  Sparkles,
  Target,
  Check,
  CalendarDays,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { levels, lessons, contexts } from '../data/curriculum';
import { dayKey, getStats, weekActivity } from '../lib/learning';
import { Badge, Button, Card, PageTitle, Progress, TextLink } from '../components/ui';
export function Dashboard() {
  const { state } = useStore();
  const stats = getStats(state);
  const level = levels.find((l) => l.id === state.profile.level)!;
  const available = lessons.filter((l) => l.level === level.id);
  const lesson =
    lessons.find((l) => l.id === state.active?.lessonId) ||
    lessons.find((l) => l.id === state.lastLesson) ||
    available.find((l) => !state.progress[l.id]) ||
    available[0] ||
    lessons[0];
  const completed = available.filter((l) => state.progress[l.id]).length;
  const pct = available.length ? (completed / available.length) * 100 : 0;
  const week = weekActivity(state.sessions);
  const weekStart = new Date(week[0].date).setHours(0, 0, 0, 0);
  const weekLearned = state.vocabulary.filter(
    (w) =>
      w.review.repetitions >= 5 && w.review.history.some((h) => h.at >= weekStart && h.quality > 0),
  ).length;
  const weekSeconds = week.reduce((n, d) => n + d.seconds, 0);
  const today = state.sessions.filter((s) => dayKey(s.at) === dayKey(Date.now()));
  const todaySeconds = today.reduce((n, s) => n + s.seconds, 0);
  const context = contexts.find((c) => c.id === state.settings.contexts[0])!;
  const errors = state.attempts.filter((a) => !a.correct);
  const weak = [...new Set(errors.map((a) => a.lessonId))]
    .map((id) => lessons.find((l) => l.id === id))
    .filter(Boolean);
  return (
    <>
      <PageTitle
        eyebrow="YOUR PERSONAL LEARNING SPACE"
        title={
          state.profile.name
            ? `Рады видеть вас, ${state.profile.name}.`
            : 'Хороший день, чтобы начать.'
        }
        description="Откройте для себя английский. Одну идею, одно слово, один шаг за раз."
        action={
          <span className="date-label">
            <CalendarDays size={16} />
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </span>
        }
      />
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Card className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="tiny-line" /> ВАША СЛЕДУЮЩАЯ ГЛАВА
              </p>
              <h2>
                Большой мир
                <br />
                начинается с<br />
                <em>маленького шага.</em>
              </h2>
              <p>
                Английский в вашем ритме.
                <br />И в контексте того, что вы любите.
              </p>
              <Link
                className="btn btn-primary"
                to={state.active ? '/practice' : `/lesson/${lesson.id}`}
              >
                {state.active ? 'Продолжить занятие' : 'Начать обучение'}
                <ArrowRight size={18} />
              </Link>
              <span className="hero-note">
                <Clock3 size={14} /> Всего {state.settings.dailyGoal} минут для себя
              </span>
            </div>
            <div className="hero-illustration" aria-hidden="true">
              <div className="hero-circle" />
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="illustrated-book book-back" />
              <div className="illustrated-book book-front">
                <span>
                  ENGLISH
                  <br />
                  STUDIO
                </span>
                <span className="book-line" />
                <BookOpen size={53} strokeWidth={0.8} />
                <small>
                  THE WORLD
                  <br />
                  IS YOUR CLASSROOM
                </small>
              </div>
              <span className="hero-star star-one">✦</span>
              <span className="hero-star star-two">✧</span>
              <span className="floating-note">a new perspective</span>
            </div>
          </Card>
          <div className="section-heading">
            <div>
              <p className="eyebrow">KEEP THE MOMENTUM</p>
              <h2>{state.lastLesson ? 'Продолжить обучение' : 'Ваш первый урок'}</h2>
            </div>
            <TextLink to="/learn">Все уроки</TextLink>
          </div>
          <Card className="continue-card">
            <div className="lesson-symbol">
              <BookOpen size={28} />
            </div>
            <div className="continue-info">
              <div className="row">
                <Badge>{lesson.level}</Badge>
                <span className="fine muted">
                  {state.progress[lesson.id]
                    ? 'Завершён · можно повторить'
                    : state.active
                      ? 'В процессе'
                      : 'Готовы начать'}
                </span>
              </div>
              <h3>{lesson.title}</h3>
              <p className="muted">{lesson.subtitle}</p>
              <div className="row fine muted">
                <Clock3 size={14} />
                {lesson.minutes} минут <span>·</span>
                {context.title}
              </div>
            </div>
            <Link
              className="round-link"
              aria-label="Открыть урок"
              to={state.active ? '/practice' : `/lesson/${lesson.id}`}
            >
              <ArrowUpRight size={23} />
            </Link>
          </Card>
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE EVERY DAY</p>
              <h2>План на сегодня</h2>
            </div>
            <span className="muted fine">
              {Math.min(100, Math.round((todaySeconds / 60 / state.settings.dailyGoal) * 100))}%
              цели
            </span>
          </div>
          <div className="plan-grid">
            {[
              {
                n: '01',
                title: 'Разобраться в правиле',
                meta: 'Теория · ваш следующий урок',
                Icon: BookOpen,
                to: `/lesson/${lesson.id}`,
                done: today.some((s) => s.kind === 'lesson'),
              },
              {
                n: '02',
                title: 'Вспомнить слова',
                meta: `${stats.due} слов на повторении`,
                Icon: Layers,
                to: '/vocabulary?review=1',
                done: state.vocabulary.some((w) =>
                  w.review.history.some((h) => dayKey(h.at) === dayKey(Date.now())),
                ),
              },
              {
                n: '03',
                title: 'Услышать и понять',
                meta: 'Короткий учебный диалог',
                Icon: Headphones,
                to: '/listening',
                done: today.some((s) => s.kind === 'listening'),
              },
            ].map((p) => (
              <Link className="plan-card" to={p.to} key={p.n}>
                <div className="row between">
                  <p.Icon size={22} />
                  {p.done ? (
                    <Check size={17} className="success-text" />
                  ) : (
                    <span className="plan-number">{p.n}</span>
                  )}
                </div>
                <h3>{p.title}</h3>
                <p className="muted fine">{p.meta}</p>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR FLOW</p>
              <h2>Быстрая практика</h2>
            </div>
          </div>
          <div className="quick-grid">
            {[
              { Icon: PenLine, title: 'Перевод', to: '/practice?mode=translation' },
              { Icon: Sparkles, title: 'Грамматика', to: '/practice?mode=grammar' },
              { Icon: Layers, title: 'Карточки', to: '/vocabulary?review=1' },
              { Icon: Headphones, title: 'Аудирование', to: '/listening' },
            ].map((p) => (
              <Link key={p.title} to={p.to}>
                <p.Icon size={21} />
                <span>{p.title}</span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
          <Card className="mixed-card">
            <div className="row">
              <span className="mixed-icon">
                <Sparkles size={23} />
              </span>
              <div>
                <h3>Четверть часа — только для вас</h3>
                <p className="muted">Слова, грамматика и письмо в одной тренировке.</p>
              </div>
            </div>
            <Link className="btn btn-secondary" to="/practice?mode=mixed">
              Начать занятие на 15 минут
              <ArrowRight size={17} />
            </Link>
            <small className="muted">
              Ориентировочно 15 минут; фактическое время зависит от вашего темпа.
            </small>
          </Card>
        </div>
        <aside className="dashboard-aside">
          <Card className="level-card">
            <div className="row between">
              <p className="eyebrow">ВАШ УРОВЕНЬ</p>
              <Target size={18} />
            </div>
            <div className="level-display">
              <strong>{level.id}</strong>
              <div>
                <h3>{level.title}</h3>
                <span className="muted fine">
                  {level.planned ? 'Материалы планируются' : 'Уверенный старт'}
                </span>
              </div>
            </div>
            <Progress value={pct} label="Прогресс уровня" />
            <div className="row between fine">
              <span className="muted">
                {completed} из {available.length} уроков
              </span>
              <b>{Math.round(pct)}%</b>
            </div>
            <TextLink to="/learn">Посмотреть мой маршрут</TextLink>
          </Card>
          <Card className="review-card">
            <div className="row between">
              <span className="small-icon">
                <Layers size={21} />
              </span>
              <Badge>VOCABULARY</Badge>
            </div>
            <h3>
              Дайте словам
              <br />
              остаться с вами.
            </h3>
            <p className="muted">
              {stats.due
                ? `${stats.due} слов ждут повторения. Закрепим их в памяти?`
                : 'Все карточки повторены. Возвращайтесь, когда придёт время.'}
            </p>
            <Link className="btn btn-secondary" to="/vocabulary?review=1">
              Повторить слова
              <ArrowRight size={16} />
            </Link>
          </Card>
          <Card className="week-card">
            <div className="row between">
              <h3>Ваша неделя</h3>
              <ChartIcon />
            </div>
            <div className="week-chart">
              {week.map((d) => (
                <div key={d.date.toISOString()}>
                  <div className="bar-track">
                    <span
                      style={{
                        height: d.seconds
                          ? `${Math.max(6, (d.seconds / Math.max(60, ...week.map((x) => x.seconds))) * 100)}%`
                          : '0%',
                      }}
                      title={`${Math.round(d.seconds / 60)} мин`}
                    />
                  </div>
                  <small>{d.date.toLocaleDateString('ru-RU', { weekday: 'short' })}</small>
                </div>
              ))}
            </div>
            <div className="week-totals">
              <div>
                <strong>
                  {Math.floor(weekSeconds / 60)}
                  <small> мин</small>
                </strong>
                <span>время занятий</span>
              </div>
              <div>
                <strong>{state.attempts.filter((a) => a.at >= weekStart).length}</strong>
                <span>упражнений</span>
              </div>
              <div>
                <strong>{weekLearned}</strong>
                <span>изучено слов</span>
              </div>
            </div>
            <TextLink to="/insights">Вся статистика</TextLink>
          </Card>
          <div className="quote-card">
            <span>“</span>
            <blockquote>
              A different language is
              <br />a different vision of life.
            </blockquote>
            <p>FEDERICO FELLINI</p>
          </div>
        </aside>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURATED FOR YOU</p>
          <h2>{weak.length ? 'Стоит вернуться к этим темам' : 'Учитесь через то, что любите'}</h2>
        </div>
        <TextLink to={weak.length ? '/insights' : '/settings'}>
          {weak.length ? 'Мои ошибки' : 'Мои интересы'}
        </TextLink>
      </div>
      <div className="interest-grid">
        {weak.length
          ? weak.slice(0, 3).map(
              (l) =>
                l && (
                  <Link className="interest-card" key={l.id} to={`/lesson/${l.id}`}>
                    <Badge>{l.level} · Повторение</Badge>
                    <h3>{l.title}</h3>
                    <p className="muted">Разберите правило и попробуйте ещё раз.</p>
                    <ArrowUpRight size={22} />
                  </Link>
                ),
            )
          : contexts.slice(0, 3).map((c) => (
              <Link
                className={`interest-card interest-${c.id}`}
                key={c.id}
                to={`/lesson/${lesson.id}?context=${c.id}`}
              >
                <span className="interest-num">{c.mark}</span>
                <p className="eyebrow">{c.en}</p>
                <h3>
                  {c.id === 'business'
                    ? 'Английский для ваших идей'
                    : c.id === 'movies'
                      ? 'Понимать больше, чем сюжет'
                      : 'Открывать новые горизонты'}
                </h3>
                <span className="muted fine">Уроки в контексте · {c.title}</span>
                <ArrowUpRight size={22} />
              </Link>
            ))}
      </div>
    </>
  );
}
function ChartIcon() {
  return <span className="muted">↗</span>;
}
