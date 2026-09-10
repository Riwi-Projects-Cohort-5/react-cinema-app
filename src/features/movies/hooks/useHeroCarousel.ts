import { useCallback, useEffect, useState } from "react";

export interface UseHeroCarouselReturn<T> {
  activeIndex: number;
  activeItem: T;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  isPaused: boolean;
  togglePause: () => void;
  pause: () => void;
  resume: () => void;
  progress: number;
}

export function useHeroCarousel<T>(
  items: T[],
  options?: { intervalMs?: number }
): UseHeroCarouselReturn<T> {
  const intervalMs = options?.intervalMs ?? 5000;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const activeItem = (items[activeIndex] ?? items[0]) as T;

  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused || items.length <= 1) {
      return;
    }

    const autoplayId = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(autoplayId);
  }, [isPaused, items.length, intervalMs, activeIndex]);

  useEffect(() => {
    if (isPaused || items.length <= 1) {
      return;
    }

    const tickMs = 100;
    const increment = tickMs / intervalMs;

    const progressId = setInterval(() => {
      setProgress(prev => Math.min(prev + increment, 1));
    }, tickMs);

    return () => clearInterval(progressId);
  }, [isPaused, activeIndex, items.length, intervalMs]);

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) {
        return;
      }
      const targetIndex = ((index % items.length) + items.length) % items.length;
      setActiveIndex(targetIndex);
      setProgress(0);
    },
    [items.length]
  );

  const next = useCallback(() => {
    if (items.length <= 1) {
      return;
    }
    setActiveIndex(prev => (prev + 1) % items.length);
    setProgress(0);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length <= 1) {
      return;
    }
    setActiveIndex(prev => (prev - 1 + items.length) % items.length);
    setProgress(0);
  }, [items.length]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  return {
    activeIndex,
    activeItem,
    goTo,
    next,
    prev,
    isPaused,
    togglePause,
    pause,
    resume,
    progress,
  };
}
