'use client';

import { useEffect, useState } from 'react';

/**
 * Hook tính thời gian đếm ngược (giây) dựa trên timestamp timerEnd từ Server
 */
export function useGameTimer(timerEnd: number | null, fallbackRemaining = 0): number {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (timerEnd === null) return fallbackRemaining;
    return Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
  });

  useEffect(() => {
    if (timerEnd === null) {
      setSecondsLeft(0);
      return;
    }

    const updateRemaining = () => {
      const diff = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 250);

    return () => clearInterval(interval);
  }, [timerEnd]);

  return secondsLeft;
}
