// hooks/useDragScroll.ts
// "Agarrar y arrastrar" para carruseles horizontales con el MOUSE (compu sin
// scroll horizontal). En celular no interviene: el dedo ya desliza nativo.
// - Mientras se arrastra se apaga el snap (si no, pelea con el movimiento) y al
//   soltar se restaura (el navegador acomoda a la tarjeta más cercana).
// - Si hubo arrastre, se cancela el click que dispara soltar el mouse: así no se
//   abre una tarjeta/local por accidente. Un click normal (sin mover) sigue andando.
// - onDragStart/onDragEnd: para pausar autoplay/auto-scroll o recentrar al soltar.
//
// Los listeners van en `window` y se fijan en `ref.current` recién al apretar:
// así funciona aunque el carrusel aparezca después (ej: cuando cargan los datos).

import { useEffect, useRef, type RefObject } from 'react';

const UMBRAL_PX = 6; // movimiento mínimo para considerarlo arrastre (y no un click)

interface DragScrollOpts {
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDragScroll(ref: RefObject<HTMLElement | null>, opts: DragScrollOpts = {}) {
  // Los callbacks van por ref para no re-enganchar los listeners en cada render.
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  useEffect(() => {
    let el: HTMLElement | null = null; // carrusel que se está arrastrando
    let arrastrando = false;
    let startX = 0;
    let startScroll = 0;

    const dentro = (target: EventTarget | null) => {
      const cont = ref.current;
      return cont && target instanceof Node && cont.contains(target) ? cont : null;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const cont = dentro(e.target);
      if (!cont || cont.scrollWidth <= cont.clientWidth) return; // nada para desplazar
      el = cont;
      arrastrando = false;
      startX = e.clientX;
      startScroll = cont.scrollLeft;
    };

    const onMove = (e: PointerEvent) => {
      if (!el) return;
      const dx = e.clientX - startX;
      if (!arrastrando) {
        if (Math.abs(dx) < UMBRAL_PX) return;
        arrastrando = true;
        el.style.scrollSnapType = 'none';
        el.style.scrollBehavior = 'auto';
        el.classList.add('cp-dragging');
        optsRef.current.onDragStart?.();
      }
      e.preventDefault(); // evita seleccionar texto mientras arrastra
      el.scrollLeft = startScroll - dx;
    };

    const onUp = () => {
      const cont = el;
      el = null;
      if (!cont || !arrastrando) return;
      arrastrando = false;
      cont.classList.remove('cp-dragging');
      cont.style.scrollSnapType = '';
      cont.style.scrollBehavior = '';
      // El click llega justo después del pointerup: lo frenamos una sola vez.
      const cancelarClick = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      cont.addEventListener('click', cancelarClick, { capture: true, once: true });
      setTimeout(() => cont.removeEventListener('click', cancelarClick, { capture: true }), 0);
      optsRef.current.onDragEnd?.();
    };

    // Sin el "fantasma" nativo al arrastrar imágenes o links del carrusel.
    const sinDragNativo = (e: DragEvent) => {
      if (dentro(e.target)) e.preventDefault();
    };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('dragstart', sinDragNativo);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('dragstart', sinDragNativo);
    };
  }, [ref]);
}
