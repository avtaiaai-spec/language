let current: SpeechSynthesisUtterance | null = null;
let cancelCallback: (() => void) | null = null;
let watchdog: ReturnType<typeof setTimeout> | null = null;
function clearWatchdog() {
  if (watchdog) clearTimeout(watchdog);
  watchdog = null;
}
export function stopAudio() {
  clearWatchdog();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  cancelCallback?.();
  cancelCallback = null;
  current = null;
}
export function speak(
  text: string,
  accent: string,
  rate: number,
  onEnd: () => void,
  onError: (message: string) => void,
  onStart?: () => void,
) {
  stopAudio();
  if (!('speechSynthesis' in window)) {
    onError(
      'Браузер не поддерживает озвучку. Откройте Safari или Chrome с установленным английским голосом.',
    );
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  current = u;
  u.lang = accent;
  u.rate = rate;
  const voices = speechSynthesis.getVoices();
  const voice =
    voices.find((v) => v.lang === accent) || voices.find((v) => v.lang.startsWith('en'));
  if (voice) u.voice = voice;
  cancelCallback = onEnd;
  u.onstart = () => {
    if (current === u) {
      clearWatchdog();
      onStart?.();
    }
  };
  u.onend = () => {
    if (current === u) {
      clearWatchdog();
      current = null;
      cancelCallback = null;
      onEnd();
    }
  };
  u.onerror = (e) => {
    if (current !== u) return;
    clearWatchdog();
    current = null;
    cancelCallback = null;
    if (e.error === 'canceled' || e.error === 'interrupted') {
      onEnd();
      return;
    }
    onError('Не удалось воспроизвести звук. Проверьте английские голоса и подключение к сети.');
  };
  watchdog = setTimeout(() => {
    if (current === u) {
      stopAudio();
      onError('Браузер не запустил озвучку. Установите английский голос и попробуйте снова.');
    }
  }, 12000);
  try {
    speechSynthesis.speak(u);
  } catch {
    stopAudio();
    onError('Браузер отклонил озвучку. Проверьте настройки звука и английские голоса.');
  }
}
