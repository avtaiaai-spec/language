import type { AppState, WordReview, StudySession, Exercise } from '../types';
export function normalizeAnswer(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\b(can't)\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(
      /\b(does|do|did|is|are|was|were|has|have|had|could|would|should|must)n['’]t\b/g,
      '$1 not',
    )
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\b(he|she|it|that|there)'s\b/g, '$1 is')
    .replace(/\b(you|we|they)'re\b/g, '$1 are')
    .replace(/\b(i|you|we|they)'ve\b/g, '$1 have')
    .replace(/[.,!?;:"“”«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export function checkAnswer(answer: string, accepted: string[]) {
  return !!answer.trim() && accepted.some((a) => normalizeAnswer(a) === normalizeAnswer(answer));
}
// SM-2 adaptation: 0=again, 1=hard, 2=good, 3=easy. Hard repeats tomorrow.
export function scheduleReview(old: WordReview, quality: number, now = Date.now()): WordReview {
  const q = [1, 3, 4, 5][Math.max(0, Math.min(3, quality))];
  const ease = Math.max(1.3, old.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const repetitions = quality === 0 ? 0 : old.repetitions + 1;
  const interval =
    quality === 0
      ? 0
      : quality === 1
        ? 1
        : repetitions === 1
          ? quality === 3
            ? 4
            : 1
          : repetitions === 2
            ? 6
            : Math.round(old.interval * ease * (quality === 3 ? 1.3 : 1));
  return {
    ease,
    repetitions,
    interval,
    due: now + (quality === 0 ? 600000 : interval * 86400000),
    history: [...old.history, { at: now, quality }],
  };
}
export function newReview(now = Date.now()): WordReview {
  return { repetitions: 0, interval: 0, ease: 2.5, due: now, history: [] };
}
export function sessionScore(s: Pick<StudySession, 'correct' | 'total' | 'hintCount'>) {
  return s.total
    ? Math.max(0, Math.round((s.correct / s.total) * 100 - Math.min(20, s.hintCount * 2)))
    : 0;
}
export function getStats(state: AppState, now = Date.now()) {
  const attempts = state.attempts;
  return {
    completed: Object.keys(state.progress).length,
    correct: attempts.filter((a) => a.correct).length,
    total: attempts.length,
    accuracy: attempts.length
      ? Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100)
      : 0,
    seconds: state.sessions.reduce((n, s) => n + s.seconds, 0),
    learned: state.vocabulary.filter((w) => w.review.repetitions >= 5).length,
    due: state.vocabulary.filter((w) => w.review.due <= now).length,
  };
}
export const dayKey = (at: number) => {
  const d = new Date(at);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
export function weekActivity(sessions: StudySession[], now = Date.now()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 6 + i);
    return {
      date: d,
      seconds: sessions
        .filter((s) => dayKey(s.at) === dayKey(d.getTime()))
        .reduce((n, s) => n + s.seconds, 0),
    };
  });
}
// Conservative starting-route recommendation, not a calibrated CEFR assessment.
// Questions 1–2: A1; 3–4: A2; 5–6: B1; 7–8: B2.
// Advanced vocabulary/grammar answers cannot compensate for missing foundations.
export function placementLevel(correct: boolean[]): 'A1' | 'A2' | 'B1' | 'B2' {
  if (correct.length !== 12) return 'A1';
  const count = (start: number, end: number) => correct.slice(start, end).filter(Boolean).length;
  const total = count(0, 12);
  const foundation = count(0, 4);
  if (foundation < 3 || count(0, 2) < 1 || total < 4) return 'A1';
  if (count(4, 6) !== 2 || total < 7) return 'A2';
  if (count(0, 6) < 5 || count(6, 8) !== 2 || total < 10) return 'B1';
  return 'B2';
}
export interface AdvancedAnswerService {
  evaluate(exercise: Exercise, answer: string): Promise<{ correct: boolean; explanation: string }>;
}
