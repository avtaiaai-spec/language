import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Star,
  Layers,
  Pencil,
  Trash2,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { contexts, levels } from '../data/curriculum';
import { newReview, scheduleReview } from '../lib/learning';
import {
  AudioButton,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  PageTitle,
  Tabs,
} from '../components/ui';
import type { VocabularyWord, ContextId, LevelId } from '../types';
const filters = [
  { id: 'all', title: 'Все слова' },
  { id: 'learning', title: 'Изучаю' },
  { id: 'due', title: 'На повторении' },
  { id: 'learned', title: 'Изучено' },
  { id: 'favorite', title: 'Избранное' },
];
export function Vocabulary() {
  const { state, update, notify } = useStore();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [filter, setFilter] = useState('all');
  const [collection, setCollection] = useState('all');
  const [editing, setEditing] = useState<VocabularyWord | 'new' | null>(null);
  const [newCollection, setNewCollection] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [review, setReview] = useState(params.get('review') === '1');
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [deleteWord, setDeleteWord] = useState<VocabularyWord | null>(null);
  const now = Date.now();
  const queue = state.vocabulary.filter(
    (w) => w.review.due <= now && (collection === 'all' || w.collectionIds.includes(collection)),
  );
  const current = queue[0];
  const words = state.vocabulary.filter(
    (w) =>
      `${w.en} ${w.ru}`.toLowerCase().includes(query.toLowerCase()) &&
      (collection === 'all' || w.collectionIds.includes(collection)) &&
      (filter === 'all' ||
        (filter === 'learning' && w.review.repetitions < 5) ||
        (filter === 'due' && w.review.due <= now) ||
        (filter === 'learned' && w.review.repetitions >= 5) ||
        (filter === 'favorite' && w.favorite)),
  );
  const rate = (quality: number) => {
    if (!current) return;
    update((s) => ({
      ...s,
      vocabulary: s.vocabulary.map((w) =>
        w.id === current.id ? { ...w, review: scheduleReview(w.review, quality) } : w,
      ),
    }));
    setFlipped(false);
    setReviewed((n) => n + 1);
  };
  return (
    <>
      <PageTitle
        eyebrow="WORDS WORTH KEEPING"
        title="Ваш словарь. Ваш мир."
        description="Собирайте нужные слова и возвращайтесь к ним вовремя."
        action={
          <Button onClick={() => setEditing('new')}>
            <Plus size={18} /> Добавить слово
          </Button>
        }
      />
      <div className="vocabulary-summary">
        <Card>
          <Layers size={22} />
          <strong>{state.vocabulary.length}</strong>
          <span className="muted">слов в библиотеке</span>
        </Card>
        <Card>
          <RotateCcw size={22} />
          <strong>{queue.length}</strong>
          <span className="muted">пора повторить</span>
        </Card>
        <Card>
          <Check size={22} />
          <strong>{state.vocabulary.filter((w) => w.review.repetitions >= 5).length}</strong>
          <span className="muted">закреплено в памяти</span>
        </Card>
      </div>
      {review ? (
        <section className="review-section">
          <div className="section-heading">
            <h2>Время вспомнить</h2>
            <Button variant="ghost" onClick={() => setReview(false)}>
              К списку слов
            </Button>
          </div>
          {current ? (
            <>
              <p className="muted fine">
                Повторено: {reviewed} · В очереди: {queue.length}
              </p>
              <Card className={`flashcard ${flipped ? 'flipped' : ''}`}>
                <Badge>
                  {current.level} · {current.part}
                </Badge>
                <button
                  className="flashcard-face"
                  aria-label={flipped ? 'Показать слово' : 'Перевернуть карточку'}
                  onClick={() => setFlipped((v) => !v)}
                >
                  {flipped ? (
                    <>
                      <h2>{current.ru}</h2>
                      <p lang="en">{current.example}</p>
                      <p className="muted">{current.translation}</p>
                    </>
                  ) : (
                    <>
                      <h2 lang="en">{current.en}</h2>
                      <p className="ipa muted">{current.ipa || 'Транскрипция не указана'}</p>
                      <small className="muted">Нажмите, чтобы увидеть перевод</small>
                    </>
                  )}
                </button>
                <AudioButton text={flipped && current.example ? current.example : current.en} />
              </Card>
              <div className="review-ratings">
                {[
                  { label: 'Не знаю', sub: 'Через 10 минут' },
                  { label: 'Сложно', sub: 'Завтра' },
                  { label: 'Хорошо', sub: 'По расписанию' },
                  { label: 'Легко', sub: 'Больший интервал' },
                ].map((r, i) => (
                  <Button
                    variant={i === 2 ? 'primary' : 'secondary'}
                    disabled={!flipped}
                    onClick={() => rate(i)}
                    key={r.label}
                  >
                    <span>
                      {r.label}
                      <small>{r.sub}</small>
                    </span>
                  </Button>
                ))}
              </div>
              <p className="fine muted">
                Сначала откройте перевод, затем оцените, насколько легко вспомнили слово.
              </p>
            </>
          ) : (
            <Empty title="На сегодня всё закреплено">
              <p>
                {reviewed ? `Вы повторили ${reviewed} карточек. ` : ''}Слова вернутся по расписанию.
                Ответ «Не знаю» вернёт карточку через 10 минут.
              </p>
              <Button variant="secondary" onClick={() => setReview(false)}>
                Вернуться к словарю
              </Button>
            </Empty>
          )}
        </section>
      ) : (
        <>
          <div className="vocabulary-toolbar">
            <div className="search-field">
              <Search size={18} />
              <Input
                aria-label="Поиск слова"
                placeholder="Найти слово или перевод…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" disabled={!queue.length} onClick={() => setReview(true)}>
              Повторить · {queue.length}
              <ArrowRight size={16} />
            </Button>
          </div>
          <Tabs label="Статус слов" value={filter} items={filters} onChange={setFilter} />
          <div className="row wrap collections">
            <label>
              Подборка
              <select value={collection} onChange={(e) => setCollection(e.target.value)}>
                <option value="all">Все подборки</option>
                {state.collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="ghost" onClick={() => setNewCollection(true)}>
              <Plus size={16} /> Новая подборка
            </Button>
          </div>
          {!words.length ? (
            <Empty title="Пока ни одного совпадения">
              <p>Измените фильтр или добавьте собственное слово.</p>
            </Empty>
          ) : (
            <div className="word-grid">
              {words.map((w) => (
                <Card key={w.id} className="word-card">
                  <div className="row between">
                    <Badge>
                      {w.level} · {w.part}
                    </Badge>
                    <Button
                      className={w.favorite ? 'gold' : ''}
                      variant="ghost"
                      aria-label={w.favorite ? 'Убрать из избранного' : 'В избранное'}
                      aria-pressed={w.favorite}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          vocabulary: s.vocabulary.map((x) =>
                            x.id === w.id ? { ...x, favorite: !x.favorite } : x,
                          ),
                        }))
                      }
                    >
                      <Star size={18} fill={w.favorite ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                  <div className="row">
                    <h2 lang="en">{w.en}</h2>
                    <AudioButton small text={w.en} />
                  </div>
                  <span className="ipa muted">{w.ipa || 'Без транскрипции'}</span>
                  <p>{w.ru}</p>
                  <div className="word-example">
                    <div className="row between">
                      <span lang="en">{w.example || 'Пример не добавлен'}</span>
                      {w.example && <AudioButton small text={w.example} />}
                    </div>
                    <small className="muted">{w.translation}</small>
                  </div>
                  <div className="row between fine muted">
                    <span>
                      {w.review.repetitions >= 5
                        ? 'Изучено'
                        : w.review.history.length
                          ? 'Изучаю'
                          : 'Новое слово'}
                    </span>
                    <span>
                      {w.review.due <= now
                        ? 'Пора повторить'
                        : `Повтор: ${new Date(w.review.due).toLocaleDateString('ru-RU')}`}
                    </span>
                  </div>
                  <details>
                    <summary>Подборки и история</summary>
                    <p className="fine muted">
                      Добавлено {new Date(w.addedAt).toLocaleDateString('ru-RU')}
                    </p>
                    {state.collections.length ? (
                      state.collections.map((c) => (
                        <label className="checkbox-label" key={c.id}>
                          <input
                            type="checkbox"
                            checked={w.collectionIds.includes(c.id)}
                            onChange={() =>
                              update((s) => ({
                                ...s,
                                vocabulary: s.vocabulary.map((x) =>
                                  x.id === w.id
                                    ? {
                                        ...x,
                                        collectionIds: x.collectionIds.includes(c.id)
                                          ? x.collectionIds.filter((id) => id !== c.id)
                                          : [...x.collectionIds, c.id],
                                      }
                                    : x,
                                ),
                              }))
                            }
                          />
                          {c.name}
                        </label>
                      ))
                    ) : (
                      <p className="fine muted">Создайте подборку, чтобы группировать слова.</p>
                    )}
                    {w.review.history.length ? (
                      <ul className="review-history">
                        {w.review.history
                          .slice(-8)
                          .reverse()
                          .map((h, i) => (
                            <li key={i}>
                              {new Date(h.at).toLocaleDateString('ru-RU')} ·{' '}
                              {['Не знаю', 'Сложно', 'Хорошо', 'Легко'][h.quality]}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="fine muted">Повторений ещё не было.</p>
                    )}
                  </details>
                  <div className="row between word-actions">
                    {w.custom ? (
                      <Button variant="ghost" onClick={() => setEditing(w)}>
                        <Pencil size={15} /> Изменить
                      </Button>
                    ) : (
                      <span className="fine muted">Из учебной библиотеки</span>
                    )}
                    <Button
                      variant="ghost"
                      aria-label={`Удалить ${w.en}`}
                      onClick={() => setDeleteWord(w)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      {editing && (
        <WordEditor
          word={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}{' '}
      {newCollection && (
        <Modal title="Новая подборка" onClose={() => setNewCollection(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = collectionName.trim();
              if (!name) return;
              if (state.collections.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
                notify('Подборка с таким названием уже есть.');
                return;
              }
              update((s) => ({
                ...s,
                collections: [...s.collections, { id: crypto.randomUUID(), name }],
              }));
              setNewCollection(false);
              setCollectionName('');
            }}
          >
            <label>
              Название
              <Input
                required
                maxLength={80}
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Например, для путешествия"
              />
            </label>
            <Button type="submit">Создать</Button>
          </form>
        </Modal>
      )}
      {deleteWord && (
        <Modal title="Удалить слово из словаря?" onClose={() => setDeleteWord(null)}>
          <p>
            «{deleteWord.en}» и история его повторений будут удалены. Завершённые занятия
            сохранятся.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              update((s) => ({
                ...s,
                vocabulary: s.vocabulary.filter((w) => w.id !== deleteWord.id),
              }));
              setDeleteWord(null);
            }}
          >
            Удалить слово
          </Button>
        </Modal>
      )}
    </>
  );
}
function WordEditor({ word, onClose }: { word?: VocabularyWord; onClose: () => void }) {
  const { state, update, notify } = useStore();
  const [en, setEn] = useState(word?.en || '');
  const [ru, setRu] = useState(word?.ru || '');
  const [ipa, setIpa] = useState(word?.ipa || '');
  const [example, setExample] = useState(word?.example || '');
  const [translation, setTranslation] = useState(word?.translation || '');
  const [level, setLevel] = useState<LevelId>(word?.level || state.profile.level);
  const [topic, setTopic] = useState<ContextId>(word?.topic || 'everyday');
  const [part, setPart] = useState(word?.part || 'существительное');
  return (
    <Modal title={word ? 'Редактировать слово' : 'Новое слово'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!en.trim() || !ru.trim()) return;
          if (
            state.vocabulary.some(
              (w) => w.id !== word?.id && w.en.toLowerCase() === en.trim().toLowerCase(),
            )
          ) {
            notify('Такое слово уже есть в словаре.');
            return;
          }
          const value: VocabularyWord = {
            id: word?.id || crypto.randomUUID(),
            en: en.trim(),
            ru: ru.trim(),
            ipa: ipa.trim(),
            part,
            example: example.trim(),
            translation: translation.trim(),
            level,
            topic,
            custom: true,
            addedAt: word?.addedAt || Date.now(),
            favorite: word?.favorite || false,
            collectionIds: word?.collectionIds || [],
            review: word?.review || newReview(),
          };
          update((s) => ({
            ...s,
            vocabulary: word
              ? s.vocabulary.map((w) => (w.id === word.id ? value : w))
              : [...s.vocabulary, value],
          }));
          onClose();
          notify('Слово сохранено.');
        }}
      >
        <div className="form-grid">
          <label>
            Слово на английском
            <Input required maxLength={100} value={en} onChange={(e) => setEn(e.target.value)} />
          </label>
          <label>
            Перевод
            <Input required maxLength={200} value={ru} onChange={(e) => setRu(e.target.value)} />
          </label>
          <label>
            IPA (необязательно)
            <Input
              maxLength={100}
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              placeholder="Из проверенного словаря"
            />
          </label>
          <label>
            Часть речи
            <select value={part} onChange={(e) => setPart(e.target.value)}>
              {[
                'существительное',
                'глагол',
                'прилагательное',
                'наречие',
                'выражение',
                'другое',
              ].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Уровень
            <select value={level} onChange={(e) => setLevel(e.target.value as LevelId)}>
              {levels.map((l) => (
                <option key={l.id}>{l.id}</option>
              ))}
            </select>
          </label>
          <label>
            Тема
            <select value={topic} onChange={(e) => setTopic(e.target.value as ContextId)}>
              {contexts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Пример
          <Input maxLength={500} value={example} onChange={(e) => setExample(e.target.value)} />
        </label>
        <label>
          Перевод примера
          <Input
            maxLength={500}
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
        </label>
        <Button type="submit">Сохранить слово</Button>
      </form>
    </Modal>
  );
}
