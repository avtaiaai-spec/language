import type { ActiveSession, ContextId, Exercise, StudySession, AppState } from '../types';
import { sessionScore } from './learning';
export function createSession(
  lessonId: string,
  context: ContextId,
  exercises: Exercise[],
  kind: StudySession['kind'] = 'lesson',
): ActiveSession {
  return {
    id: crypto.randomUUID(),
    lessonId,
    context,
    exercises,
    index: 0,
    attempts: [],
    startedAt: Date.now(),
    elapsed: 0,
    kind,
    draft: '',
    selected: [],
    hintCount: 0,
  };
}
export function finishSession(state: AppState, active: ActiveSession): AppState {
  if (state.sessions.some((s) => s.id === active.id)) return { ...state, active: null };
  const session: StudySession = {
    id: active.id,
    lessonId: active.lessonId,
    at: Date.now(),
    seconds: active.elapsed,
    total: active.attempts.length,
    correct: active.attempts.filter((a) => a.correct).length,
    hintCount: active.attempts.reduce((n, a) => n + a.hints, 0),
    kind: active.kind,
  };
  const previous = state.progress[active.lessonId];
  return {
    ...state,
    active: null,
    sessions: [...state.sessions, session],
    progress:
      active.kind === 'lesson'
        ? {
            ...state.progress,
            [active.lessonId]: {
              lessonId: active.lessonId,
              completedAt: session.at,
              bestScore: Math.max(previous?.bestScore || 0, sessionScore(session)),
              runs: (previous?.runs || 0) + 1,
            },
          }
        : state.progress,
    listeningAttempts:
      active.kind === 'listening'
        ? [
            ...state.listeningAttempts,
            {
              materialId: active.lessonId,
              sessionId: active.id,
              at: session.at,
              correct: session.correct,
              total: session.total,
            },
          ]
        : state.listeningAttempts,
  };
}
