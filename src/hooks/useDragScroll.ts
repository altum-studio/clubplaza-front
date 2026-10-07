// hooks/useDragScroll.ts
// "Agarrar y arrastrar" para carruseles horizontales con el MOUSE (compu sin
// scroll horizontal). En celular no interviene: el dedo ya desliza nativo.
// - Mientras se arrastra se apaga el snap (si no, pelea con el movimiento).
// - Al soltar toma el impulso del gesto: si el carrusel tiene snap, se desliza
//   suave hasta la tarjeta que corresponde según hacia dónde y qué tan rápido
//   se tiró; si no tiene snap, sigue por inercia y frena de a poco.
// - Si hubo arrastre, se cancela el click que dispara soltar el mouse: así no se
//   abre una tarjeta/local por accidente. Un click normal (sin mover) sigue andando.
// - onDragStart/onDragEnd: para pausar autoplay o retomarlo al soltar.
//
// Los listeners van en `window` y se fijan en `ref.current` recién al apretar:
// así funciona aunque el carrusel aparezca después (ej: cuando cargan los datos).

import { useEffect, useRef, type RefObject } from 'react';

const UMBRAL_PX = 6; // movimiento mínimo para considerarlo arrastre (y no un click)
const PROYECCION_S = 0.28; // cuánto "viaja" el impulso al soltar (en segundos de velocidad)
const FRICCION = 4; // frenado de la inercia sin snap

// Si el carrusel tiene snap en su CSS (se recuerda por elemento: mientras se
// arrastra o se acomoda, el snap está apagado inline y el CSS no se puede leer).
const tieneSnapCache = new WeakMap<HTMLElement, boolean>();

interface DragScrollOpts {
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Posición de scroll que deja a `hijo` alineado según su scroll-snap-align.
function posicionSnap(cont: HTMLElement, hijo: HTMLElement): number {
  const rc = cont.getBoundingClientRect();
  const rh = hijo.getBoundingClientRect();
  const izq = rh.left - rc.left + cont.scrollLeft;
  const align = getComputedStyle(hijo).scrollSnapAlign;
  if (align.includes('center')) return izq + rh.width / 2 - cont.clientWidth / 2;
  if (align.includes('end')) return izq + rh.width - cont.clientWidth;
  const padIzq = parseFloat(getComputedStyle(cont).scrollPaddingLeft) || 0;
  return izq - padIzq;
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
    let ultX = 0;
    let ultT = 0;
    let vel = 0; // velocidad del scroll (px/s), positiva = avanza hacia la derecha
    let tieneSnap = false;
    let rafInercia = 0;
    let timerSnap = 0;

    const dentro = (target: EventTarget | null) => {
      const cont = ref.current;
      return cont && target instanceof Node && cont.contains(target) ? cont : null;
    };

    const restaurar = (cont: HTMLElement) => {
      cont.style.scrollSnapType = '';
      cont.style.scrollBehavior = '';
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const cont = dentro(e.target);
      if (!cont || cont.scrollWidth <= cont.clientWidth) return; // nada para desplazar
      cancelAnimationFrame(rafInercia);
      clearTimeout(timerSnap);
      el = cont;
      arrastrando = false;
      startX = ultX = e.clientX;
      ultT = e.timeStamp;
      vel = 0;
      startScroll = cont.scrollLeft;
    };

    const onMove = (e: PointerEvent) => {
      if (!el) return;
      const dx = e.clientX - startX;
      if (!arrastrando) {
        if (Math.abs(dx) < UMBRAL_PX) return;
        arrastrando = true;
        const cache = tieneSnapCache.get(el);
        tieneSnap = cache ?? getComputedStyle(el).scrollSnapType !== 'none';
        tieneSnapCache.set(el, tieneSnap);
        el.style.scrollSnapType = 'none';
        el.style.scrollBehavior = 'auto';
        el.classList.add('cp-dragging');
        optsRef.current.onDragStart?.();
      }
      e.preventDefault(); // evita seleccionar texto mientras arrastra
      const paso = e.clientX - ultX;
      const dtMs = Math.max(e.timeStamp - ultT, 1);
      vel = 0.75 * ((-paso / dtMs) * 1000) + 0.25 * vel;
      ultX = e.clientX;
      ultT = e.timeStamp;
      el.scrollLeft = startScroll - dx;
    };

    const onUp = (e: PointerEvent) => {
      const cont = el;
      el = null;
      if (!cont || !arrastrando) return;
      arrastrando = false;
      cont.classList.remove('cp-dragging');
      // Soltado quieto (sin movimiento reciente) → sin impulso.
      const v = e.timeStamp - ultT > 90 ? 0 : Math.max(-4000, Math.min(4000, vel));

      if (tieneSnap) {
        // Hacia dónde iba el gesto + la tarjeta más cercana a ese punto.
        const max = cont.scrollWidth - cont.clientWidth;
        const destino = cont.scrollLeft + v * PROYECCION_S;
        let mejor = cont.scrollLeft;
        let dist = Infinity;
        for (const h of Array.from(cont.children) as HTMLElement[]) {
          const p = Math.max(0, Math.min(max, posicionSnap(cont, h)));
          const d = Math.abs(p - destino);
          if (d < dist) {
            dist = d;
            mejor = p;
          }
        }
        cont.scrollTo({ left: mejor, behavior: 'smooth' });
        // Volvemos a prender el snap cuando termina el deslizamiento.
        const fin = () => {
          clearTimeout(timerSnap);
          restaurar(cont);
        };
        cont.addEventListener('scrollend', fin, { once: true });
        timerSnap = window.setTimeout(fin, 700);
      } else {
        restaurar(cont);
        // Inercia: sigue con la velocidad del gesto y frena de a poco.
        let vi = v;
        let prev = performance.now();
        const paso = (t: number) => {
          const dt = Math.min((t - prev) / 1000, 0.05);
          prev = t;
          cont.scrollLeft += vi * dt;
          vi *= Math.exp(-FRICCION * dt);
          if (Math.abs(vi) > 8) rafInercia = requestAnimationFrame(paso);
        };
        if (Math.abs(vi) > 8) rafInercia = requestAnimationFrame(paso);
      }

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
      cancelAnimationFrame(rafInercia);
      clearTimeout(timerSnap);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('dragstart', sinDragNativo);
    };
  }, [ref]);
}
