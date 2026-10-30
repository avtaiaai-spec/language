import { describe, it, expect, vi } from 'vitest';
import {
  checkAnswer,
  normalizeAnswer,
  scheduleReview,
  newReview,
  getStats,
  placementLevel,
  sessionScore,
  weekActivity,
} from './learning';
import { freshState, parseBackup } from './storage';
import { createSession, finishSession } from './sessions';
import { lessons, contexts } from '../data/curriculum';
import { listeningMaterials } from '../data/listening';
describe('answer checker', () => {
  it('normalizes case, whitespace, punctuation and contractions', () => {
    expect(checkAnswer('  SHE   DOESN’T work here! ', ['She does not work here.'])).toBe(true);
    expect(checkAnswer("I'm at home", ['I am at home.'])).toBe(true);
    expect(checkAnswer('ЧАЙ!', ['чай'])).toBe(true);
    expect(checkAnswer('She works', ['She works.'])).toBe(true);
  });
  it('accepts explicit translation alternatives and rejects errors', () => {
    expect(checkAnswer('любить', ['нравиться', 'любить'])).toBe(true);
    expect(checkAnswer('She work', ['She works'])).toBe(false);
    expect(checkAnswer('', [''])).toBe(false);
    expect(normalizeAnswer('ship')).not.toBe(normalizeAnswer('sheep'));
    expect(checkAnswer('he is not working', ['he is working'])).toBe(false);
  });
});
describe('review scheduling', () => {
  it('returns failed words after ten minutes and resets repetition count', () => {
    const now = 1000;
    const r = scheduleReview({ ...newReview(0), repetitions: 6, interval: 30 }, 0, now);
    expect(r.due).toBe(now + 600000);
    expect(r.repetitions).toBe(0);
    expect(r.history).toEqual([{ at: now, quality: 0 }]);
  });
  it('grows good intervals and keeps ease above minimum', () => {
    let r = newReview(0);
    r = scheduleReview(r, 2, 0);
    expect(r.interval).toBe(1);
    r = scheduleReview(r, 2, 0);
    expect(r.interval).toBe(6);
    r = scheduleReview(r, 2, 0);
    expect(r.interval).toBeGreaterThan(6);
    for (let i = 0; i < 30; i++) r = scheduleReview(r, 1, 0);
    expect(r.ease).toBeGreaterThanOrEqual(1.3);
    expect(r.interval).toBe(1);
  });
  it('schedules easy later than good, without mutating prior history', () => {
    const old = newReview(0);
    expect(scheduleReview(old, 3, 0).due).toBeGreaterThan(scheduleReview(old, 2, 0).due);
    expect(old.history).toHaveLength(0);
  });
});
describe('curriculum integrity', () => {
  it('provides twelve lessons, five context packs each, and eight real types', () => {
    expect(lessons).toHaveLength(12);
    const ids = new Set<string>();
    for (const lesson of lessons) {
      expect(lesson.rule.length).toBeGreaterThan(100);
      expect(lesson.contexts.map((c) => c.id)).toEqual(contexts.map((c) => c.id));
      for (const pack of lesson.contexts) {
        expect(pack.exercises.length).toBeGreaterThanOrEqual(6);
        expect(new Set(pack.exercises.map((e) => e.type)).size).toBe(8);
        expect(pack.examples[0].en).not.toBe(pack.examples[1].en);
        for (const ex of pack.exercises) {
          expect(ids.has(ex.id)).toBe(false);
          ids.add(ex.id);
          expect(checkAnswer(ex.answers[0], ex.answers)).toBe(true);
          expect(ex.hints.length).toBeGreaterThan(0);
          if (ex.options) expect(ex.options).toContain(ex.answers[0]);
          if (ex.type === 'order') {
            const expected = normalizeAnswer(ex.answers[0]).split(' ').sort();
            expect(ex.tokens!.map(normalizeAnswer).sort()).toEqual(expected);
          }
          if (ex.type === 'mistake') {
            expect(checkAnswer(ex.prompt.replace('Исправьте предложение: ', ''), ex.answers)).toBe(
              false,
            );
          }
        }
      }
    }
  });
  it('switches examples and practice without changing common grammar', () => {
    const lesson = lessons.find((l) => l.id === 'present-simple')!;
    expect(lesson.contexts[0].examples[0].en).toContain('clients');
    expect(lesson.contexts[2].examples[0].en).toContain('travels');
    expect(lesson.contexts[0].exercises[2].answers[0]).toBe('works');
    expect(lesson.contexts[2].exercises[2].answers[0]).toBe('travels');
  });
  it('has prepared A1 and A2 dialogues with answerable questions', () => {
    expect(listeningMaterials.some((m) => m.level === 'A1')).toBe(true);
    expect(listeningMaterials.some((m) => m.level === 'A2')).toBe(true);
    for (const m of listeningMaterials) {
      expect(m.transcript.length).toBeGreaterThanOrEqual(4);
      expect(m.exercises.length).toBeGreaterThanOrEqual(3);
    }
  });
});
describe('persistence, progress and statistics', () => {
  it('validates a complete round trip, including unfinished exercise state', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'test-session' });
    const state = freshState();
    state.active = createSession('to-be', 'everyday', lessons[3].contexts[4].exercises);
    state.active.draft = 'I am';
    state.active.selected = [1, 0];
    state.active.elapsed = 12;
    expect(parseBackup(JSON.stringify(state))).toEqual(state);
    vi.unstubAllGlobals();
  });
  it('rejects malformed backups rather than accepting arbitrary JSON', () => {
    expect(() => parseBackup('{}')).toThrow();
    const s = freshState();
    (s.settings as { dailyGoal: number }).dailyGoal = -1;
    expect(() => parseBackup(JSON.stringify(s))).toThrow();
  });
  it('does not award progress for reading, keeps a completed run idempotent', () => {
    const s = freshState();
    expect(getStats(s).completed).toBe(0);
    const active = createSession('to-be', 'everyday', lessons[3].contexts[4].exercises);
    active.attempts = active.exercises.map((e, i) => ({
      id: String(i),
      sessionId: active.id,
      lessonId: 'to-be',
      exerciseId: e.id,
      context: 'everyday',
      prompt: e.prompt,
      answer: e.answers[0],
      expected: e.answers[0],
      correct: i !== 0,
      hints: i === 1 ? 1 : 0,
      at: 1000,
      skill: e.skill,
    }));
    active.elapsed = 125;
    s.attempts = active.attempts;
    const finished = finishSession(s, active);
    expect(finished.progress['to-be'].bestScore).toBe(86);
    expect(finishSession(finished, active).sessions).toHaveLength(1);
    expect(getStats(finished).accuracy).toBe(88);
    expect(getStats(finished).seconds).toBe(125);
    expect(finished.active).toBe(null);
    expect(sessionScore(finished.sessions[0])).toBe(86);
  });
  it('separates listening results from completed lessons', () => {
    const active = createSession('cafe', 'everyday', listeningMaterials[0].exercises, 'listening');
    const finished = finishSession(freshState(), active);
    expect(Object.keys(finished.progress)).toHaveLength(0);
    expect(finished.listeningAttempts).toHaveLength(1);
  });
  it('groups activity into seven local days and starts with real zeros', () => {
    const s = freshState();
    expect(getStats(s).total).toBe(0);
    expect(getStats(s).seconds).toBe(0);
    expect(weekActivity([], 1000)).toHaveLength(7);
    expect(weekActivity([], 1000).every((d) => d.seconds === 0)).toBe(true);
  });
  it('recommends a conservative route with confirmed foundations', () => {
    const first = (n: number) => Array.from({ length: 12 }, (_, i) => i < n);
    expect(placementLevel(first(0))).toBe('A1');
    expect(placementLevel(first(3))).toBe('A1');
    expect(placementLevel(first(4))).toBe('A2');
    expect(placementLevel(first(6))).toBe('A2');
    expect(placementLevel(first(7))).toBe('B1');
    expect(placementLevel(first(9))).toBe('B1');
    expect(placementLevel(first(10))).toBe('B2');
    expect(placementLevel(first(12))).toBe('B2');
    expect(placementLevel(Array(6).fill(true))).toBe('A1');
  });
  it('never recommends B1 for any combination of four correct answers', () => {
    for (let mask = 0; mask < 4096; mask++) {
      const answers = Array.from({ length: 12 }, (_, i) => !!(mask & (1 << i)));
      if (answers.filter(Boolean).length === 4)
        expect(['A1', 'A2']).toContain(placementLevel(answers));
    }
  });
  it('does not let advanced guesses compensate for gaps in basic grammar', () => {
    expect(
      placementLevel([false, false, false, false, true, true, true, true, true, true, true, true]),
    ).toBe('A1');
    expect(
      placementLevel([true, true, true, true, false, false, true, true, true, true, true, true]),
    ).toBe('A2');
  });
});
