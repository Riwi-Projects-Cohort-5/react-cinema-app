import { useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  onExpire?: () => void;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatHms(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function useCountdown(remainingSeconds: number, options: UseCountdownOptions = {}) {
  const { onExpire } = options;
  const onExpireRef = useRef(onExpire);
  const hasExpired = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor(remainingSeconds)));

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    hasExpired.current = false;
    const deadline = Date.now() + Math.max(0, Math.floor(remainingSeconds)) * 1000;

    const tick = (): void => {
const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0 && !hasExpired.current) {
        hasExpired.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [remainingSeconds]);

  return { seconds: secondsLeft, formatted: formatHms(secondsLeft) };
}
