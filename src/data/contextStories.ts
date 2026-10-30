import type { ContextId } from '../types';
type Pair = [string, string];
const packs = (
  business: Pair[],
  movies: Pair[],
  travel: Pair[],
  books: Pair[],
  everyday: Pair[],
) => ({ business, movies, travel, books, everyday });
export const contextStories: Record<string, Record<ContextId, Pair[]>> = {
  pronouns: packs(
    [
      ['We work in the same team.', 'Мы работаем в одной команде.'],
      ['It is our office.', 'Это наш офис.'],
    ],
    [
      ['They are in the same film.', 'Они в одном фильме.'],
      ['We like this actor.', 'Нам нравится этот актёр.'],
    ],
    [
      ['They are at the station.', 'Они на вокзале.'],
      ['It is our train.', 'Это наш поезд.'],
    ],
    [
      ['She writes short stories.', 'Она пишет короткие рассказы.'],
      ['We read them together.', 'Мы читаем их вместе.'],
    ],
    [
      ['He is my friend.', 'Он мой друг.'],
      ['They live near us.', 'Они живут рядом с нами.'],
    ],
  ),
  'to-be': packs(
    [
      ['Is the manager in the office?', 'Менеджер в офисе?'],
      ['The clients are not ready.', 'Клиенты не готовы.'],
    ],
    [
      ['Are the actors ready?', 'Актёры готовы?'],
      ['The cinema is not far.', 'Кинотеатр недалеко.'],
    ],
    [
      ['Is this your ticket?', 'Это ваш билет?'],
      ['The hotel rooms are clean.', 'Номера в отеле чистые.'],
    ],
    [
      ['Is this novel interesting?', 'Этот роман интересный?'],
      ['The author is not here.', 'Автора здесь нет.'],
    ],
    [
      ['Are you at home?', 'Ты дома?'],
      ['The tea is not hot.', 'Чай не горячий.'],
    ],
  ),
  articles: packs(
    [
      ['He has a new laptop.', 'У него новый ноутбук.'],
      ['We need an answer.', 'Нам нужен ответ.'],
    ],
    [
      ['She is a talented actor.', 'Она талантливая актриса.'],
      ['It is an old film.', 'Это старый фильм.'],
    ],
    [
      ['We need a map.', 'Нам нужна карта.'],
      ['There is an island nearby.', 'Рядом есть остров.'],
    ],
    [
      ['She has a short novel.', 'У неё есть короткий роман.'],
      ['He is an excellent writer.', 'Он превосходный писатель.'],
    ],
    [
      ['It is a blue cup.', 'Это синяя чашка.'],
      ['I have an umbrella.', 'У меня есть зонт.'],
    ],
  ),
  'there-is': packs(
    [
      ['Are there any chairs in the office?', 'В офисе есть стулья?'],
      ['There is a report on the desk.', 'На столе лежит отчёт.'],
    ],
    [
      ['There are three films on the programme.', 'В программе три фильма.'],
      ['Is there a cinema near the hotel?', 'Рядом с отелем есть кинотеатр?'],
    ],
    [
      ['There are buses at the airport.', 'В аэропорту есть автобусы.'],
      ['There is not a train today.', 'Сегодня нет поезда.'],
    ],
    [
      ['Are there any novels on the shelf?', 'На полке есть романы?'],
      ['There is a short story in this book.', 'В этой книге есть короткий рассказ.'],
    ],
    [
      ['There are two cups on the table.', 'На столе две чашки.'],
      ['There is some milk in the fridge.', 'В холодильнике есть молоко.'],
    ],
  ),
  'present-simple': packs(
    [
      ['Our team checks the budget every week.', 'Наша команда проверяет бюджет каждую неделю.'],
      ['I usually write reports in the morning.', 'Обычно я пишу отчёты утром.'],
    ],
    [
      ['The director often works at night.', 'Режиссёр часто работает ночью.'],
      ['We watch a new film on Fridays.', 'По пятницам мы смотрим новый фильм.'],
    ],
    [
      ['He always books a room in advance.', 'Он всегда бронирует номер заранее.'],
      ['They usually travel by bus.', 'Обычно они путешествуют на автобусе.'],
    ],
    [
      ['The author writes every morning.', 'Автор пишет каждое утро.'],
      ['We usually read before dinner.', 'Обычно мы читаем перед ужином.'],
    ],
    [
      ['My brother cooks on Sundays.', 'Мой брат готовит по воскресеньям.'],
      ['I usually drink tea at home.', 'Обычно я пью чай дома.'],
    ],
  ),
  'present-questions': packs(
    [
      ['Do your clients work on Fridays?', 'Ваши клиенты работают по пятницам?'],
      ['Our manager does not travel often.', 'Наш менеджер нечасто путешествует.'],
    ],
    [
      ['Does the actor like this role?', 'Актёру нравится эта роль?'],
      ['We do not watch television every day.', 'Мы не смотрим телевизор каждый день.'],
    ],
    [
      ['Where do you buy tickets?', 'Где вы покупаете билеты?'],
      ['He does not like long flights.', 'Он не любит долгие перелёты.'],
    ],
    [
      ['What does she read in the evening?', 'Что она читает вечером?'],
      ['They do not buy books online.', 'Они не покупают книги онлайн.'],
    ],
    [
      ['When do you have breakfast?', 'Когда ты завтракаешь?'],
      ['She does not work at night.', 'Она не работает ночью.'],
    ],
  ),
  everyday: packs(
    [
      ['Could I have the report, please?', 'Можно мне отчёт, пожалуйста?'],
      ['Thank you for your time.', 'Спасибо за ваше время.'],
    ],
    [
      ['I would like two tickets, please.', 'Я хотел бы два билета, пожалуйста.'],
      ['Could you say that again, please?', 'Повторите, пожалуйста.'],
    ],
    [
      ['Can I have a room for one night, please?', 'Можно мне номер на одну ночь, пожалуйста?'],
      ['Excuse me, where is the bus stop?', 'Извините, где автобусная остановка?'],
    ],
    [
      ['I would like a book in English.', 'Я хотел бы книгу на английском.'],
      ['Can I have this novel, please?', 'Можно мне этот роман, пожалуйста?'],
    ],
    [
      ['Could I have some milk, please?', 'Можно мне молока, пожалуйста?'],
      ['Thank you. Have a good day!', 'Спасибо. Хорошего дня!'],
    ],
  ),
  'present-continuous': packs(
    [
      ['Are they discussing the budget?', 'Они обсуждают бюджет?'],
      ['I am not working in the office today.', 'Сегодня я не работаю в офисе.'],
    ],
    [
      ['The actor is learning his lines.', 'Актёр учит свои реплики.'],
      ['We are not watching television now.', 'Сейчас мы не смотрим телевизор.'],
    ],
    [
      ['Is she looking for the hotel?', 'Она ищет отель?'],
      ['They are boarding the plane.', 'Они садятся в самолёт.'],
    ],
    [
      ['The author is writing a new chapter.', 'Автор пишет новую главу.'],
      ['Are you reading this novel?', 'Ты читаешь этот роман?'],
    ],
    [
      ['She is cooking dinner at the moment.', 'В данный момент она готовит ужин.'],
      ['I am not drinking coffee now.', 'Сейчас я не пью кофе.'],
    ],
  ),
  'past-simple': packs(
    [
      ['Did the client call yesterday?', 'Клиент звонил вчера?'],
      ['We did not work last Saturday.', 'Мы не работали в прошлую субботу.'],
    ],
    [
      ['The actor won an award last year.', 'Актёр получил награду в прошлом году.'],
      ['Did you watch the film last night?', 'Ты смотрел фильм вчера вечером?'],
    ],
    [
      ['We took a train to Oxford.', 'Мы поехали в Оксфорд на поезде.'],
      ['They did not stay at that hotel.', 'Они не останавливались в том отеле.'],
    ],
    [
      ['Did she finish the novel?', 'Она дочитала роман?'],
      ['I found the book in the library.', 'Я нашёл книгу в библиотеке.'],
    ],
    [
      ['He made tea after dinner.', 'Он приготовил чай после ужина.'],
      ['We did not go out yesterday.', 'Мы не выходили из дома вчера.'],
    ],
  ),
  'present-perfect': packs(
    [
      ['Have you checked the latest report?', 'Ты проверил последний отчёт?'],
      ['We have not made a decision yet.', 'Мы ещё не приняли решение.'],
    ],
    [
      [
        'Have you ever watched this director’s films?',
        'Ты когда-нибудь смотрел фильмы этого режиссёра?',
      ],
      ['The film has already started.', 'Фильм уже начался.'],
    ],
    [
      ['They have just booked their tickets.', 'Они только что забронировали билеты.'],
      ['I have never travelled by ship.', 'Я никогда не путешествовал на корабле.'],
    ],
    [
      ['Have you finished this chapter yet?', 'Ты уже закончил эту главу?'],
      ['The author has written three novels.', 'Автор написал три романа.'],
    ],
    [
      ['I have already had breakfast.', 'Я уже позавтракал.'],
      ['She has not come home yet.', 'Она ещё не пришла домой.'],
    ],
  ),
};
