import { afterEach, describe, it, expect, vi } from 'vitest';
import { speak, stopAudio } from './audio';
afterEach(() => {
  stopAudio();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function mockAudio() {
  const engine = {
    cancel: vi.fn(),
    getVoices: () => [{ lang: 'en-GB', name: 'English' }],
    speak: vi.fn(),
  };
  vi.stubGlobal('window', { speechSynthesis: engine });
  vi.stubGlobal('speechSynthesis', engine);
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  return engine;
}
describe('speech service', () => {
  it('reports unavailable API instead of claiming playback', () => {
    vi.stubGlobal('window', {});
    const error = vi.fn();
    const start = vi.fn();
    speak('Hello', 'en-GB', 1, vi.fn(), error, start);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('не поддерживает'));
    expect(start).not.toHaveBeenCalled();
  });
  it('sets accent/rate, only starts on browser event and cancels previous utterance', () => {
    const engine = mockAudio();
    const start = vi.fn();
    const end = vi.fn();
    speak('Hello', 'en-GB', 0.75, end, vi.fn(), start);
    const u = engine.speak.mock.calls[0][0] as unknown as SpeechSynthesisUtterance;
    expect(u.lang).toBe('en-GB');
    expect(u.rate).toBe(0.75);
    expect(start).not.toHaveBeenCalled();
    u.onstart?.(new Event('start') as SpeechSynthesisEvent);
    expect(start).toHaveBeenCalledOnce();
    speak('Next', 'en-US', 1.25, vi.fn(), vi.fn());
    expect(end).toHaveBeenCalledOnce();
    expect(engine.cancel).toHaveBeenCalled();
  });
  it('reports a browser that never starts speech', () => {
    vi.useFakeTimers();
    mockAudio();
    const error = vi.fn();
    speak('Hello', 'en-GB', 1, vi.fn(), error);
    vi.advanceTimersByTime(12000);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('не запустил'));
  });
});
