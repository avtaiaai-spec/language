import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  RotateCcw,
  X,
  Trophy,
  Clock3,
} from 'lucide-react';
import { lessons } from '../data/curriculum';
import { listeningMaterials } from '../data/listening';
import { useStore } from '../lib/store';
import { checkAnswer, answerPunctuationNote, newReview, sessionScore } from '../lib/learning';
import { createSession, finishSession } from '../lib/sessions';
import { AudioButton, Badge, Button, Card, Empty, Modal, Progress } from '../components/ui';
import type { ExerciseAttempt } from '../types';
const typeLabels = {
  'en-ru': 'Перевод слова',
  'ru-en': 'Обратный перевод',
  translation: 'Перевод предложения',
  order: 'Соберите предложение',
  blank: 'Вставьте пропуск',
  choice: 'Выбор ответа',
  dictation: 'Диктант',
  mistake: 'Исправьте ошибку',
};
export function Practice() {
  const { state, update } = useStore();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode');
  const navigate = useNavigate();
  const [replace, setReplace] = useState(false);
  const started = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const begin = () => {
    const context = state.settings.contexts[0];
    const pool = lessons.filter((l) => l.level === state.profile.level);
    const source = pool.length ? pool : lessons.filter((l) => l.level === 'A1');
    let exercises = source.flatMap((l) => l.contexts.find((p) => p.id === context)!.exercises);
    if (mode === 'grammar') exercises = exercises.filter((e) => e.skill === 'Grammar');
    if (mode === 'translation')
      exercises = exercises.filter((e) => e.type === 'translation' || e.type === 'ru-en');
    const mixed =
      mode === 'mixed'
        ? exercises.filter((_, i) => i % 2 === 0).slice(0, 12)
        : exercises.slice(0, 12);
    update((s) => ({
      ...s,
      active: createSession(
        'mixed',
        context,
        mixed.length ? mixed : exercises.slice(0, 8),
        'mixed',
      ),
    }));
    setParams({}, { replace: true });
    setReplace(false);
  };
  useEffect(() => {
    if (!mode) {
      started.current = null;
      return;
    }
    if (started.current === mode) return;
    started.current = mode;
    if (state.active) setReplace(true);
    else begin();
  }, [mode]);
  const active = state.active;
  // Count visible foreground study time. Cap delayed timer ticks after device sleep.
  useEffect(() => {
    if (!active) return;
    let previous = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = Math.min(5, (now - previous) / 1000);
      previous = now;
      if (document.visibilityState === 'visible')
        update((s) =>
          s.active ? { ...s, active: { ...s.active, elapsed: s.active.elapsed + delta } } : s,
        );
    }, 1000);
    return () => clearInterval(timer);
  }, [active?.id, update]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [active?.index]);
  if (!active)
    return (
      <Empty title="Начнём новую главу?">
        <p>Выберите урок или короткую тренировку. Завершённые занятия доступны в статистике.</p>
        <Link className="btn btn-primary" to="/learn">
          Выбрать урок
        </Link>
        <Link className="btn btn-secondary" to="/practice?mode=mixed">
          Смешанная тренировка
        </Link>
      </Empty>
    );
  const ex = active.exercises[active.index];
  const feedback = active.feedback;
  const answer =
    ex.type === 'order' ? active.selected.map((i) => ex.tokens![i]).join(' ') : active.draft;
  const patch = (change: Partial<typeof active>) =>
    update((s) => (s.active ? { ...s, active: { ...s.active, ...change } } : s));
  const check = () => {
    if (!answer.trim() || feedback) return;
    const attempt: ExerciseAttempt = {
      id: crypto.randomUUID(),
      sessionId: active.id,
      exerciseId: ex.id,
      lessonId:
        active.lessonId === 'mixed'
          ? lessons.find((l) => l.contexts.some((c) => c.exercises.some((e) => e.id === ex.id)))
              ?.id || 'mixed'
          : active.lessonId,
      context: active.context,
      prompt: ex.prompt,
      answer,
      expected: ex.answers[0],
      correct: checkAnswer(answer, ex.answers),
      hints: active.hintCount,
      at: Date.now(),
      skill: ex.skill,
    };
    update((s) =>
      s.active
        ? {
            ...s,
            attempts: [...s.attempts, attempt],
            active: { ...s.active, attempts: [...s.active.attempts, attempt], feedback: attempt },
          }
        : s,
    );
  };
  const next = () => {
    if (!feedback) return;
    if (active.index + 1 === active.exercises.length) {
      update((s) => finishSession(s, active));
      navigate(`/result/${active.id}`, { replace: true });
    } else
      patch({
        index: active.index + 1,
        draft: '',
        selected: [],
        hintCount: 0,
        feedback: undefined,
      });
  };
  return (
    <>
      <div className="exercise-top row between">
        <Link
          className="back-link"
          to={
            active.kind === 'lesson'
              ? `/lesson/${active.lessonId}`
              : active.kind === 'listening'
                ? `/listening/${active.lessonId}`
                : '/'
          }
        >
          <ArrowLeft size={17} /> Сохранить и выйти
        </Link>
        <Badge>
          {active.kind === 'mixed'
            ? 'Смешанная практика'
            : active.kind === 'listening'
              ? 'Аудирование'
              : lessons.find((l) => l.id === active.lessonId)?.title}
        </Badge>
      </div>
      <div className="exercise-shell">
        <div className="row between fine muted">
          <span>
            УПРАЖНЕНИЕ {active.index + 1} ИЗ {active.exercises.length}
          </span>
          <span>
            <Clock3 size={14} /> {Math.floor(active.elapsed / 60)} мин
          </span>
        </div>
        <Progress
          value={(active.index / active.exercises.length) * 100}
          label="Прогресс упражнений"
        />
        <Card className="exercise-card" key={ex.id}>
          <Badge>{typeLabels[ex.type]}</Badge>
          <h1>{ex.prompt}</h1>
          {ex.audio && <AudioButton text={ex.audio} label="Прослушать задание" />}
          {!ex.audio && ex.type === 'en-ru' && (
            <AudioButton text={ex.prompt.replace('Переведите слово: ', '')} />
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              feedback ? next() : check();
            }}
          >
            {ex.type === 'choice' ? (
              <div className="exercise-options">
                {ex.options?.map((option, i) => (
                  <button
                    type="button"
                    key={option}
                    disabled={!!feedback}
                    aria-pressed={active.draft === option}
                    className={`exercise-option ${active.draft === option ? 'selected' : ''}`}
                    onClick={() => patch({ draft: option })}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option}
                  </button>
                ))}
              </div>
            ) : ex.type === 'order' ? (
              <>
                <div className="sentence-builder" aria-label="Ваше предложение">
                  {active.selected.length ? (
                    active.selected.map((i, j) => (
                      <button
                        type="button"
                        disabled={!!feedback}
                        key={i}
                        className="word-token"
                        onClick={() =>
                          patch({ selected: active.selected.filter((_, k) => k !== j) })
                        }
                      >
                        {ex.tokens![i]}
                        <X size={12} />
                      </button>
                    ))
                  ) : (
                    <span className="muted">Нажимайте на слова в правильном порядке…</span>
                  )}
                </div>
                <div className="token-pool">
                  {ex.tokens?.map((word, i) => (
                    <button
                      className="word-token"
                      type="button"
                      key={i}
                      disabled={!!feedback || active.selected.includes(i)}
                      onClick={() => patch({ selected: [...active.selected, i] })}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <label className="answer-label">
                Ваш ответ
                <textarea
                  ref={inputRef}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  rows={3}
                  disabled={!!feedback}
                  value={active.draft}
                  onChange={(e) => patch({ draft: e.target.value })}
                  placeholder={
                    ex.type === 'en-ru'
                      ? 'Введите перевод на русском…'
                      : 'Напишите ответ на английском…'
                  }
                />
              </label>
            )}
            {!feedback && (
              <div className="hint-zone">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={active.hintCount >= ex.hints.length}
                  onClick={() => patch({ hintCount: active.hintCount + 1 })}
                >
                  <Lightbulb size={17} /> Подсказка {active.hintCount}/{ex.hints.length}
                </Button>
                {ex.hints.slice(0, active.hintCount).map((h, i) => (
                  <p className="hint" key={i}>
                    {h}
                  </p>
                ))}
                {active.hintCount > 0 && (
                  <small className="muted">Каждая подсказка учитывается в итоговом балле.</small>
                )}
              </div>
            )}
            {feedback && (
              <div
                role="status"
                className={`answer-feedback ${feedback.correct ? 'correct' : 'incorrect'}`}
              >
                <h3>
                  {feedback.correct ? <Check size={21} /> : <RotateCcw size={21} />}{' '}
                  {feedback.correct ? 'Верно. Отличная работа!' : 'Ещё один шаг к пониманию.'}
                </h3>
                {!feedback.correct && (
                  <p>
                    Правильный ответ: <strong>{ex.answers[0]}</strong>
                  </p>
                )}
                <p>{ex.explanation}</p>
                {feedback.correct && answerPunctuationNote(feedback.answer, ex.answers) && (
                  <p className="punctuation-note">
                    {answerPunctuationNote(feedback.answer, ex.answers)}
                  </p>
                )}
                {ex.type !== 'en-ru' && <AudioButton text={ex.answers[0]} />}
              </div>
            )}
            <div className="exercise-actions">
              <span className="fine muted">
                {feedback
                  ? 'Ответ сохранён'
                  : ex.type === 'translation'
                    ? 'Принимаются подготовленные варианты перевода'
                    : 'В вашем темпе. Без спешки.'}
              </span>
              <Button type="submit" disabled={!feedback && !answer.trim()}>
                {feedback
                  ? active.index === active.exercises.length - 1
                    ? 'Завершить'
                    : 'Следующее'
                  : 'Проверить'}
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
      {replace && (
        <Modal
          title="Продолжить или начать заново?"
          onClose={() => {
            setReplace(false);
            setParams({}, { replace: true });
          }}
        >
          <p>
            У вас есть сохранённое занятие. Новая тренировка заменит его; уже отправленные ответы
            останутся в истории.
          </p>
          <div className="row wrap">
            <Button
              onClick={() => {
                setReplace(false);
                setParams({}, { replace: true });
              }}
            >
              Продолжить сохранённое
            </Button>
            <Button variant="secondary" onClick={begin}>
              Новая тренировка
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function ResultPage() {
  const { id } = useParams();
  const { state, update, notify } = useStore();
  const navigate = useNavigate();
  const session = state.sessions.find((s) => s.id === id);
  if (!session)
    return (
      <Empty title="Результат не найден">
        <Link to="/insights">Открыть прогресс</Link>
      </Empty>
    );
  const rows = state.attempts.filter((a) => a.sessionId === id);
  const wrong = rows.filter((a) => !a.correct);
  const lesson = lessons.find((l) => l.id === session.lessonId);
  const material = listeningMaterials.find((l) => l.id === session.lessonId);
  const pool =
    lesson?.contexts.flatMap((c) => c.exercises) ||
    material?.exercises ||
    lessons.flatMap((l) => l.contexts.flatMap((c) => c.exercises));
  const errors = pool.filter((e) => wrong.some((a) => a.exerciseId === e.id));
  const nextLesson = lesson ? lessons[lessons.findIndex((l) => l.id === lesson.id) + 1] : null;
  const words = lesson?.contexts.find((c) => c.id === rows[0]?.context)?.words || [];
  const added = words.filter((w) =>
    state.vocabulary.some((v) => v.en.toLowerCase() === w.en.toLowerCase()),
  );
  return (
    <div className="result-page">
      <div className="result-emblem">
        <Trophy size={38} strokeWidth={1.3} />
      </div>
      <p className="eyebrow">CHAPTER COMPLETE</p>
      <h1>Ещё один шаг вперёд.</h1>
      <p className="muted">
        {lesson?.title || material?.title || 'Смешанная практика'} · результат сохранён
      </p>
      <Card className="result-score">
        <strong>{session.total ? Math.round((session.correct / session.total) * 100) : 0}%</strong>
        <p>правильных ответов</p>
        <Progress
          value={session.total ? (session.correct / session.total) * 100 : 0}
          label="Точность"
        />
        <div className="result-metrics">
          <div>
            <b>
              {session.correct} / {session.total}
            </b>
            <span>верных ответов</span>
          </div>
          <div>
            <b>{session.total - session.correct}</b>
            <span>ошибок</span>
          </div>
          <div>
            <b>
              {Math.floor(session.seconds / 60)}:
              {String(Math.floor(session.seconds % 60)).padStart(2, '0')}
            </b>
            <span>время занятия</span>
          </div>
        </div>
        <p className="fine muted">
          Итоговый балл с учётом {session.hintCount} подсказок: <b>{sessionScore(session)} / 100</b>
        </p>
      </Card>
      {wrong.length > 0 && (
        <Card className="result-errors">
          <h3>Темы для повторения</h3>
          {wrong.map((a) => (
            <div key={a.id}>
              <p>{a.prompt}</p>
              <span className="muted">Ваш ответ: {a.answer}</span>
              <p className="success-text">{a.expected}</p>
            </div>
          ))}
        </Card>
      )}
      {words.length > 0 && (
        <Card>
          <h3>Слова из вашего контекста</h3>
          <p className="muted">
            {words.map((w) => w.en).join(', ')} · {added.length} уже в словаре
          </p>
          <Button
            variant="secondary"
            disabled={added.length === words.length}
            onClick={() => {
              update((s) => ({
                ...s,
                vocabulary: [
                  ...s.vocabulary,
                  ...words
                    .filter(
                      (w) => !s.vocabulary.some((v) => v.en.toLowerCase() === w.en.toLowerCase()),
                    )
                    .map((w) => ({
                      ...w,
                      addedAt: Date.now(),
                      favorite: false,
                      collectionIds: [],
                      review: newReview(),
                    })),
                ],
              }));
              notify('Слова добавлены в словарь.');
            }}
          >
            Добавить новые слова
          </Button>
        </Card>
      )}
      <div className="result-actions">
        {errors.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              update((s) => ({
                ...s,
                active: createSession(
                  session.lessonId,
                  rows[0]?.context || 'everyday',
                  errors,
                  'mixed',
                ),
              }));
              navigate('/practice');
            }}
          >
            <RotateCcw size={17} /> Повторить ошибки
          </Button>
        )}
        {nextLesson && (
          <Link className="btn btn-primary" to={`/lesson/${nextLesson.id}`}>
            Следующий урок
            <ArrowRight size={17} />
          </Link>
        )}
        <Link className="btn btn-secondary" to="/vocabulary?review=1">
          Повторить слова
        </Link>
        <Link className="text-link" to="/learn">
          Вернуться к курсу
        </Link>
      </div>
    </div>
  );
}
