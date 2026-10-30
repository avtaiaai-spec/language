import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, BookOpen, Plus, Eye, EyeOff, Info } from 'lucide-react';
import { contexts, lessons } from '../data/curriculum';
import { useStore } from '../lib/store';
import { newReview } from '../lib/learning';
import { createSession } from '../lib/sessions';
import { AudioButton, Badge, Button, Card, Empty, Modal, Tabs } from '../components/ui';
import type { ContextId } from '../types';
export function LessonPage() {
  const { id } = useParams();
  const lesson = lessons.find((l) => l.id === id);
  const { state, update, notify } = useStore();
  const [params] = useSearchParams();
  const requested = params.get('context');
  const [context, setContext] = useState<ContextId>(
    contexts.some((c) => c.id === requested)
      ? (requested as ContextId)
      : state.settings.contexts[0],
  );
  const [translations, setTranslations] = useState(true);
  const [extra, setExtra] = useState(false);
  const [replace, setReplace] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (lesson) update((s) => ({ ...s, lastLesson: lesson.id }));
  }, [lesson?.id, update]);
  if (!lesson)
    return (
      <Empty title="Урок не найден">
        <Link to="/learn">Вернуться в каталог</Link>
      </Empty>
    );
  const pack = lesson.contexts.find((p) => p.id === context) || lesson.contexts[0];
  const start = () => {
    update((s) => ({
      ...s,
      active: createSession(lesson.id, pack.id, pack.exercises),
      lastLesson: lesson.id,
    }));
    navigate('/practice');
  };
  const addWord = (word: (typeof pack.words)[number]) => {
    if (state.vocabulary.some((w) => w.en.toLowerCase() === word.en.toLowerCase())) {
      notify('Это слово уже в вашем словаре.');
      return;
    }
    update((s) => ({
      ...s,
      vocabulary: [
        ...s.vocabulary,
        { ...word, addedAt: Date.now(), favorite: false, collectionIds: [], review: newReview() },
      ],
    }));
    notify(`Слово «${word.en}» добавлено в словарь.`);
  };
  return (
    <>
      <Link to="/learn" className="back-link">
        <ArrowLeft size={16} /> К учебному маршруту
      </Link>
      <div className="lesson-header">
        <div className="row">
          <Badge>{lesson.level}</Badge>
          <span className="fine muted">
            <Clock3 size={14} /> {lesson.minutes} минут
          </span>
          <Badge>{state.progress[lesson.id] ? 'Пройден' : 'Теория и практика'}</Badge>
        </div>
        <h1>{lesson.title}</h1>
        <p className="lead muted">{lesson.subtitle}</p>
      </div>
      <div className="lesson-layout">
        <div>
          <Card className="context-card">
            <div className="row">
              <span className="small-icon">
                <BookOpen size={20} />
              </span>
              <div>
                <h3>Сделайте урок своим</h3>
                <p className="muted fine">Выберите мир, в котором будут жить ваши примеры.</p>
              </div>
            </div>
            <Tabs
              label="Контекст урока"
              items={contexts}
              value={context}
              onChange={(v) => {
                setContext(v);
                setExtra(false);
              }}
            />
          </Card>
          <article className="theory">
            <p className="eyebrow">01 / ПОНИМАЕМ ПРАВИЛО</p>
            {lesson.sections.map((s, i) => (
              <section id={`section-${i}`} key={s.title}>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
                {i === 0 && (
                  <div className="formula">
                    <span>FORMULA</span>
                    <strong>{lesson.formula}</strong>
                    <AudioButton small text={lesson.formula} />
                  </div>
                )}
              </section>
            ))}
            <section id="examples">
              <div className="row between">
                <h2>А теперь — в вашем контексте</h2>
                <Button
                  variant="ghost"
                  onClick={() => setTranslations((v) => !v)}
                  aria-label={translations ? 'Скрыть перевод' : 'Показать перевод'}
                >
                  {translations ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <p className="eyebrow">{contexts.find((c) => c.id === pack.id)?.en}</p>
              {pack.examples.slice(0, extra ? 2 : 1).map((e, i) => (
                <div className="example" key={`${pack.id}-${i}`}>
                  <div className="row between">
                    <p lang="en">{e.en}</p>
                    <AudioButton text={e.en} small />
                  </div>
                  {translations && <p className="muted">{e.ru}</p>}
                </div>
              ))}
              <Button variant="ghost" onClick={() => setExtra((v) => !v)}>
                {extra ? 'Скрыть дополнительный пример' : 'Ещё один пример'}
                <ArrowRight size={16} />
              </Button>
            </section>
            <section id="mistakes" className="rule-warning">
              <Info size={23} />
              <div>
                <h3>Обратите внимание</h3>
                <p>{lesson.mistake}</p>
              </div>
            </section>
            <section id="words">
              <h2>Слово этой главы</h2>
              {pack.words.map((w) => (
                <Card key={w.id} className="lesson-word">
                  <div>
                    <div className="row">
                      <h3>{w.en}</h3>
                      <AudioButton text={w.en} small />
                    </div>
                    <span className="ipa muted">{w.ipa}</span>
                    <p>
                      {w.ru} <span className="muted fine">· {w.part}</span>
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => addWord(w)}>
                    <Plus size={16} /> В словарь
                  </Button>
                </Card>
              ))}
            </section>
          </article>
          <Card className="practice-callout">
            <div>
              <p className="eyebrow">02 / ЗАКРЕПЛЯЕМ В ПРАКТИКЕ</p>
              <h2>Знание становится навыком.</h2>
              <p className="muted">8 упражнений: перевод, предложения, грамматика и аудирование.</p>
            </div>
            <Button
              onClick={() => {
                if (state.active) setReplace(true);
                else start();
              }}
            >
              К упражнениям
              <ArrowRight size={18} />
            </Button>
          </Card>
        </div>
        <aside className="lesson-toc">
          <p className="eyebrow">В ЭТОЙ ГЛАВЕ</p>
          {[
            'Как это работает',
            'Детали и употребление',
            'Примеры',
            'Типичные ошибки',
            'Слова урока',
          ].map((title, i) => (
            <a
              key={title}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(
                    i < 2 ? `section-${i}` : i === 2 ? 'examples' : i === 3 ? 'mistakes' : 'words',
                  )
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              href={`#${i < 2 ? `section-${i}` : i === 2 ? 'examples' : i === 3 ? 'mistakes' : 'words'}`}
            >
              {String(i + 1).padStart(2, '0')} <span>{title}</span>
            </a>
          ))}
          <div className="toc-note">
            <span>✦</span>
            <p>Не спешите. Понимание важнее скорости.</p>
          </div>
        </aside>
      </div>
      {replace && (
        <Modal title="У вас есть незавершённое занятие" onClose={() => setReplace(false)}>
          <p className="muted">
            Можно продолжить сохранённое занятие или начать этот урок заново. Завершённые результаты
            сохранятся; текущие ответы останутся в истории.
          </p>
          <div className="row wrap">
            <Button onClick={() => navigate('/practice')}>Продолжить сохранённое</Button>
            <Button variant="secondary" onClick={start}>
              Начать этот урок
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
