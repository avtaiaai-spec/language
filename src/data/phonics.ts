import type { ContextId, Exercise, Lesson, LessonContext } from '../types';
export type ReadingWord = { en: string; ru: string; ipa: string };
export type SoundGroup = 'short' | 'long' | 'diphthong' | 'consonant';
export type SoundEntry = {
  id: string;
  symbol: string;
  group: SoundGroup;
  title: string;
  articulation: string;
  spelling: string;
  examples: Record<ContextId, ReadingWord>;
};
const topicIds: ContextId[] = ['business', 'movies', 'travel', 'books', 'everyday'];
type WordTuple = [string, string, string];
function examples(words: WordTuple[]): Record<ContextId, ReadingWord> {
  return Object.fromEntries(
    topicIds.map((id, i) => [id, { en: words[i][0], ru: words[i][1], ipa: words[i][2] }]),
  ) as Record<ContextId, ReadingWord>;
}
type SoundSeed = [string, SoundGroup, string, string, string, WordTuple[]];
// Traditional southern British teaching inventory: 12 monophthongs, 8 diphthongs, 24 consonants.
// IPA is authored, never inferred from spelling. Several vowels differ in modern UK/US accents.
const soundSeeds: SoundSeed[] = [
  [
    'ɪ',
    'short',
    'Короткий расслабленный гласный',
    'Язык высоко, но ниже и свободнее, чем для /iː/. Губы расслаблены. Это не русское «ы» и не длинное «и».',
    'i: film; y: system',
    [
      ['bill', 'счёт', '/bɪl/'],
      ['film', 'фильм', '/fɪlm/'],
      ['ticket', 'билет', '/ˈtɪkɪt/'],
      ['myth', 'миф', '/mɪθ/'],
      ['milk', 'молоко', '/mɪlk/'],
    ],
  ],
  [
    'e',
    'short',
    'Короткий передний гласный',
    'Приоткройте рот, язык направьте вперёд. Не добавляйте звук /j/ перед гласным: это не русское «е» в начале слова.',
    'e: desk; ea: head',
    [
      ['desk', 'письменный стол', '/desk/'],
      ['set', 'съёмочная площадка', '/set/'],
      ['tent', 'палатка', '/tent/'],
      ['text', 'текст', '/tekst/'],
      ['bed', 'кровать', '/bed/'],
    ],
  ],
  [
    'æ',
    'short',
    'Открытый передний гласный',
    'Откройте рот шире, чем для /e/, язык держите впереди. Это самостоятельный звук, а не сочетание «а» и «э».',
    'a в закрытом слоге: cash',
    [
      ['cash', 'наличные', '/kæʃ/'],
      ['actor', 'актёр', '/ˈæktə/'],
      ['map', 'карта', '/mæp/'],
      ['chapter', 'глава', '/ˈtʃæptə/'],
      ['cat', 'кот', '/kæt/'],
    ],
  ],
  [
    'ɒ',
    'short',
    'Короткий задний округлённый гласный',
    'Округлите губы и откройте рот. В британском варианте он короткий; во многих американских акцентах на его месте слышен /ɑ/.',
    'o: job; a после w: watch',
    [
      ['job', 'работа', '/dʒɒb/'],
      ['plot', 'сюжет', '/plɒt/'],
      ['stop', 'остановка', '/stɒp/'],
      ['novel', 'роман', '/ˈnɒvəl/'],
      ['clock', 'часы', '/klɒk/'],
    ],
  ],
  [
    'ʊ',
    'short',
    'Короткий округлённый гласный',
    'Слегка округлите губы, не вытягивая их сильно. Произнесите коротко и расслабленно: /ʊ/ не равен долгому /uː/.',
    'oo: book; u: put',
    [
      ['book', 'книга учёта', '/bʊk/'],
      ['look', 'смотреть', '/lʊk/'],
      ['foot', 'ступня', '/fʊt/'],
      ['book', 'книга', '/bʊk/'],
      ['cook', 'готовить', '/kʊk/'],
    ],
  ],
  [
    'ʌ',
    'short',
    'Короткий центральный гласный',
    'Расслабьте губы, приоткройте рот, язык оставьте ближе к центру. Не округляйте губы по образцу русского «о».',
    'u: budget; o: money',
    [
      ['budget', 'бюджет', '/ˈbʌdʒɪt/'],
      ['stunt', 'трюк', '/stʌnt/'],
      ['bus', 'автобус', '/bʌs/'],
      ['cover', 'обложка', '/ˈkʌvə/'],
      ['cup', 'чашка', '/kʌp/'],
    ],
  ],
  [
    'ə',
    'short',
    'Schwa: безударный нейтральный звук',
    'Полностью расслабьте рот. Это очень краткий нейтральный гласный в безударном слоге. Не старайтесь произнести написанную букву отчётливо.',
    'Любая гласная без ударения: about, actor',
    [
      ['about', 'о; примерно', '/əˈbaʊt/'],
      ['actor', 'актёр', '/ˈæktə/'],
      ['arrival', 'прибытие', '/əˈraɪvəl/'],
      ['author', 'автор', '/ˈɔːθə/'],
      ['sofa', 'диван', '/ˈsəʊfə/'],
    ],
  ],
  [
    'iː',
    'long',
    'Долгий высокий передний гласный',
    'Язык высоко и впереди, губы слегка растянуты. Сравните не только длительность, но и положение языка с /ɪ/.',
    'ee: screen; ea: read; e: scene',
    [
      ['team', 'команда', '/tiːm/'],
      ['scene', 'сцена', '/siːn/'],
      ['beach', 'пляж', '/biːtʃ/'],
      ['read', 'читать', '/riːd/'],
      ['tea', 'чай', '/tiː/'],
    ],
  ],
  [
    'ɑː',
    'long',
    'Долгий открытый задний гласный',
    'Широко откройте рот, язык отведите назад, губы не округляйте. В неротическом британском акценте r после гласного перед согласным не звучит.',
    'ar: market; a перед некоторыми согласными в UK: cast',
    [
      ['market', 'рынок', '/ˈmɑːkɪt/'],
      ['star', 'звезда', '/stɑː/'],
      ['car', 'автомобиль', '/kɑː/'],
      ['part', 'часть', '/pɑːt/'],
      ['garden', 'сад', '/ˈɡɑːdən/'],
    ],
  ],
  [
    'ɔː',
    'long',
    'Долгий округлённый задний гласный',
    'Округлите губы и произнесите устойчивый долгий гласный. Не превращайте его в /əʊ/: положение губ не должно заметно скользить.',
    'or: order; aw: draw; au: author',
    [
      ['order', 'заказ', '/ˈɔːdə/'],
      ['score', 'музыка к фильму', '/skɔː/'],
      ['airport', 'аэропорт', '/ˈeəpɔːt/'],
      ['story', 'история', '/ˈstɔːri/'],
      ['door', 'дверь', '/dɔː/'],
    ],
  ],
  [
    'uː',
    'long',
    'Долгий высокий округлённый гласный',
    'Округлите губы. В современных акцентах язык может быть довольно далеко впереди; главное — не путать этот звук с коротким /ʊ/.',
    'oo: room; ue: blue; ew: crew',
    [
      ['rule', 'правило', '/ruːl/'],
      ['crew', 'съёмочная группа', '/kruː/'],
      ['room', 'номер; комната', '/ruːm/'],
      ['clue', 'подсказка', '/kluː/'],
      ['food', 'еда', '/fuːd/'],
    ],
  ],
  [
    'ɜː',
    'long',
    'Долгий центральный гласный',
    'Губы нейтральны, язык в центре. В британской транскрипции /ɜː/ не требует звука /r/; в американской речи соответствующий гласный обычно r-окрашен.',
    'ir: first; ur: turn; or после w: word',
    [
      ['work', 'работать', '/wɜːk/'],
      ['rehearse', 'репетировать', '/rɪˈhɜːs/'],
      ['journey', 'путешествие', '/ˈdʒɜːni/'],
      ['word', 'слово', '/wɜːd/'],
      ['shirt', 'рубашка', '/ʃɜːt/'],
    ],
  ],
  [
    'eɪ',
    'diphthong',
    'Скольжение от /e/ к /ɪ/',
    'Начните с /e/ и плавно сдвиньте язык вверх. Это один слог, а не два отдельных гласных.',
    'a…e: name; ai: train; ay: play',
    [
      ['sale', 'продажа', '/seɪl/'],
      ['stage', 'сцена; подмостки', '/steɪdʒ/'],
      ['train', 'поезд', '/treɪn/'],
      ['page', 'страница', '/peɪdʒ/'],
      ['day', 'день', '/deɪ/'],
    ],
  ],
  [
    'aɪ',
    'diphthong',
    'Скольжение от открытого гласного к /ɪ/',
    'Начните с открытого рта и поднимите язык к концу звука. Не вставляйте отдельное русское «й» с сильной преградой.',
    'i…e: time; igh: night; y: sky',
    [
      ['price', 'цена', '/praɪs/'],
      ['light', 'свет', '/laɪt/'],
      ['flight', 'рейс', '/flaɪt/'],
      ['line', 'строка', '/laɪn/'],
      ['night', 'ночь', '/naɪt/'],
    ],
  ],
  [
    'ɔɪ',
    'diphthong',
    'Скольжение от /ɔ/ к /ɪ/',
    'Начните с округлённых губ, затем расслабьте их и передвиньте язык вперёд. Два положения объединяются в один слог.',
    'oi: choice; oy: enjoy',
    [
      ['choice', 'выбор', '/tʃɔɪs/'],
      ['voice', 'голос', '/vɔɪs/'],
      ['enjoy', 'получать удовольствие', '/ɪnˈdʒɔɪ/'],
      ['point', 'мысль; пункт', '/pɔɪnt/'],
      ['toy', 'игрушка', '/tɔɪ/'],
    ],
  ],
  [
    'aʊ',
    'diphthong',
    'Скольжение к округлённому /ʊ/',
    'Начните с открытого рта, к концу слегка округлите губы. Не разбивайте звук на два слога.',
    'ou: account; ow: town',
    [
      ['account', 'счёт; учётная запись', '/əˈkaʊnt/'],
      ['sound', 'звук', '/saʊnd/'],
      ['town', 'город', '/taʊn/'],
      ['noun', 'существительное', '/naʊn/'],
      ['house', 'дом', '/haʊs/'],
    ],
  ],
  [
    'əʊ',
    'diphthong',
    'Британский гласный в go',
    'Начните с центрального расслабленного гласного и округлите губы к концу. В американском варианте обычно записывают /oʊ/.',
    'o…e: role; oa: road; ow: show',
    [
      ['goal', 'цель', '/ɡəʊl/'],
      ['show', 'шоу', '/ʃəʊ/'],
      ['road', 'дорога', '/rəʊd/'],
      ['poem', 'стихотворение', '/ˈpəʊɪm/'],
      ['home', 'дом', '/həʊm/'],
    ],
  ],
  [
    'ɪə',
    'diphthong',
    'От /ɪ/ к нейтральному гласному',
    'Начните с короткого /ɪ/ и расслабьте язык к центру. В современной британской речи этот звук может звучать более слитно и долго.',
    'ear: near; eer: career',
    [
      ['career', 'карьера', '/kəˈrɪə/'],
      ['appear', 'появляться', '/əˈpɪə/'],
      ['near', 'рядом', '/nɪə/'],
      ['hero', 'герой', '/ˈhɪərəʊ/'],
      ['ear', 'ухо', '/ɪə/'],
    ],
  ],
  [
    'eə',
    'diphthong',
    'От /e/ к центральному гласному',
    'Начните с /e/ и слегка расслабьте язык. У многих современных британских говорящих это долгий монофтонг; здесь используем традиционную учебную запись.',
    'air: chair; are: care',
    [
      ['share', 'доля; акция', '/ʃeə/'],
      ['hair', 'волосы', '/heə/'],
      ['fare', 'плата за проезд', '/feə/'],
      ['fairy', 'фея', '/ˈfeəri/'],
      ['chair', 'стул', '/tʃeə/'],
    ],
  ],
  [
    'ʊə',
    'diphthong',
    'Традиционный гласный в tour',
    'Начните с расслабленного /ʊ/ и перейдите к /ə/. Этот звук особенно изменчив: tour, sure и insure у многих говорящих произносятся с /ɔː/. Оба варианта существуют.',
    'our: tour; ure: pure, sure (варианты произношения)',
    [
      ['insure', 'страховать', '/ɪnˈʃʊə/'],
      ['tour', 'гастрольная поездка', '/tʊə/'],
      ['tourist', 'турист', '/ˈtʊərɪst/'],
      ['pure', 'чистый; неподдельный', '/pjʊə/'],
      ['sure', 'уверенный', '/ʃʊə/'],
    ],
  ],
  [
    'p',
    'consonant',
    'Глухой губной взрывной',
    'Сомкните губы и отпустите воздух. В начале ударного слога часто есть лёгкий выдох, но не добавляйте после /p/ гласный.',
    'p; pp',
    [
      ['plan', 'план', '/plæn/'],
      ['plot', 'сюжет', '/plɒt/'],
      ['passport', 'паспорт', '/ˈpɑːspɔːt/'],
      ['page', 'страница', '/peɪdʒ/'],
      ['pen', 'ручка', '/pen/'],
    ],
  ],
  [
    'b',
    'consonant',
    'Звонкий губной взрывной',
    'Губы работают как для /p/, но подключается голос. Сохраните различие на конце слова: cab не должно превращаться в cap.',
    'b; bb',
    [
      ['bank', 'банк', '/bæŋk/'],
      ['blockbuster', 'кассовый фильм', '/ˈblɒkbʌstə/'],
      ['bag', 'сумка', '/bæɡ/'],
      ['book', 'книга', '/bʊk/'],
      ['bed', 'кровать', '/bed/'],
    ],
  ],
  [
    't',
    'consonant',
    'Глухой переднеязычный взрывной',
    'Коснитесь кончиком языка бугорков за верхними зубами. Не смягчайте согласный перед гласными, как в русском слове «тень».',
    't; tt',
    [
      ['team', 'команда', '/tiːm/'],
      ['take', 'дубль', '/teɪk/'],
      ['ticket', 'билет', '/ˈtɪkɪt/'],
      ['text', 'текст', '/tekst/'],
      ['table', 'стол', '/ˈteɪbəl/'],
    ],
  ],
  [
    'd',
    'consonant',
    'Звонкий переднеязычный взрывной',
    'Язык касается альвеол, как для /t/, но работает голос. В конце английского слова не нужно автоматически заменять его на /t/.',
    'd; dd',
    [
      ['deal', 'сделка', '/diːl/'],
      ['director', 'режиссёр', '/dɪˈrektə/'],
      ['departure', 'отправление', '/dɪˈpɑːtʃə/'],
      ['drama', 'драма', '/ˈdrɑːmə/'],
      ['dog', 'собака', '/dɒɡ/'],
    ],
  ],
  [
    'k',
    'consonant',
    'Глухой заднеязычный взрывной',
    'Задняя часть языка касается мягкого нёба и отпускает воздух. В начале ударного слога возможен лёгкий выдох.',
    'k; c перед a/o/u; ck',
    [
      ['cost', 'стоимость', '/kɒst/'],
      ['cast', 'актёрский состав', '/kɑːst/'],
      ['car', 'автомобиль', '/kɑː/'],
      ['character', 'персонаж', '/ˈkærəktə/'],
      ['key', 'ключ', '/kiː/'],
    ],
  ],
  [
    'ɡ',
    'consonant',
    'Звонкий заднеязычный взрывной',
    'Положение языка как для /k/, но включён голос. Символ /ɡ/ в IPA выглядит немного иначе, чем печатная буква g.',
    'g; gg; иногда gu',
    [
      ['goal', 'цель', '/ɡəʊl/'],
      ['guest', 'гость', '/ɡest/'],
      ['guide', 'гид', '/ɡaɪd/'],
      ['ghost', 'привидение', '/ɡəʊst/'],
      ['garden', 'сад', '/ˈɡɑːdən/'],
    ],
  ],
  [
    'f',
    'consonant',
    'Глухой губно-зубной',
    'Верхние зубы слегка касаются нижней губы, воздух проходит в узкую щель. Не подключайте голос.',
    'f; ff; ph',
    [
      ['fee', 'плата; гонорар', '/fiː/'],
      ['film', 'фильм', '/fɪlm/'],
      ['flight', 'рейс', '/flaɪt/'],
      ['fiction', 'художественная литература', '/ˈfɪkʃən/'],
      ['food', 'еда', '/fuːd/'],
    ],
  ],
  [
    'v',
    'consonant',
    'Звонкий губно-зубной',
    'Положение зубов и губ как для /f/, но с голосом. Не путайте с /w/: для /v/ зубы касаются губы.',
    'v',
    [
      ['value', 'ценность', '/ˈvæljuː/'],
      ['voice', 'голос', '/vɔɪs/'],
      ['visit', 'посещать', '/ˈvɪzɪt/'],
      ['verse', 'стих; строфа', '/vɜːs/'],
      ['vase', 'ваза', '/vɑːz/'],
    ],
  ],
  [
    'θ',
    'consonant',
    'Глухой межзубный',
    'Кончик языка слегка касается верхних зубов или показывается между зубами. Выдыхайте через щель без голоса. Это не /s/ и не /t/.',
    'th: think',
    [
      ['think', 'думать', '/θɪŋk/'],
      ['thriller', 'триллер', '/ˈθrɪlə/'],
      ['three', 'три', '/θriː/'],
      ['myth', 'миф', '/mɪθ/'],
      ['bath', 'ванна', '/bɑːθ/'],
    ],
  ],
  [
    'ð',
    'consonant',
    'Звонкий межзубный',
    'Язык расположен как для /θ/, но голосовые связки вибрируют. Произнесите медленно, не заменяя звук на /z/ или /d/.',
    'th: this, other',
    [
      ['other', 'другой', '/ˈʌðə/'],
      ['this', 'этот', '/ðɪs/'],
      ['weather', 'погода', '/ˈweðə/'],
      ['the', 'определённый артикль', '/ðə/'],
      ['mother', 'мама', '/ˈmʌðə/'],
    ],
  ],
  [
    's',
    'consonant',
    'Глухой свистящий',
    'Оставьте узкую щель между языком и альвеолами. Произнесите без голоса и без мягкого русского «сь».',
    's; ss; c перед e/i/y',
    [
      ['sale', 'продажа', '/seɪl/'],
      ['scene', 'сцена', '/siːn/'],
      ['seat', 'место; сиденье', '/siːt/'],
      ['sentence', 'предложение', '/ˈsentəns/'],
      ['sun', 'солнце', '/sʌn/'],
    ],
  ],
  [
    'z',
    'consonant',
    'Звонкий свистящий',
    'Положение языка как для /s/, но подключён голос. Буква s тоже может передавать этот звук. Не оглушайте его на конце.',
    'z; s: music',
    [
      ['zone', 'зона', '/zəʊn/'],
      ['music', 'музыка', '/ˈmjuːzɪk/'],
      ['visa', 'виза', '/ˈviːzə/'],
      ['prose', 'проза', '/prəʊz/'],
      ['zero', 'ноль', '/ˈzɪərəʊ/'],
    ],
  ],
  [
    'ʃ',
    'consonant',
    'Глухой шипящий',
    'Слегка округлите губы, поднимите переднюю часть языка. Английский /ʃ/ обычно мягче русского твёрдого «ш», но не равен «щ».',
    'sh; ti в -tion; ch в некоторых заимствованиях',
    [
      ['share', 'доля; акция', '/ʃeə/'],
      ['show', 'шоу', '/ʃəʊ/'],
      ['ship', 'корабль', '/ʃɪp/'],
      ['short', 'короткий', '/ʃɔːt/'],
      ['shoe', 'туфля', '/ʃuː/'],
    ],
  ],
  [
    'ʒ',
    'consonant',
    'Звонкий шипящий',
    'Положение языка близко к /ʃ/, но с голосом. Часто встречается в середине слов и в заимствованиях.',
    's: decision; si: television; g в genre',
    [
      ['decision', 'решение', '/dɪˈsɪʒən/'],
      ['television', 'телевидение', '/ˈtelɪvɪʒən/'],
      ['Asia', 'Азия', '/ˈeɪʒə/'],
      ['genre', 'жанр', '/ˈʒɒnrə/'],
      ['usually', 'обычно', '/ˈjuːʒuəli/'],
    ],
  ],
  [
    'h',
    'consonant',
    'Лёгкий выдох',
    'Пропустите воздух через открытое горло без сильного трения. Не превращайте /h/ в русское заднеязычное «х».',
    'h; но h немая в hour',
    [
      ['hire', 'нанимать', '/haɪə/'],
      ['hero', 'герой', '/ˈhɪərəʊ/'],
      ['hotel', 'отель', '/həʊˈtel/'],
      ['history', 'история', '/ˈhɪstəri/'],
      ['home', 'дом', '/həʊm/'],
    ],
  ],
  [
    'tʃ',
    'consonant',
    'Глухая аффриката',
    'Начните с короткой смычки /t/ и сразу перейдите в /ʃ/. Это один согласный звук в учебном разборе, а не два раздельных слога.',
    'ch; tch',
    [
      ['chart', 'диаграмма', '/tʃɑːt/'],
      ['watch', 'смотреть', '/wɒtʃ/'],
      ['check', 'проверять', '/tʃek/'],
      ['chapter', 'глава', '/ˈtʃæptə/'],
      ['chair', 'стул', '/tʃeə/'],
    ],
  ],
  [
    'dʒ',
    'consonant',
    'Звонкая аффриката',
    'Начните с /d/ и плавно отпустите воздух в /ʒ/. Подключите голос; не разделяйте звук гласным.',
    'j; g перед e/i/y в некоторых словах; dge',
    [
      ['job', 'работа', '/dʒɒb/'],
      ['stage', 'сцена; подмостки', '/steɪdʒ/'],
      ['journey', 'путешествие', '/ˈdʒɜːni/'],
      ['page', 'страница', '/peɪdʒ/'],
      ['juice', 'сок', '/dʒuːs/'],
    ],
  ],
  [
    'm',
    'consonant',
    'Губной носовой',
    'Сомкните губы и направьте звучащий воздух через нос. В конце слова не добавляйте гласный.',
    'm; mm',
    [
      ['meeting', 'встреча', '/ˈmiːtɪŋ/'],
      ['movie', 'фильм', '/ˈmuːvi/'],
      ['map', 'карта', '/mæp/'],
      ['poem', 'стихотворение', '/ˈpəʊɪm/'],
      ['milk', 'молоко', '/mɪlk/'],
    ],
  ],
  [
    'n',
    'consonant',
    'Переднеязычный носовой',
    'Кончик языка касается альвеол, воздух выходит через нос. Не смягчайте автоматически перед /iː/.',
    'n; nn; kn в начале слова: k немая',
    [
      ['name', 'имя', '/neɪm/'],
      ['scene', 'сцена', '/siːn/'],
      ['train', 'поезд', '/treɪn/'],
      ['novel', 'роман', '/ˈnɒvəl/'],
      ['night', 'ночь', '/naɪt/'],
    ],
  ],
  [
    'ŋ',
    'consonant',
    'Заднеязычный носовой',
    'Кончик языка не прижимается к зубам: работает задняя часть языка. В sing /sɪŋ/ не нужно добавлять /ɡ/, но в finger /ˈfɪŋɡə/ он есть.',
    'ng; n перед /k/ или /ɡ/',
    [
      ['meeting', 'встреча', '/ˈmiːtɪŋ/'],
      ['acting', 'актёрская игра', '/ˈæktɪŋ/'],
      ['booking', 'бронирование', '/ˈbʊkɪŋ/'],
      ['ending', 'концовка', '/ˈendɪŋ/'],
      ['sing', 'петь', '/sɪŋ/'],
    ],
  ],
  [
    'l',
    'consonant',
    'Боковой согласный',
    'Кончик языка касается альвеол, воздух идёт по бокам. Перед гласной звук обычно светлее, в конце слова — темнее. Не добавляйте гласный к final l.',
    'l; ll',
    [
      ['client', 'клиент', '/ˈklaɪənt/'],
      ['role', 'роль', '/rəʊl/'],
      ['luggage', 'багаж', '/ˈlʌɡɪdʒ/'],
      ['line', 'строка', '/laɪn/'],
      ['lamp', 'лампа', '/læmp/'],
    ],
  ],
  [
    'r',
    'consonant',
    'Английский аппроксимант',
    'Кончик языка приближается к области за альвеолами, но не вибрирует и не касается её. Не раскатывайте русское «р». В IPA английского часто используют /r/ вместо более узкого /ɹ/.',
    'r перед гласной; в UK обычно не звучит перед согласной',
    [
      ['report', 'отчёт', '/rɪˈpɔːt/'],
      ['review', 'рецензия', '/rɪˈvjuː/'],
      ['road', 'дорога', '/rəʊd/'],
      ['read', 'читать', '/riːd/'],
      ['red', 'красный', '/red/'],
    ],
  ],
  [
    'j',
    'consonant',
    'Согласный как в начале yes',
    'Поднимите среднюю часть языка к твёрдому нёбу и сразу переходите к гласному. Символ /j/ — не английская буква J, которая называется /dʒeɪ/.',
    'y; звук перед u в некоторых словах',
    [
      ['year', 'год', '/jɪə/'],
      ['music', 'музыка', '/ˈmjuːzɪk/'],
      ['Europe', 'Европа', '/ˈjʊərəp/'],
      ['young', 'молодой', '/jʌŋ/'],
      ['yes', 'да', '/jes/'],
    ],
  ],
  [
    'w',
    'consonant',
    'Губной аппроксимант',
    'Округлите губы, затем сразу перейдите к гласному. Верхние зубы не касаются нижней губы — этим /w/ отличается от /v/.',
    'w; qu обычно /kw/',
    [
      ['work', 'работать', '/wɜːk/'],
      ['award', 'награда', '/əˈwɔːd/'],
      ['way', 'путь', '/weɪ/'],
      ['word', 'слово', '/wɜːd/'],
      ['water', 'вода', '/ˈwɔːtə/'],
    ],
  ],
];
export const sounds: SoundEntry[] = soundSeeds.map(
  ([symbol, group, title, articulation, spelling, words], i) => ({
    id: `sound-${i + 1}`,
    symbol,
    group,
    title,
    articulation,
    spelling,
    examples: examples(words),
  }),
);
export const soundGroups: { id: SoundGroup; title: string; description: string }[] = [
  {
    id: 'short',
    title: 'Короткие гласные',
    description:
      'Семь звуков, включая безударный schwa. Отмечаем положение языка, а не только длительность.',
  },
  {
    id: 'long',
    title: 'Долгие гласные',
    description:
      'Пять устойчивых гласных. Знак ː — ориентир долготы, но качество гласного тоже меняется.',
  },
  {
    id: 'diphthong',
    title: 'Дифтонги',
    description:
      'Восемь гласных со скольжением: два положения органов речи в пределах одного слога.',
  },
  {
    id: 'consonant',
    title: 'Согласные',
    description: '24 согласных: следим за голосом, местом преграды и способом прохождения воздуха.',
  },
];
const extraWords: WordTuple[] = [
  ['apple', 'яблоко', '/ˈæpəl/'],
  ['email', 'электронное письмо', '/ˈiːmeɪl/'],
  ['egg', 'яйцо', '/eɡ/'],
  ['invoice', 'счёт на оплату', '/ˈɪnvɔɪs/'],
  ['image', 'изображение', '/ˈɪmɪdʒ/'],
  ['island', 'остров', '/ˈaɪlənd/'],
  ['ink', 'чернила', '/ɪŋk/'],
  ['ice', 'лёд', '/aɪs/'],
  ['joke', 'шутка', '/dʒəʊk/'],
  ['journal', 'журнал; дневник', '/ˈdʒɜːnəl/'],
  ['key', 'ключ', '/kiː/'],
  ['king', 'король', '/kɪŋ/'],
  ['kitchen', 'кухня', '/ˈkɪtʃɪn/'],
  ['loan', 'заём; ссуда', '/ləʊn/'],
  ['narrator', 'рассказчик', '/nəˈreɪtə/'],
  ['office', 'офис', '/ˈɒfɪs/'],
  ['Oscar', 'премия «Оскар»', '/ˈɒskə/'],
  ['opening', 'начало; открытие', '/ˈəʊpənɪŋ/'],
  ['orange', 'апельсин', '/ˈɒrɪndʒ/'],
  ['quote', 'цитата; ценовое предложение', '/kwəʊt/'],
  ['quest', 'поиск; приключенческая миссия', '/kwest/'],
  ['queue', 'очередь', '/kjuː/'],
  ['question', 'вопрос', '/ˈkwestʃən/'],
  ['update', 'обновление', '/ˈʌpdeɪt/'],
  ['universe', 'вселенная', '/ˈjuːnɪvɜːs/'],
  ['underground', 'метро', '/ˈʌndəɡraʊnd/'],
  ['underline', 'подчёркивать', '/ˌʌndəˈlaɪn/'],
  ['umbrella', 'зонт', '/ʌmˈbrelə/'],
  ['x-ray', 'рентгеновский снимок', '/ˈeksreɪ/'],
  ['yacht', 'яхта', '/jɒt/'],
  ['zombie', 'зомби', '/ˈzɒmbi/'],
  ['zoo', 'зоопарк', '/zuː/'],
  ['zebra', 'зебра', '/ˈzebrə/'],
  ['camera', 'камера', '/ˈkæmərə/'],
  ['title', 'заголовок; название', '/ˈtaɪtəl/'],
  ['know', 'знать', '/nəʊ/'],
  ['write', 'писать', '/raɪt/'],
  ['debt', 'долг', '/det/'],
  ['name', 'имя', '/neɪm/'],
  ['cap', 'кепка', '/kæp/'],
  ['cape', 'накидка', '/keɪp/'],
  ['not', 'не', '/nɒt/'],
  ['note', 'заметка', '/nəʊt/'],
  ['sit', 'сидеть', '/sɪt/'],
  ['site', 'сайт; место', '/saɪt/'],
  ['ship', 'корабль', '/ʃɪp/'],
  ['sheep', 'овца', '/ʃiːp/'],
  ['full', 'полный', '/fʊl/'],
  ['fool', 'глупец', '/fuːl/'],
  ['thin', 'тонкий', '/θɪn/'],
  ['sin', 'грех', '/sɪn/'],
  ['have', 'иметь', '/hæv/'],
  ['love', 'любовь', '/lʌv/'],
  ['give', 'давать', '/ɡɪv/'],
];
const passageExtras: WordTuple[] = [
  ['ready', 'готовый', '/ˈredi/'],
  ['one', 'один', '/wʌn/'],
  ['surprise', 'неожиданность', '/səˈpraɪz/'],
  ['good', 'хороший', '/ɡʊd/'],
];
extraWords.push(...passageExtras);
export function readingWord(context: ContextId, en: string): ReadingWord {
  const found = sounds.map((s) => s.examples[context]).find((w) => w.en === en);
  if (found) return found;
  const fallback = sounds
    .flatMap((s) => topicIds.map((id) => s.examples[id]))
    .find((w) => w.en === en);
  if (fallback) return fallback;
  const extra = extraWords.find((w) => w[0] === en);
  if (!extra) throw new Error(`Missing authored reading word: ${context}/${en}`);
  return { en: extra[0], ru: extra[1], ipa: extra[2] };
}
export type AlphabetEntry = {
  letter: string;
  lower: string;
  name: string;
  usName?: string;
  tip: string;
  examples: Record<ContextId, ReadingWord>;
};
type LetterSeed = [string, string, string, string[]];
const letterSeeds: LetterSeed[] = [
  [
    'A',
    '/eɪ/',
    'Название A и звук /æ/ в apple различаются. В сочетании a…e часто слышим /eɪ/: name.',
    ['account', 'actor', 'airport', 'author', 'apple'],
  ],
  [
    'B',
    '/biː/',
    'В начале bank буква передаёт /b/. В некоторых словах b немая: debt /det/.',
    ['bank', 'blockbuster', 'booking', 'book', 'bed'],
  ],
  [
    'C',
    '/siː/',
    'C часто даёт /k/ перед a/o/u и /s/ перед e/i/y. Сравните car и scene. Это ориентир, а не правило без исключений.',
    ['client', 'cast', 'car', 'chapter', 'cup'],
  ],
  [
    'D',
    '/diː/',
    'На конце слова сохраняйте отличие /d/ от /t/. Не добавляйте к согласному гласный.',
    ['deal', 'director', 'departure', 'drama', 'dog'],
  ],
  [
    'E',
    '/iː/',
    'Название E — /iː/. В закрытом слоге e часто читается /e/, а на конце name не звучит самостоятельно.',
    ['email', 'ending', 'Europe', 'ending', 'egg'],
  ],
  [
    'F',
    '/ef/',
    'F обычно передаёт /f/. Такой же звук может записываться ph: photo.',
    ['fee', 'film', 'flight', 'fiction', 'food'],
  ],
  [
    'G',
    '/dʒiː/',
    'Название G — /dʒiː/. В goal это /ɡ/, а перед e/i/y иногда /dʒ/: page. Guest — пример с твёрдым /ɡ/.',
    ['goal', 'guest', 'guide', 'ghost', 'garden'],
  ],
  [
    'H',
    '/eɪtʃ/',
    'В hotel слышен лёгкий /h/. Не все h звучат: hour начинается с гласного.',
    ['hire', 'hero', 'hotel', 'history', 'home'],
  ],
  [
    'I',
    '/aɪ/',
    'Не путайте I /aɪ/ и E /iː/. Название I похоже на местоимение I — «я».',
    ['invoice', 'image', 'island', 'ink', 'ice'],
  ],
  [
    'J',
    '/dʒeɪ/',
    'Не путайте J /dʒeɪ/ и G /dʒiː/. В слове job буква J передаёт /dʒ/.',
    ['job', 'joke', 'journey', 'journal', 'juice'],
  ],
  [
    'K',
    '/keɪ/',
    'В key буква K звучит. В начале сочетания kn она часто немая: know /nəʊ/.',
    ['key', 'key', 'key', 'king', 'kitchen'],
  ],
  [
    'L',
    '/el/',
    'В имени L сначала гласный, затем /l/. Сам согласный произносится с касанием языка к альвеолам.',
    ['loan', 'light', 'luggage', 'line', 'lamp'],
  ],
  [
    'M',
    '/em/',
    'Название начинается с гласного. В словах /m/ произносится с сомкнутыми губами и выходом воздуха через нос.',
    ['meeting', 'movie', 'map', 'myth', 'milk'],
  ],
  [
    'N',
    '/en/',
    'Для /n/ язык касается бугорков за зубами; для /ŋ/ в ending работает задняя часть языка.',
    ['name', 'narrator', 'near', 'novel', 'night'],
  ],
  [
    'O',
    '/əʊ/',
    'Британское название /əʊ/, американское /oʊ/. Это скользящий гласный, а не устойчивое русское «о».',
    ['office', 'Oscar', 'order', 'opening', 'orange'],
  ],
  [
    'P',
    '/piː/',
    'Название P — /piː/, но звук в словах — /p/. На выдохе не добавляйте /ə/.',
    ['plan', 'plot', 'passport', 'page', 'pen'],
  ],
  [
    'Q',
    '/kjuː/',
    'В большинстве обычных слов Q соседствует с u: question, quote. Сочетание qu часто даёт два звука /kw/.',
    ['quote', 'quest', 'queue', 'quote', 'question'],
  ],
  [
    'R',
    '/ɑː/',
    'Британское название /ɑː/, американское /ɑːr/. Перед гласной /r/ не раскатывается, как русское «р».',
    ['report', 'role', 'road', 'read', 'red'],
  ],
  [
    'S',
    '/es/',
    'Буква S может передавать /s/ или /z/. В сочетании sh обе буквы вместе передают /ʃ/.',
    ['sale', 'scene', 'seat', 'story', 'sun'],
  ],
  [
    'T',
    '/tiː/',
    'В ticket буква T передаёт /t/. Но th — отдельное сочетание: think /θɪŋk/.',
    ['team', 'take', 'ticket', 'text', 'table'],
  ],
  [
    'U',
    '/juː/',
    'Название содержит согласный /j/ и гласный /uː/. В cup сама буква u передаёт совершенно другой звук — /ʌ/.',
    ['update', 'universe', 'underground', 'underline', 'umbrella'],
  ],
  [
    'V',
    '/viː/',
    'Для /v/ верхние зубы касаются нижней губы. Это помогает отличить V от W.',
    ['value', 'voice', 'visa', 'verse', 'vase'],
  ],
  [
    'W',
    '/ˈdʌbəljuː/',
    'Название буквально значит double u — «двойная u». В словах звук /w/ произносится без касания зубами губы.',
    ['work', 'watch', 'way', 'word', 'water'],
  ],
  [
    'X',
    '/eks/',
    'В названии X два согласных: /k/ и /s/. X-ray — удобное слово на X; оно встречается в медицине, сюжетах и при досмотре багажа.',
    ['x-ray', 'x-ray', 'x-ray', 'x-ray', 'x-ray'],
  ],
  [
    'Y',
    '/waɪ/',
    'В начале yes буква Y — согласный /j/. В myth она передаёт гласный /ɪ/, а в my — /aɪ/.',
    ['year', 'young', 'yacht', 'young', 'yes'],
  ],
  [
    'Z',
    '/zed/',
    'В Великобритании — zed /zed/, в США — zee /ziː/. Оба названия правильные; в словах обычно слышим /z/.',
    ['zone', 'zombie', 'zoo', 'zebra', 'zero'],
  ],
];
export const alphabet: AlphabetEntry[] = letterSeeds.map(([letter, name, tip, words]) => ({
  letter,
  lower: letter.toLowerCase(),
  name,
  usName: letter === 'Z' ? '/ziː/' : letter === 'R' ? '/ɑːr/' : letter === 'O' ? '/oʊ/' : undefined,
  tip,
  examples: Object.fromEntries(topicIds.map((id, i) => [id, readingWord(id, words[i])])) as Record<
    ContextId,
    ReadingWord
  >,
}));
export const readingPassages: Record<
  ContextId,
  { title: string; lines: { en: string; ru: string }[]; task: string }
