import { describe, it, expect } from 'vitest';
import { alphabet, sounds, toVocabularyWord } from './phonics';
import { lessons, contexts } from './curriculum';
import { checkAnswer } from '../lib/learning';
describe('complete reading foundations', () => {
  it('covers A to Z, both cases, letter names and a word for every topic', () => {
    expect(alphabet.map((a) => a.letter).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    for (const letter of alphabet) {
      expect(letter.lower).toBe(letter.letter.toLowerCase());
      expect(letter.name).toMatch(/^\/.+\/$/);
      expect(letter.tip.length).toBeGreaterThan(40);
      for (const topic of contexts) {
        const w = letter.examples[topic.id];
        expect(w.en[0].toUpperCase()).toBe(letter.letter);
        expect(w.ipa).toMatch(/^\/.+\/$/);
        expect(w.ru.length).toBeGreaterThan(0);
      }
    }
    expect(alphabet.find((a) => a.letter === 'Z')?.usName).toBe('/ziː/');
  });
  it('covers all 44 traditional UK phonemes with correct example-to-symbol links in all topics', () => {
    expect(sounds).toHaveLength(44);
    expect(new Set(sounds.map((s) => s.symbol)).size).toBe(44);
    expect(sounds.filter((s) => s.group === 'short')).toHaveLength(7);
    expect(sounds.filter((s) => s.group === 'long')).toHaveLength(5);
    expect(sounds.filter((s) => s.group === 'diphthong')).toHaveLength(8);
    expect(sounds.filter((s) => s.group === 'consonant')).toHaveLength(24);
    for (const sound of sounds) {
      expect(sound.articulation.length).toBeGreaterThan(60);
      for (const topic of contexts) {
        const word = sound.examples[topic.id];
        expect(word.ipa, `${sound.symbol}: ${topic.id}/${word.en}`).toContain(sound.symbol);
        expect(toVocabularyWord(word, topic.id, 'reading').topic).toBe(topic.id);
      }
    }
  });
  it('changes actual alphabet and sound words with the chosen context', () => {
    expect(alphabet[0].examples.business.en).toBe('account');
    expect(alphabet[0].examples.travel.en).toBe('airport');
    expect(alphabet[0].examples.everyday.en).toBe('apple');
    const sound = sounds.find((s) => s.symbol === 'ɪ')!;
    expect(sound.examples.movies.en).toBe('film');
    expect(sound.examples.travel.en).toBe('ticket');
  });
  it('has 26 alphabet and 44 sound tasks per context and includes all illustrated words in the dictionary data', () => {
    const letters = lessons.find((l) => l.id === 'alphabet')!;
    const reading = lessons.find((l) => l.id === 'reading')!;
    for (const topic of contexts) {
      const a = letters.contexts.find((c) => c.id === topic.id)!;
      const r = reading.contexts.find((c) => c.id === topic.id)!;
      expect(a.exercises).toHaveLength(26);
      expect(r.exercises).toHaveLength(44);
      for (const entry of alphabet)
        expect(a.words.some((w) => w.en === entry.examples[topic.id].en)).toBe(true);
      for (const entry of sounds)
        expect(r.words.some((w) => w.en === entry.examples[topic.id].en)).toBe(true);
      for (const pack of [a, r])
        for (const e of pack.exercises) {
          expect(checkAnswer(e.answers[0], e.answers)).toBe(true);
          if (e.options) expect(new Set(e.options).size).toBe(3);
        }
    }
  });
  it('provides substantive teaching, facts and self-checks in all twelve lessons', () => {
    for (const lesson of lessons) {
      expect(lesson.sections.length).toBeGreaterThanOrEqual(6);
      expect(lesson.sections.reduce((n, s) => n + s.text.length, 0)).toBeGreaterThan(1800);
      expect(lesson.sections.some((s) => s.fact || s.checkpoint)).toBe(true);
      for (const pack of lesson.contexts) expect(pack.examples.length).toBeGreaterThanOrEqual(4);
    }
  });
});
