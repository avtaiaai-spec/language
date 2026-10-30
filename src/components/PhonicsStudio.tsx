import { useState } from 'react';
import { BookOpen, Plus, Check, Search, ArrowRight } from 'lucide-react';
import { alphabet, sounds, soundGroups, toVocabularyWord, readingPassages } from '../data/phonics';
import type { ReadingWord } from '../data/phonics';
import type { ContextId, LessonContext, Exercise } from '../types';
import { useStore } from '../lib/store';
import { AudioButton, Badge, Button, Card, Input, Tabs } from './ui';
type AddWord = (word: LessonContext['words'][number]) => void;
function WordExample({
  word,
  context,
  lessonId,
  onAdd,
  symbol,
}: {
  word: ReadingWord;
  context: ContextId;
  lessonId: string;
  onAdd: AddWord;
  symbol?: string;
}) {
  const { state } = useStore();
  const exists = state.vocabulary.some((w) => w.en.toLowerCase() === word.en.toLowerCase());
  const parts = symbol ? word.ipa.split(symbol) : [];
  return (
    <div className="phonics-word">
      <div className="row between">
        <strong lang="en">{word.en}</strong>
        <AudioButton text={word.en} label={`Слушать слово ${word.en}`} small />
      </div>
      <span className="ipa" aria-label={`Транскрипция ${word.ipa}`}>
        {symbol && parts.length > 1 ? (
          <>
            {parts[0]}
            <mark>{symbol}</mark>
            {parts.slice(1).join(symbol)}
          </>
        ) : (
          word.ipa
        )}
      </span>
      <p className="muted">{word.ru}</p>
      <Button
        variant="ghost"
        disabled={exists}
        onClick={() => onAdd(toVocabularyWord(word, context, lessonId))}
      >
        {exists ? <Check size={14} /> : <Plus size={14} />}{' '}
        {exists ? 'В вашем словаре' : `В словарь: ${word.en}`}
      </Button>
    </div>
  );
}
export function AlphabetStudio({ context, onAdd }: { context: ContextId; onAdd: AddWord }) {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const shown = alphabet.filter(
    (a) =>
      filter === 'all' ||
      (filter === 'vowels' && 'AEIOU'.includes(a.letter)) ||
      (filter === 'consonants' && !'AEIOU'.includes(a.letter)),
  );
  return (
    <section id="alphabet-atlas" className="phonics-studio">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE WHOLE ALPHABET</p>
          <h2>Все 26 букв — от A до Z</h2>
        </div>
        <Badge>{shown.length} / 26</Badge>
      </div>
      <p className="muted">
        Слушайте название буквы, затем слово из вашей темы. IPA названий следует выбранному акценту;
        IPA слов — британская.
      </p>
      <Tabs
        label="Буквы алфавита"
        value={filter}
        onChange={setFilter}
        items={[
          { id: 'all', title: 'Все 26' },
          { id: 'vowels', title: 'A · E · I · O · U' },
          { id: 'consonants', title: 'Остальные буквы' },
        ]}
      />
      <div className="alphabet-grid">
        {shown.map((a) => (
          <Card className="alphabet-letter" key={`${context}-${a.letter}`}>
            <div className="row between">
              <span className="letter-glyph">
                {a.letter}
                <span>{a.lower}</span>
              </span>
              <Badge>
                {'AEIOU'.includes(a.letter)
                  ? 'Гласная'
                  : a.letter === 'Y'
                    ? 'Особая Y'
                    : 'Согласная'}
              </Badge>
            </div>
            <div className="letter-name">
              <span className="ipa">
                {state.settings.accent === 'en-US' && a.usName ? a.usName : a.name}
              </span>
              <AudioButton text={`The letter ${a.letter}.`} label={`Название буквы ${a.letter}`} />
            </div>
            <WordExample
              word={a.examples[context]}
              context={context}
              lessonId="alphabet"
              onAdd={onAdd}
            />
            <details>
              <summary>Как эта буква работает в словах</summary>
              <p>{a.tip}</p>
            </details>
          </Card>
        ))}
      </div>
      <Card className="phonics-tip">
        <BookOpen size={21} />
        <div>
          <h3>Узнавайте букву в разных ролях</h3>
          <p>
            Вслух назовите букву, затем прослушайте слово. Сравните: название буквы может совсем не
            совпадать с её звуком. Добавляйте нужные слова, а не все карточки сразу.
          </p>
        </div>
      </Card>
    </section>
  );
}
export function SoundAtlas({
  context,
  onAdd,
  exercises,
  onPractice,
}: {
  context: ContextId;
  onAdd: AddWord;
  exercises: Exercise[];
  onPractice: (exercises: Exercise[]) => void;
}) {
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const shown = sounds.filter(
    (s) =>
      (group === 'all' || s.group === group) &&
      `${s.symbol} ${s.title} ${s.examples[context].en} ${s.examples[context].ru}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const practice = exercises.filter((e) =>
    shown.some((s) => e.id === `reading-${context}-${s.id}`),
  );
  return (
    <section id="sound-atlas" className="phonics-studio">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE SOUND ATLAS</p>
          <h2>44 звука. У каждого — своё слово.</h2>
        </div>
        <Badge>{shown.length} / 44</Badge>
      </div>
      <p className="muted">
        Традиционная британская учебная модель. Нажмите на озвучку слова и найдите выделенный звук в
        его IPA. Отдельные IPA-символы синтезатору не передаются.
      </p>
      <Tabs
        label="Группы звуков"
        value={group}
        onChange={setGroup}
        items={[
          { id: 'all', title: 'Все 44' },
          ...soundGroups.map((g) => ({ id: g.id, title: g.title })),
        ]}
      />
      <div className="phonics-tools">
        <div className="search-field">
          <Search size={18} />
          <Input
            aria-label="Поиск звука или слова"
            placeholder="Звук, слово или перевод…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          disabled={!practice.length}
          onClick={() => onPractice(practice)}
        >
          Практика выбранных звуков · {practice.length}
          <ArrowRight size={16} />
        </Button>
      </div>
      {shown.length === 0 && (
        <Card>
          <p>Совпадений нет. Попробуйте другой звук или слово.</p>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery('');
              setGroup('all');
            }}
          >
            Показать весь атлас
          </Button>
        </Card>
      )}
      {soundGroups.map((g) => {
        const entries = shown.filter((s) => s.group === g.id);
        if (!entries.length) return null;
        return (
          <div className="sound-group" key={g.id}>
            <div className="section-heading">
              <div>
                <h3>{g.title}</h3>
                <p className="muted">{g.description}</p>
              </div>
              <Badge>{entries.length}</Badge>
            </div>
            <div className="sound-grid">
              {entries.map((s) => (
                <Card key={`${context}-${s.id}`} className="sound-card" data-sound={s.symbol}>
                  <div className="sound-card-heading">
                    <span className="sound-symbol">/{s.symbol}/</span>
                    <h3>{s.title}</h3>
                  </div>
                  <p className="articulation">{s.articulation}</p>
                  <p className="spelling">
                    <span>ЧАСТОЕ НАПИСАНИЕ</span>
                    {s.spelling}
                  </p>
                  <WordExample
                    word={s.examples[context]}
                    context={context}
                    lessonId="reading"
                    onAdd={onAdd}
                    symbol={s.symbol}
                  />
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      <Card className="phonics-tip">
        <BookOpen size={21} />
        <div>
          <h3>Слова в атласе — опоры для слуха</h3>
          <p>
            Среди примеров есть тематические слова разной сложности. Сейчас важнее услышать нужный
            звук, чем запомнить все значения. Для длинных слов найдите ударение и разберите их по
            частям.
          </p>
        </div>
      </Card>
    </section>
  );
}
export function ReadingLab({ context }: { context: ContextId }) {
  const passage = readingPassages[context];
  const [revealed, setRevealed] = useState(false);
  const pairs: [string, string][] = [
    ['ɪ', 'iː'],
    ['ʊ', 'uː'],
    ['w', 'v'],
    ['θ', 'ð'],
  ];
  return (
    <section id="reading-lab" className="reading-lab">
      <p className="eyebrow">FROM SOUNDS TO READING</p>
      <h2>От звука — к самостоятельному чтению</h2>
      <p className="muted">
        Сначала сравните звуки в словах своей темы. Это сравнение произношения, а не обязательно
        минимальные пары.
      </p>
      <div className="sound-comparisons">
        {pairs.map(([a, b]) => {
          const first = sounds.find((s) => s.symbol === a)!.examples[context];
          const second = sounds.find((s) => s.symbol === b)!.examples[context];
          return (
            <Card key={a} className="sound-comparison">
              <Badge>
                /{a}/ ↔ /{b}/
              </Badge>
              {[first, second].map((w) => (
                <div className="row between" key={w.en}>
                  <div>
                    <strong lang="en">{w.en}</strong>
                    <span className="ipa muted">{w.ipa}</span>
                  </div>
                  <AudioButton text={w.en} label={`Сравнить произношение ${w.en}`} small />
                </div>
              ))}
            </Card>
          );
        })}
      </div>
      <Card className="reading-method">
        <h3>{passage.title}</h3>
        <p className="muted">
          Ниже — текст из вашего контекста. Сначала прочитайте его самостоятельно, затем прослушайте
          и проверьте себя.
        </p>
        <AudioButton text={passage.lines.map((l) => l.en).join(' ')} label="Послушать весь текст" />
        <Button variant="ghost" onClick={() => setRevealed((v) => !v)}>
          {revealed ? 'Скрыть' : 'Показать'} разбор чтения
        </Button>
        {revealed && <p className="reading-analysis">{passage.task}</p>}
      </Card>
    </section>
  );
}
