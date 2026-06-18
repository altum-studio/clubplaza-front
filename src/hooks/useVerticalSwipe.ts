// hooks/useVerticalSwipe.ts
// Detecta gestos verticales (swipe) por touch. Mobile-first: en escritorio, las
// pantallas igual ofrecen una flecha/botón como alternativa al gesto.

import { useRef, type TouchEvent } from 'react';

interface Options {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Distancia mínima en px para contar como swipe. */
  threshold?: number;
  /** Si se define, el swipe hacia abajo solo cuenta cuando arrancó dentro de los
   *  primeros `topEdge` px de la pantalla (así no pisa el scroll del contenido). */
  topEdge?: number;
}

export function useVerticalSwipe({ onSwipeUp, onSwipeDown, threshold = 60, topEdge }: Options) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dy = t.clientY - s.y;
    const dx = t.clientX - s.x;
    // Debe ser mayormente vertical y superar el umbral.
    if (Math.abs(dy) <= Math.abs(dx) || Math.abs(dy) < threshold) return;
    if (dy < 0) onSwipeUp?.();
    else if (topEdge == null || s.y <= topEdge) onSwipeDown?.();
  };

  return { onTouchStart, onTouchEnd };
}
