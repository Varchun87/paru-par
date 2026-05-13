import { useCallback, useMemo, useRef, useState } from 'react';
import { countdownStartIso, eventStartIso, lineupTabs } from './content';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function useCountdown() {
  return useMemo(() => {
    const eventStart = new Date(eventStartIso);
    const countdownStart = new Date(countdownStartIso);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((eventStart.getTime() - today.getTime()) / MS_PER_DAY));
    const countdownTotal = Math.max(1, Math.ceil((eventStart.getTime() - countdownStart.getTime()) / MS_PER_DAY));
    const progress = Math.max(0, Math.min(100, 100 - (daysLeft / countdownTotal) * 100));

    return { daysLeft, progress };
  }, []);
}

export function useLineupFilter() {
  const [activeCategory, setActiveCategory] = useState<string>(lineupTabs[0]);
  const selectCategory = useCallback((category: string) => setActiveCategory(category), []);

  return { activeCategory, selectCategory };
}

export function useMutedFloatingVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const play = useCallback((source: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.currentSrc) video.src = source;
    video.muted = true;
    video.controls = true;
    setIsPlaying(true);
    void video.play().catch(() => {
      setIsPlaying(false);
    });
  }, []);

  return { isPlaying, play, videoRef };
}
