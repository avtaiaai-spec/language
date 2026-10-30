import { useEffect, useRef, useState } from 'react';
import { Card } from './ui';
type Player = { destroy: () => void };
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    options: {
      videoId: string;
      host: string;
      playerVars: Record<string, string | number>;
      events: { onError: () => void };
    },
  ) => Player;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YTNamespace> | null = null;
function loadApi() {
  if (window.YT) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => reject(new Error('Не удалось загрузить YouTube'));
    window.onYouTubeIframeAPIReady = () =>
      window.YT ? resolve(window.YT) : reject(new Error('API недоступен'));
    document.head.appendChild(script);
  });
  return apiPromise;
}
export function YouTubePlayer({ videoId }: { videoId: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let player: Player | undefined;
    loadApi()
      .then((YT) => {
        if (cancelled || !holder.current) return;
        const el = document.createElement('div');
        holder.current.replaceChildren(el);
        player = new YT.Player(el, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { playsinline: 1, origin: window.location.origin },
          events: { onError: () => setError(true) },
        });
      })
      .catch(() => setError(true));
    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [videoId]);
  return error ? (
    <Card role="alert">Видео недоступно. Попробуйте позже или выберите учебный диалог.</Card>
  ) : (
    <div className="youtube-player" ref={holder} />
  );
}
