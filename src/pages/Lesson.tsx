import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, BookOpen, Plus, Eye, EyeOff, Info } from 'lucide-react';
import { contexts, lessons } from '../data/curriculum';
import { useStore } from '../lib/store';
import { newReview } from '../lib/learning';
import { createSession } from '../lib/sessions';
import { AlphabetStudio, SoundAtlas, ReadingLab } from '../components/PhonicsStudio';
import { AudioButton, Badge, Button, Card, Empty, Modal, Tabs } from '../components/ui';
import type { ContextId, Exercise, StudySession } from '../types';
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
  const [showAllWords, setShowAllWords] = useState(false);
  const [pending, setPending] = useState<{
    exercises: Exercise[];
    kind: StudySession['kind'];
  } | null>(null);
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
  const phonics = ['alphabet', 'reading'].includes(lesson.id);
  const start = (exercises: Exercise[], kind: StudySession['kind']) => {
    update((s) => ({
      ...s,
      active: createSession(lesson.id, pack.id, exercises, kind),
      lastLesson: lesson.id,
    }));
    navigate('/practice');
  };
  const requestPractice = (exercises: Exercise[], kind: StudySession['kind'] = 'lesson') => {
    if (state.active) setPending({ exercises, kind });
    else start(exercises, kind);
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
  const toc = [
    ...lesson.sections.map((s, i) => ({ title: s.title, id: `section-${i}` })),
    ...(lesson.id === 'alphabet'
      ? [{ title: 'Все 26 букв', id: 'alphabet-atlas' }]
      : lesson.id === 'reading'
        ? [
            { title: 'Атлас 44 звуков', id: 'sound-atlas' },
            { title: 'Лаборатория чтения', id: 'reading-lab' },
          ]
        : []),
    { title: phonics ? 'Текст вашей темы' : 'Примеры', id: 'examples' },
    { title: 'Типичные ошибки', id: 'mistakes' },
    { title: 'Слова урока', id: 'words' },
  ];
  return (
    <>
      <Link to="/learn" className="back-link">
        <ArrowLeft size={16} /> К учебному маршруту
      </Link>
      <div className="lesson-header">
        <div className="row">
          <Badge>{lesson.level}</Badge>
          <span className="fine muted">
            <Clock3 size={14} /> Около {lesson.minutes} минут
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
                setShowAllWords(false);
              }}
            />
            {phonics && (
              <div className="phonics-jump">
                <a
                  href={`#${lesson.id === 'alphabet' ? 'alphabet-atlas' : 'sound-atlas'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(lesson.id === 'alphabet' ? 'alphabet-atlas' : 'sound-atlas')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {lesson.id === 'alphabet' ? 'К таблице всех 26 букв' : 'К атласу всех 44 звуков'}
                  <ArrowRight size={15} />
                </a>
                <span>{pack.words.length} слов в выбранной теме · можно учить частями</span>
              </div>
            )}
          </Card>
          <article className="theory">
            <p className="eyebrow">01 / ПОНИМАЕМ И ИССЛЕДУЕМ</p>
            {lesson.sections.map((s, i) => (
              <Fragment key={s.title}>
                <section id={`section-${i}`} className="guide-section">
                  <p className="chapter-number">{String(i + 1).padStart(2, '0')} / РАЗБОР</p>
                  <h2>{s.title}</h2>
                  {s.text.split('\n\n').map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {i === 0 && !phonics && (
                    <div className="formula">
                      <span>FORMULA</span>
                      <strong>{lesson.formula}</strong>
                      <AudioButton small text={lesson.formula} />
                    </div>
                  )}
                  {s.fact && (
                    <aside className="lesson-fact">
                      <span>НА ПОЛЯХ</span>
                      <p>{s.fact}</p>
                    </aside>
                  )}
                  {s.checkpoint && (
                    <details className="self-check">
                      <summary>Проверьте себя: {s.checkpoint.question}</summary>
                      <p>{s.checkpoint.answer}</p>
                    </details>
                  )}
                </section>
                {i === 1 && lesson.id === 'alphabet' && (
                  <AlphabetStudio context={pack.id} onAdd={addWord} />
                )}{' '}
                {i === 1 && lesson.id === 'reading' && (
                  <SoundAtlas
                    context={pack.id}
                    onAdd={addWord}
                    exercises={pack.exercises}
                    onPractice={(items) =>
                      requestPractice(
                        items,
                        items.length === pack.exercises.length ? 'lesson' : 'mixed',
                      )
                    }
                  />
                )}
              </Fragment>
            ))}
            {lesson.id === 'reading' && <ReadingLab context={pack.id} />}
            <section id="examples">
              <div className="row between">
                <h2>{phonics ? 'Читаем в вашем контексте' : 'А теперь — в вашем контексте'}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setTranslations((v) => !v)}
                  aria-label={translations ? 'Скрыть перевод' : 'Показать перевод'}
                >
                  {translations ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <p className="eyebrow">{contexts.find((c) => c.id === pack.id)?.en}</p>
              {phonics && (
                <p>
                  Прочитайте строки самостоятельно, затем сравните со звучанием. Нужные слова и их
                  транскрипции есть в карточках выше.
                </p>
              )}
              {pack.examples.map((e, i) => (
                <div className="example" key={`${pack.id}-${i}`}>
                  <div className="row between">
                    <p lang="en">
                      {e.en.split(/([A-Za-z]+(?:-[A-Za-z]+)?)/g).map((token, k) => {
                        const word = pack.words.find(
                          (w) => w.en.toLowerCase() === token.toLowerCase(),
                        );
                        return word ? (
                          <button
                            className="inline-word"
                            key={k}
                            title={`${word.ipa} — ${word.ru}`}
                            aria-label={`Добавить слово ${word.en} из примера`}
                            onClick={() => addWord(word)}
                          >
                            {token}
                          </button>
                        ) : (
                          <Fragment key={k}>{token}</Fragment>
                        );
                      })}
                    </p>
                    <AudioButton text={e.en} small />
                  </div>
                  {translations && <p className="muted">{e.ru}</p>}
                </div>
              ))}
              {phonics && (
                <AudioButton
                  text={pack.examples.map((e) => e.en).join(' ')}
                  label="Прослушать все предложения"
                />
              )}
            </section>
            <section id="mistakes" className="rule-warning">
              <Info size={23} />
              <div>
                <h3>Обратите внимание</h3>
                <p>{lesson.mistake}</p>
              </div>
            </section>
            <section id="words">
              <h2>Слова этой главы</h2>
              <p>
                Выбирайте слова, которые хотите закрепить. Добавление в словарь не отмечает их
                изученными.
              </p>
              {pack.words.slice(0, phonics && !showAllWords ? 6 : undefined).map((w) => (
                <Card key={w.id} className="lesson-word">
                  <div>
                    <div className="row">
                      <h3>{w.en}</h3>
                      <AudioButton text={w.en} label={`Прослушать ${w.en}`} small />
                    </div>
                    <span className="ipa muted">{w.ipa}</span>
                    <p>{w.ru}</p>
                  </div>
                  <Button
                    variant="secondary"
                    disabled={state.vocabulary.some(
                      (v) => v.en.toLowerCase() === w.en.toLowerCase(),
                    )}
                    onClick={() => addWord(w)}
                  >
                    <Plus size={16} />
                    {state.vocabulary.some((v) => v.en.toLowerCase() === w.en.toLowerCase())
                      ? 'Уже в словаре'
                      : 'В словарь'}
                  </Button>
                </Card>
              ))}
              {phonics && pack.words.length > 6 && (
                <Button variant="ghost" onClick={() => setShowAllWords((v) => !v)}>
                  {showAllWords ? 'Свернуть список' : `Показать все ${pack.words.length} слов`}
                </Button>
              )}
            </section>
          </article>
          <Card className="practice-callout">
            <div>
              <p className="eyebrow">02 / ЗАКРЕПЛЯЕМ В ПРАКТИКЕ</p>
              <h2>Знание становится навыком.</h2>
              <p className="muted">
                {pack.exercises.length} заданий
                {phonics
                  ? ': чтение, узнавание и запись услышанного. Можно сохранить занятие и вернуться позже.'
                  : ': перевод, предложения, грамматика и аудирование.'}
              </p>
              {lesson.id === 'reading' && (
                <p className="muted">
                  В атласе можно выбрать отдельную группу звуков для короткой тренировки. Прогресс
                  всего урока начисляется за полную практику.
                </p>
              )}
            </div>
            <Button onClick={() => requestPractice(pack.exercises)}>
              К упражнениям
              <ArrowRight size={18} />
            </Button>
          </Card>
        </div>
        <aside className="lesson-toc">
          <p className="eyebrow">В ЭТОЙ ГЛАВЕ</p>
          {toc.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {String(i + 1).padStart(2, '0')} <span>{item.title}</span>
            </a>
          ))}
          <div className="toc-note">
            <span>✦</span>
            <p>Одна глава — несколько открытий. Учитесь в своём ритме.</p>
          </div>
        </aside>
      </div>
      {pending && (
        <Modal title="У вас есть незавершённое занятие" onClose={() => setPending(null)}>
          <p className="muted">
            Можно продолжить сохранённое занятие или начать выбранную практику. Отправленные ответы
            и завершённые результаты сохранятся.
          </p>
          <div className="row wrap">
            <Button onClick={() => navigate('/practice')}>Продолжить сохранённое</Button>
            <Button variant="secondary" onClick={() => start(pending.exercises, pending.kind)}>
              Начать выбранную практику
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
