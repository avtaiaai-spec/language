import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Headphones, Clock3, ArrowRight } from 'lucide-react';
import { listeningMaterials, verifiedVideos } from '../data/listening';
import { contexts, levels } from '../data/curriculum';
import { useStore } from '../lib/store';
import { createSession } from '../lib/sessions';
import { AudioButton, Badge, Button, Card, Empty, Modal, PageTitle, Tabs } from '../components/ui';
import { YouTubePlayer } from '../components/YouTubePlayer';
export function Listening() {
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [duration, setDuration] = useState('all');
  const [kind, setKind] = useState('dialogue');
  const materials = [...listeningMaterials, ...verifiedVideos].filter(
    (m) =>
      (level === 'all' || m.level === level) &&
      (topic === 'all' || m.topic === topic) &&
      (duration === 'all' ||
        (duration === 'short' && m.minutes <= 2) ||
        (duration === 'long' && m.minutes > 2)) &&
      m.kind === kind,
  );
  return (
    <>
      <PageTitle
        eyebrow="LISTEN TO A WIDER WORLD"
        title="Listening Studio"
        description="Привыкайте к звучанию английского — через короткие истории и живые ситуации."
      />
      <Tabs
        label="Тип материала"
        items={[
          { id: 'dialogue', title: 'Учебные диалоги' },
          { id: 'youtube', title: 'Видео YouTube' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <div className="filter-row">
        <label>
          Уровень
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">Все уровни</option>
            {levels.map((l) => (
              <option key={l.id}>{l.id}</option>
            ))}
          </select>
        </label>
        <label>
          Тема
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">Все темы</option>
            {contexts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Длительность
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="all">Любая</option>
            <option value="short">До 2 минут</option>
            <option value="long">Более 2 минут</option>
          </select>
        </label>
      </div>
      {!materials.length ? (
        <Empty title={kind === 'youtube' ? 'Видеотека готовится' : 'Нет подходящих диалогов'}>
          <p>
            {kind === 'youtube'
              ? 'Здесь появятся вручную проверенные ролики с разрешённым встраиванием и подготовленными заданиями. Пока доступны три учебных диалога.'
              : 'Попробуйте изменить фильтры.'}
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setKind('dialogue');
              setLevel('all');
              setTopic('all');
              setDuration('all');
            }}
          >
            Показать диалоги
          </Button>
        </Empty>
      ) : (
        <div className="lesson-grid listening-grid">
          {materials.map((m, i) => (
            <Link to={`/listening/${m.id}`} key={m.id} className="lesson-card">
              <div className={`audio-art audio-art-${i}`}>
                <Headphones size={60} strokeWidth={1} />
                <span className="waveform" aria-hidden="true">
                  ▂ ▄ ▆ █ ▅ ▃ ▆ █ ▄ ▂ ▅ ▃
                </span>
                <Badge>{m.level}</Badge>
              </div>
              <div className="row between">
                <p className="eyebrow">{contexts.find((c) => c.id === m.topic)?.en}</p>
                <ArrowUpRight size={19} />
              </div>
              <h3>{m.title}</h3>
              <p className="muted">{m.description}</p>
              <span className="fine muted">
                <Clock3 size={14} /> {m.minutes} мин · {m.exercises.length} задания
              </span>
            </Link>
          ))}
        </div>
      )}
      <Card className="info-card">
        <Headphones size={24} />
        <p className="muted">
          Учебные диалоги озвучиваются средствами браузера. Выберите британский или американский
          голос и скорость в настройках. Это синтез речи, а не запись носителя.
        </p>
      </Card>
    </>
  );
}
export function ListeningDetail() {
  const { id } = useParams();
  const m = [...listeningMaterials, ...verifiedVideos].find((x) => x.id === id);
  const { state, update } = useStore();
  const navigate = useNavigate();
  const [replace, setReplace] = useState(false);
  const [transcript, setTranscript] = useState(false);
  if (!m)
    return (
      <Empty title="Материал не найден">
        <Link to="/listening">К аудированию</Link>
      </Empty>
    );
  const begin = () => {
    update((s) => ({ ...s, active: createSession(m.id, m.topic, m.exercises, 'listening') }));
    navigate('/practice');
  };
  return (
    <>
      <Link className="back-link" to="/listening">
        <ArrowLeft size={16} /> В Listening Studio
      </Link>
      <PageTitle
        eyebrow={`${m.level} / ${contexts.find((c) => c.id === m.topic)?.en}`}
        title={m.title}
        description={m.description}
      />
      <Card className="listening-player">
        <Headphones size={50} strokeWidth={1} />
        <h2>Сначала просто послушайте.</h2>
        <p className="muted">Не старайтесь понять каждое слово. Поймайте общий смысл.</p>
        {m.kind === 'youtube' && m.youtubeId ? (
          <YouTubePlayer videoId={m.youtubeId} />
        ) : (
          <AudioButton text={m.transcript.map((t) => t.text).join(' ')} label="Слушать диалог" />
        )}
        <Button variant="ghost" onClick={() => setTranscript((v) => !v)}>
          {transcript ? 'Скрыть' : 'Открыть'} текст и перевод
        </Button>
      </Card>
      {transcript && (
        <Card className="transcript">
          <h2>Разбор диалога</h2>
          {m.transcript.map((t, i) => (
            <div key={i}>
              <p className="eyebrow">{t.speaker}</p>
              <div className="row between">
                <p lang="en">{t.text}</p>
                <AudioButton small text={t.text} />
              </div>
              <p className="muted">{t.ru}</p>
            </div>
          ))}
        </Card>
      )}
      <Card>
        <h3>Ключевые слова</h3>
        <div className="row wrap">
          {m.words.map((w) => (
            <span className="word-token row" key={w}>
              {w}
              <AudioButton small text={w} />
            </span>
          ))}
        </div>
      </Card>
      <Card className="practice-callout">
        <div>
          <h2>Что удалось услышать?</h2>
          <p className="muted">Проверьте понимание и закрепите выражения.</p>
        </div>
        <Button onClick={() => (state.active ? setReplace(true) : begin())}>
          К заданиям
          <ArrowRight size={18} />
        </Button>
      </Card>
      {replace && (
        <Modal title="Есть сохранённое занятие" onClose={() => setReplace(false)}>
          <p>Продолжить его или заменить заданиями этого диалога?</p>
          <div className="row wrap">
            <Button onClick={() => navigate('/practice')}>Продолжить</Button>
            <Button variant="secondary" onClick={begin}>
              Начать диалог
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
