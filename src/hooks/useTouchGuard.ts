import { useRef, useCallback } from 'react';

/**
 * Hook to guard click handlers against accidental triggering during scrolling/swiping on touch devices.
 * If the touch moved more than `moveThreshold` pixels, subsequent click events within `suppressDuration` ms are ignored.
 */
export function useTouchGuard(moveThreshold = 8, suppressDuration = 450) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isMovedRef = useRef<boolean>(false);
  const suppressClickUntilRef = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      isMovedRef.current = false;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !e.touches || e.touches.length === 0) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
    if (dx > moveThreshold || dy > moveThreshold) {
      isMovedRef.current = true;
    }
  }, [moveThreshold]);

  const onTouchEnd = useCallback(() => {
    if (isMovedRef.current) {
      suppressClickUntilRef.current = Date.now() + suppressDuration;
    }
    touchStartRef.current = null;
    isMovedRef.current = false;
  }, [suppressDuration]);

  const guardClick = useCallback(
    <T extends (...args: any[]) => void>(handler: T): ((...args: Parameters<T>) => void) => {
      return (...args: Parameters<T>) => {
        if (Date.now() < suppressClickUntilRef.current) {
          // Suppress accidental tap caused by touch drag / scrolling
          return;
        }
        handler(...args);
      };
    },
    []
  );

  return {
    touchProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    guardClick,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