> = {
  business: {
    title: 'Первое утро в офисе',
    lines: [
      { en: 'Our team has a goal.', ru: 'У нашей команды есть цель.' },
      { en: 'The plan is on the desk.', ru: 'План лежит на столе.' },
      { en: 'We check the price and the cost.', ru: 'Мы проверяем цену и стоимость.' },
      { en: 'Then we make a decision.', ru: 'Затем мы принимаем решение.' },
    ],
    task: 'Найдите долгий гласный в team, дифтонг в goal и безударный schwa в decision. Произнесите конечные согласные в desk без добавочного гласного.',
  },
  movies: {
    title: 'На съёмочной площадке',
    lines: [
      { en: 'The actor is on the set.', ru: 'Актёр на съёмочной площадке.' },
      { en: 'A light is near the camera.', ru: 'Рядом с камерой находится источник света.' },
      { en: 'The crew is ready.', ru: 'Съёмочная группа готова.' },
      { en: 'This scene is short.', ru: 'Эта сцена короткая.' },
    ],
    task: 'Сравните гласные в film и scene. Найдите /aɪ/ в light, /uː/ в crew и /ð/ в this. Читайте фразы небольшими смысловыми группами.',
  },
  travel: {
    title: 'Маршрут начинается здесь',
    lines: [
      { en: 'The train is near the airport.', ru: 'Поезд находится недалеко от аэропорта.' },
      { en: 'I have a ticket and a map.', ru: 'У меня есть билет и карта.' },
      { en: 'My bag is in the car.', ru: 'Моя сумка в машине.' },
      { en: 'The hotel room is ready.', ru: 'Номер в отеле готов.' },
    ],
    task: 'Найдите /eɪ/ в train, /æ/ в map и /uː/ в room. В hotel ударение падает на второй слог: /həʊˈtel/.',
  },
  books: {
    title: 'Внутри новой истории',
    lines: [
      { en: 'This book has a short title.', ru: 'У этой книги короткое название.' },
      { en: 'The story is about a young hero.', ru: 'История о молодом герое.' },
      { en: 'I read one page at night.', ru: 'Я читаю одну страницу на ночь.' },
      { en: 'The ending is a surprise.', ru: 'Концовка неожиданная.' },
    ],
    task: 'Сравните /ʊ/ в book и /iː/ в read. Найдите дифтонги в page и night. В ending не добавляйте отдельный /ɡ/ после /ŋ/.',
  },
  everyday: {
    title: 'Маленькие детали дня',
    lines: [
      { en: 'The cat is on the bed.', ru: 'Кот на кровати.' },
      { en: 'A cup of tea is on the table.', ru: 'Чашка чая стоит на столе.' },
      { en: 'I have a pen and a book.', ru: 'У меня есть ручка и книга.' },
      { en: 'It is a good day.', ru: 'Сегодня хороший день.' },
    ],
    task: 'Сравните /æ/ в cat и /e/ в bed. Найдите /ʌ/ в cup, /iː/ в tea и /ʊ/ в book. Сначала прочитайте слова, затем соедините их в фразы.',
  },
};
const passageKeywords: Record<ContextId, string[]> = {
  business: ['team', 'goal', 'plan', 'desk', 'check', 'price', 'cost', 'decision'],
  movies: ['actor', 'set', 'light', 'near', 'camera', 'crew', 'ready', 'scene', 'short'],
  travel: ['train', 'near', 'airport', 'ticket', 'map', 'bag', 'car', 'hotel', 'room', 'ready'],
  books: [
    'book',
    'short',
    'title',
    'story',
    'about',
    'young',
    'hero',
    'read',
    'one',
    'page',
    'night',
    'ending',
    'surprise',
  ],
  everyday: ['cat', 'bed', 'cup', 'tea', 'table', 'pen', 'book', 'good', 'day'],
};
export function toVocabularyWord(
  word: ReadingWord,
  context: ContextId,
  lessonId: string,
): LessonContext['words'][number] {
  return {
    id: `${lessonId}-${context}-${word.en.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    en: word.en,
    ru: word.ru,
    ipa: word.ipa,
    part: 'слово / выражение',
    level: 'A1',
    topic: context,
    example:
      readingPassages[context].lines.find((l) =>
        l.en
          .toLowerCase()
          .split(/[^a-z-]+/)
          .includes(word.en.toLowerCase()),
      )?.en || word.en,
    translation:
      readingPassages[context].lines.find((l) =>
        l.en
          .toLowerCase()
          .split(/[^a-z-]+/)
          .includes(word.en.toLowerCase()),
      )?.ru || word.ru,
  };
}
function uniqueWords(words: ReadingWord[]) {
  return words.filter((w, i, a) => a.findIndex((x) => x.en === w.en) === i);
}
function alphabetExercises(context: ContextId): Exercise[] {
  return alphabet.map((entry, i) => {
    const common = {
      id: `alphabet-${context}-letter-${entry.letter}`,
      hints: [
        'Название буквы и звук в слове — разные вещи.',
        entry.tip,
        `Сверьтесь с карточкой ${entry.letter}${entry.lower} в таблице алфавита.`,
      ],
      explanation: `${entry.letter}${entry.lower}: ${entry.name}${entry.usName ? ` (в США ${entry.usName})` : ''}. ${entry.tip}`,
      skill: 'Vocabulary' as const,
    };
    if (i % 4 === 0)
      return {
        ...common,
        type: 'choice',
        prompt: `Как называется буква ${entry.letter}? Выберите британскую IPA-запись.`,
        answers: [entry.name],
        options: [alphabet[(i + 3) % 26].name, entry.name, alphabet[(i + 7) % 26].name],
      };
    if (i % 4 === 1) {
      const prev = alphabet[i - 1].letter;
      const next = alphabet[(i + 1) % 26].letter;
      return {
        ...common,
        type: 'blank',
        prompt: `Продолжите алфавит: ${prev}, ___, ${next}. Напишите пропущенную букву.`,
        answers: [entry.letter],
      };
    }
    if (i % 4 === 2) {
      const w = entry.examples[context];
      return {
        ...common,
        type: 'dictation',
        prompt:
          'Прослушайте слово из вашей темы и запишите его буквами. В таблице алфавита есть это слово.',
        audio: w.en,
        answers: [w.en],
        skill: 'Listening' as const,
        hints: [
          `Значение: ${w.ru}`,
          `Первая буква: ${entry.letter}`,
          `Начало слова: ${w.en.slice(0, Math.max(1, Math.floor(w.en.length / 2)))}…`,
        ],
        explanation: `${w.en} ${w.ipa} — ${w.ru}. ${entry.tip}`,
      };
    }
    const start = Math.max(0, i - 3);
    const segment = alphabet.slice(start, start + 4).map((a) => a.letter);
    return {
      ...common,
      type: 'order',
      prompt: 'Расставьте четыре буквы в алфавитном порядке.',
      answers: [segment.join(' ')],
      tokens: [segment[2], segment[0], segment[3], segment[1]],
    };
  });
}
function soundExercises(context: ContextId): Exercise[] {
  return sounds.map((entry, i) => {
    const word = entry.examples[context];
    const common = {
      id: `reading-${context}-${entry.id}`,
      hints: [
        entry.articulation,
        `Подсказка по написанию: ${entry.spelling}`,
        `Слово из таблицы: ${word.en} — ${word.ru}`,
      ],
      explanation: `${word.en} ${word.ipa}: ищем /${entry.symbol}/. ${entry.articulation}`,
      skill: 'Listening' as const,
    };
    if (i % 3 === 0) {
      const distractors = uniqueWords(
        sounds
          .filter((s) => !s.examples[context].ipa.includes(entry.symbol))
          .map((s) => s.examples[context]),
      ).slice(0, 2);
      return {
        ...common,
        type: 'choice',
        prompt: `В каком слове есть звук /${entry.symbol}/?`,
        answers: [word.en],
        options:
          i % 2
            ? [...distractors.map((w) => w.en), word.en]
            : [word.en, ...distractors.map((w) => w.en)],
      };
    }
    if (i % 3 === 1)
      return {
        ...common,
        type: 'dictation',
        prompt: 'Прослушайте слово и запишите его. Обратите внимание на сочетания букв и ударение.',
        audio: word.en,
        answers: [word.en],
        hints: [`Значение: ${word.ru}`, entry.spelling, `Первая буква: ${word.en[0]}`],
      };
    return {
      ...common,
      type: 'choice',
      prompt: `Сравните запись ${word.en} ${word.ipa}. Какой из этих звуков есть в слове?`,
      answers: [`/${entry.symbol}/`],
      options: [
        ...sounds
          .filter((s) => !word.ipa.includes(s.symbol))
          .slice(0, 2)
          .map((s) => `/${s.symbol}/`),
        `/${entry.symbol}/`,
      ],
    };
  });
}
export function enrichPhonicsLesson(lesson: Lesson): Lesson {
  if (!['alphabet', 'reading'].includes(lesson.id)) return lesson;
  const isAlphabet = lesson.id === 'alphabet';
  return {
    ...lesson,
    minutes: isAlphabet ? 35 : 55,
    subtitle: isAlphabet
      ? 'Все 26 букв: узнаём, называем, складываем в слова.'
      : '44 звука, понятная IPA и первые самостоятельные чтения.',
    contexts: topicIds.map((id) => {
      const words = uniqueWords([
        ...(isAlphabet ? alphabet.map((a) => a.examples[id]) : sounds.map((s) => s.examples[id])),
        ...passageKeywords[id].map((en) => readingWord(id, en)),
      ]);
      return {
        id,
        words: words.map((w) => toVocabularyWord(w, id, lesson.id)),
        examples: readingPassages[id].lines,
        exercises: isAlphabet ? alphabetExercises(id) : soundExercises(id),
      };
    }),
  };
}
