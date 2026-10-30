import { z } from 'zod';
import type { AppState } from '../types';
import { initialWords } from '../data/curriculum';
import { newReview } from './learning';
const level = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const context = z.enum(['business', 'movies', 'travel', 'books', 'everyday']);
const finite = z.number().finite();
const count = finite.int().nonnegative();
const review = z.object({
  repetitions: count,
  interval: finite.nonnegative(),
  ease: finite.min(1.3),
  due: finite,
  history: z.array(z.object({ at: finite, quality: finite.min(0).max(3) })),
});
const exercise = z.object({
  id: z.string(),
  type: z.enum([
    'en-ru',
    'ru-en',
    'translation',
    'order',
    'blank',
    'choice',
    'dictation',
    'mistake',
  ]),
  prompt: z.string(),
  answers: z.array(z.string()).min(1),
  options: z.array(z.string()).optional(),
  tokens: z.array(z.string()).optional(),
  audio: z.string().optional(),
  hints: z.array(z.string()),
  explanation: z.string(),
  skill: z.enum(['Vocabulary', 'Grammar', 'Listening', 'Writing']),
});
const attempt = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  lessonId: z.string(),
  context,
  prompt: z.string(),
  answer: z.string(),
  expected: z.string(),
  correct: z.boolean(),
  hints: count,
  at: finite,
  skill: z.enum(['Vocabulary', 'Grammar', 'Listening', 'Writing']),
});
export const stateSchema = z
  .object({
    version: z.literal(1),
    profile: z.object({
      name: z.string().max(100),
      level,
      goals: z.array(z.string()),
      onboarding: z.boolean(),
    }),
    settings: z.object({
      contexts: z.array(context).min(1),
      dailyGoal: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(30)]),
      accent: z.enum(['en-US', 'en-GB']),
      rate: z.union([z.literal(0.75), z.literal(1), z.literal(1.25)]),
      theme: z.enum(['dark', 'light', 'system']),
    }),
    vocabulary: z.array(
      z.object({
        id: z.string(),
        en: z.string().min(1),
        ru: z.string().min(1),
        ipa: z.string(),
        part: z.string(),
        level,
        topic: context,
        example: z.string(),
        translation: z.string(),
        addedAt: finite,
        favorite: z.boolean(),
        custom: z.boolean().optional(),
        collectionIds: z.array(z.string()),
        review,
      }),
    ),
    collections: z.array(z.object({ id: z.string(), name: z.string().min(1) })),
    progress: z.record(
      z.string(),
      z.object({
        lessonId: z.string(),
        completedAt: finite,
        bestScore: finite.min(0).max(100),
        runs: count,
      }),
    ),
    attempts: z.array(attempt),
    sessions: z.array(
      z.object({
        id: z.string(),
        lessonId: z.string(),
        at: finite,
        seconds: finite.nonnegative(),
        total: count,
        correct: count,
        hintCount: count,
        kind: z.enum(['lesson', 'mixed', 'listening']),
      }),
    ),
    listeningAttempts: z.array(
      z.object({
        materialId: z.string(),
        sessionId: z.string(),
        at: finite,
        correct: count,
        total: count,
      }),
    ),
    active: z
      .object({
        id: z.string(),
        lessonId: z.string(),
        context,
        exercises: z.array(exercise).min(1),
        index: count,
        attempts: z.array(attempt),
        startedAt: finite,
        elapsed: finite.nonnegative(),
        kind: z.enum(['lesson', 'mixed', 'listening']),
        feedback: attempt.optional(),
        draft: z.string(),
        selected: z.array(count),
        hintCount: count,
      })
      .nullable(),
    lastLesson: z.string().nullable(),
    updatedAt: finite,
  })
  .superRefine((s, ctx) => {
    if (s.active && s.active.index >= s.active.exercises.length)
      ctx.addIssue({ code: 'custom', message: 'Некорректный шаг занятия' });
    if (s.sessions.some((x) => x.correct > x.total))
      ctx.addIssue({ code: 'custom', message: 'Некорректный результат' });
  });
export const STORAGE_KEY = 'english-studio:v1';
export function freshState(): AppState {
  const now = Date.now();
  return {
    version: 1,
    profile: { name: '', level: 'A1', goals: [], onboarding: false },
    settings: { contexts: ['everyday'], dailyGoal: 15, accent: 'en-GB', rate: 1, theme: 'dark' },
    vocabulary: initialWords.map((w) => ({
      ...w,
      addedAt: now,
      favorite: false,
      collectionIds: [],
      review: newReview(now),
    })),
    collections: [],
    progress: {},
    attempts: [],
    sessions: [],
    listeningAttempts: [],
    active: null,
    lastLesson: null,
    updatedAt: now,
  };
}
export function parseBackup(text: string): AppState {
  if (text.length > 10_000_000) throw new Error('Файл слишком большой (максимум 10 МБ).');
  const result = stateSchema.safeParse(JSON.parse(text));
  if (!result.success) throw new Error('Структура резервной копии не подходит для English Studio.');
  return result.data as AppState;
}
export function loadState(): { state: AppState; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { state: raw ? parseBackup(raw) : freshState() };
  } catch {
    return {
      state: freshState(),
      error:
        'Сохранённые данные недоступны или повреждены. Автосохранение приостановлено. Экспортируйте исходные данные в настройках или восстановите резервную копию.',
    };
  }
}
export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
