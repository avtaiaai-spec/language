import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  Sparkles,
  Globe,
  Headphones,
  Layers,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Button, Card, Progress, Badge } from '../components/ui';
import { contexts, levels } from '../data/curriculum';
import { placementLevel } from '../lib/learning';
import type { LevelId, ContextId } from '../types';
const goals = [
  'Общение',
  'Работа и бизнес',
  'Путешествия',
  'Фильмы и сериалы',
  'Книги',
  'Экзамены',
  'Для себя',
];
const placement = [
  ['I ___ a student.', ['am', 'is', 'are'], 'am'],
  ['She ___ coffee every morning.', ['drink', 'drinks', 'drinking'], 'drinks'],
  ['We ___ a film now.', ['watch', 'are watching', 'watched'], 'are watching'],
  ['Yesterday, I ___ to the park.', ['go', 'gone', 'went'], 'went'],
  ['I have never ___ to London.', ['be', 'been', 'was'], 'been'],
  ['If it rains, we ___ at home.', ['will stay', 'stayed', 'would stayed'], 'will stay'],
  ['If I had more time, I ___ travel.', ['will', 'would', 'had'], 'would'],
  [
    'The report ___ by Friday last week.',
    ['has finished', 'had been finished', 'has been finishing'],
    'had been finished',
  ],
  [
    'Rarely ___ such a remarkable performance.',
    ['I have seen', 'have I seen', 'I saw'],
    'have I seen',
  ],
  ['She insisted that he ___ present.', ['be', 'is', 'was'], 'be'],
  ['His argument was cogent. Cogent means…', ['convincing', 'confusing', 'brief'], 'convincing'],
  [
    'The evidence belies his claim. It…',
    ['supports it', 'contradicts it', 'repeats it'],
    'contradicts it',
  ],
] as const;
export function Onboarding() {
  const { state, update } = useStore();
  const [step, setStep] = useState(0);
  const [selectedGoals, setGoals] = useState(state.profile.goals);
  const [level, setLevel] = useState<LevelId>(state.profile.level);
  const [topics, setTopics] = useState<ContextId[]>(state.settings.contexts);
  const [goal, setGoal] = useState(state.settings.dailyGoal);
  const [test, setTest] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [choice, setChoice] = useState('');
  const finish = () =>
    update((s) => ({
      ...s,
      profile: { ...s.profile, onboarding: true, level, goals: selectedGoals },
      settings: { ...s.settings, contexts: topics, dailyGoal: goal },
    }));
  return (
    <div className="onboarding">
      <LinkBrand />
      <div className="onboarding-shell">
        <aside className="welcome-art">
          <span className="eyebrow">A SPACE TO BECOME</span>
          <h1>
            Новый язык.
            <br />
            Новый взгляд
            <br />
            <em>на мир.</em>
          </h1>
          <div className="book-art" aria-hidden="true">
            <div className="orb" />
            <BookOpen strokeWidth={0.8} size={150} />
            <span>
              THE ART OF
              <br />
              LEARNING
            </span>
          </div>
          <p>
            Ваш темп. Ваши интересы.
            <br />
            Ваш English Studio.
          </p>
        </aside>
        <div className="onboarding-content">
          <div className="row between">
            <Badge>ВАША ОТПРАВНАЯ ТОЧКА</Badge>
            <span className="muted">{step + 1} / 6</span>
          </div>
          <Progress value={((step + 1) / 6) * 100} label="Первоначальная настройка" />
          {step === 0 && (
            <>
              <h2>
                Welcome to
                <br />
                <em>English Studio.</em>
              </h2>
              <p className="lead muted">
                Личное пространство, где английский становится частью вашей жизни.
              </p>
              <div className="welcome-features">
                {[
                  [Layers, 'Понятная структура', 'От первых звуков до уверенной речи.'],
                  [Globe, 'Ваш контекст', 'Работа, путешествия, книги и кино.'],
                  [Headphones, 'Живая практика', 'Слушайте, пишите и закрепляйте.'],
                ].map(([Icon, title, desc]) => (
                  <div className="row" key={String(title)}>
                    {typeof Icon !== 'string' && <Icon size={23} />}
                    <div>
                      <strong>{String(title)}</strong>
                      <p className="muted">{String(desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="fine muted">
                Начните без регистрации. Прогресс сохранится в этом браузере.
              </p>
            </>
          )}
          {step === 1 && (
            <>
              <h2>
                Для чего вам
                <br />
                <em>английский?</em>
              </h2>
              <p className="muted">Выберите всё, что вам близко.</p>
              <div className="choice-grid">
                {goals.map((g) => (
                  <button
                    className={`choice ${selectedGoals.includes(g) ? 'selected' : ''}`}
                    aria-pressed={selectedGoals.includes(g)}
                    key={g}
                    onClick={() =>
                      setGoals((a) => (a.includes(g) ? a.filter((x) => x !== g) : [...a, g]))
                    }
                  >
                    {g}
                    {selectedGoals.includes(g) && <Check size={17} />}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>
                Найдём вашу
                <br />
                <em>точку старта.</em>
              </h2>
              {!test ? (
                <>
                  <p className="muted">
                    Выберите уровень или пройдите короткий ориентировочный тест.
                  </p>
                  <div className="choice-grid">
                    {levels.map((l) => (
                      <button
                        key={l.id}
                        className={`choice ${level === l.id ? 'selected' : ''}`}
                        aria-pressed={level === l.id}
                        onClick={() => setLevel(l.id)}
                      >
                        <b>{l.id}</b> {l.title}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setTest(true);
                      setAnswers([]);
                      setChoice('');
                    }}
                  >
                    <Sparkles size={17} /> Определить уровень · 12 вопросов
                  </Button>
                  <p className="fine muted">
                    Уроки уже доступны для A1–B1. B2–C2 — структура будущих курсов.
                  </p>
                </>
              ) : answers.length < placement.length ? (
                <Card className="placement">
                  <p className="eyebrow">ВОПРОС {answers.length + 1} / 12</p>
                  <h3>{placement[answers.length][0]}</h3>
                  {placement[answers.length][1].map((v) => (
                    <button
                      key={v}
                      className={`choice ${choice === v ? 'selected' : ''}`}
                      onClick={() => setChoice(v)}
                    >
                      {v}
                    </button>
                  ))}
                  <Button
                    disabled={!choice}
                    onClick={() => {
                      const next = [...answers, choice === placement[answers.length][2]];
                      setAnswers(next);
                      setChoice('');
                      if (next.length === placement.length) setLevel(placementLevel(next));
                    }}
                  >
                    Следующий вопрос
                  </Button>
                </Card>
              ) : (
                <Card>
                  <Badge>ОРИЕНТИРОВОЧНЫЙ РЕЗУЛЬТАТ</Badge>
                  <h3 className="large-number">{level}</h3>
                  <p>{answers.filter(Boolean).length} из 12 ответов верны.</p>
                  <p className="muted">
                    Короткий тест не заменяет CEFR-экзамен и не оценивает устную речь. Уровень можно
                    изменить в настройках.
                  </p>
                  <Button variant="secondary" onClick={() => setTest(false)}>
                    Выбрать уровень самостоятельно
                  </Button>
                </Card>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <h2>
                Учитесь на том,
                <br />
                <em>что интересно.</em>
              </h2>
              <p className="muted">Правило остаётся тем же. Примеры становятся вашими.</p>
              <div className="choice-grid">
                {contexts.map((c) => (
                  <button
                    key={c.id}
                    className={`choice ${topics.includes(c.id) ? 'selected' : ''}`}
                    aria-pressed={topics.includes(c.id)}
                    onClick={() =>
                      setTopics((a) =>
                        a.includes(c.id) ? a.filter((x) => x !== c.id) : [...a, c.id],
                      )
                    }
                  >
                    {c.title}
                    {topics.includes(c.id) && <Check size={17} />}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2>
                Немного времени.
                <br />
                <em>Каждый день.</em>
              </h2>
              <p className="muted">Выберите реалистичную цель. Регулярность важнее скорости.</p>
              <div className="choice-grid">
                {[10, 15, 20, 30].map((v) => (
                  <button
                    className={`choice goal-choice ${goal === v ? 'selected' : ''}`}
                    key={v}
                    aria-pressed={goal === v}
                    onClick={() => setGoal(v)}
                  >
                    <strong>{v}</strong>
                    <span>минут в день</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h2>
                Последние
                <br />
                <em>штрихи.</em>
              </h2>
              <label>
                Произношение
                <select
                  value={state.settings.accent}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      settings: { ...s.settings, accent: e.target.value as 'en-US' | 'en-GB' },
                    }))
                  }
                >
                  <option value="en-GB">Британское · English UK</option>
                  <option value="en-US">Американское · English US</option>
                </select>
              </label>
              <label>
                Оформление
                <select
                  value={state.settings.theme}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      settings: {
                        ...s.settings,
                        theme: e.target.value as 'dark' | 'light' | 'system',
                      },
                    }))
                  }
                >
                  <option value="dark">Тёмная библиотека</option>
                  <option value="light">Светлая библиотека</option>
                  <option value="system">Как на устройстве</option>
                </select>
              </label>
              <Card className="soft">
                <BookOpen size={24} />
                <p>
                  Ваш маршрут начинается с уровня <b>{level}</b>. По {goal} минут в день, в удобном
                  для вас темпе.
                </p>
              </Card>
            </>
          )}
          <div className="onboarding-actions">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={17} /> Назад
              </Button>
            ) : (
              <span />
            )}
            <Button
              disabled={
                (step === 3 && !topics.length) || (step === 2 && test && answers.length < 12)
              }
              onClick={() => (step === 5 ? finish() : setStep((s) => s + 1))}
            >
              {step === 0 ? 'Начать свой путь' : step === 5 ? 'Открыть студию' : 'Продолжить'}
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
      <p className="onboarding-footer">ENGLISH STUDIO · ВАШЕ МЕСТО ДЛЯ РОСТА</p>
    </div>
  );
}
function LinkBrand() {
  return (
    <div className="onboarding-brand">
      <BookOpen size={24} />
      <span>ENGLISH STUDIO</span>
    </div>
  );
}
