// hooks/useMarquee.ts
// Tira de logos que desfila sola en loop, fluida, y se puede agarrar y arrastrar
// (mouse o dedo) con inercia al soltar.
//
// Por qué así: mover `scrollLeft` de a fracciones de píxel se ve "a saltitos"
// (el navegador lo redondea). Acá la pista se mueve con `transform` (sub-píxel,
// por GPU), a velocidad por tiempo (igual en 60 y 120 Hz), con frenado/arranque
// suave al pasar el mouse y con impulso al soltar un arrastre.
//
// Uso: viewport con overflow oculto + pista adentro con los items DUPLICADOS.
// Para que el loop no tenga salto, la pista no lleva padding a la izquierda y
// a la derecha lleva un padding igual al gap entre items.

import { useEffect, type RefObject } from 'react';

interface MarqueeOpts {
  /** Velocidad de crucero en px por segundo. */
  velocidad?: number;
}

const UMBRAL_PX = 6; // movimiento mínimo para considerarlo arrastre (y no un toque)
const FRICCION = 3.2; // cuánto frena la inercia (más alto = frena antes)
const SUAVIDAD = 2.5; // qué tan rápido acelera/frena el desfile automático

export function useMarquee(
  viewportRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  { velocidad = 24 }: MarqueeOpts = {},
  // Cambia cuando los items aparecen/cambian (ej. al terminar de cargar).
  clave: unknown = null,
) {
  useEffect(() => {
    const vp = viewportRef.current;
    const pista = trackRef.current;
    if (!vp || !pista) return;

    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const crucero = reducirMovimiento ? 0 : velocidad;

    let x = 0; // desplazamiento de la pista (≤ 0)
    let vel = crucero; // velocidad actual del desfile (px/s), con easing
    let inercia = 0; // velocidad tras soltar un arrastre (px/s)
    let encima = false; // mouse encima → el desfile frena suave
    let apretado = false;
    let arrastrando = false;
    let startX = 0;
    let ultX = 0;
    let ultT = 0;
    let velArrastre = 0;
    let prev = performance.now();
    let raf = 0;

    const acomodar = () => {
      const mitad = pista.scrollWidth / 2;
      if (mitad <= 0) return;
      x %= mitad;
      if (x > 0) x -= mitad;
    };
    const pintar = () => {
      pista.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const tick = (t: number) => {
      const dt = Math.min((t - prev) / 1000, 0.05);
      prev = t;
      if (!arrastrando) {
        if (Math.abs(inercia) > 4) {
          x += inercia * dt;
          inercia *= Math.exp(-FRICCION * dt);
        } else {
          inercia = 0;
          const meta = encima ? 0 : crucero;
          vel += (meta - vel) * Math.min(1, SUAVIDAD * dt);
          x -= vel * dt;
        }
        acomodar();
        pintar();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      apretado = true;
      arrastrando = false;
      inercia = 0;
      startX = ultX = e.clientX;
      ultT = e.timeStamp;
      velArrastre = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!apretado) return;
      if (!arrastrando) {
        if (Math.abs(e.clientX - startX) < UMBRAL_PX) return;
        arrastrando = true;
        vp.classList.add('cp-dragging');
      }
      const dx = e.clientX - ultX;
      const dtMs = Math.max(e.timeStamp - ultT, 1);
      // Velocidad del dedo/mouse, suavizada (para la inercia al soltar).
      velArrastre = 0.75 * ((dx / dtMs) * 1000) + 0.25 * velArrastre;
      ultX = e.clientX;
      ultT = e.timeStamp;
      x += dx;
      acomodar();
      pintar();
    };

    const onUp = (e: PointerEvent) => {
      if (!apretado) return;
      apretado = false;
      if (!arrastrando) return;
      arrastrando = false;
      vp.classList.remove('cp-dragging');
      // Si lo soltó quieto (sin movimiento reciente), no hay impulso.
      const quieto = e.type === 'pointercancel' || e.timeStamp - ultT > 90;
      inercia = quieto ? 0 : Math.max(-3500, Math.min(3500, velArrastre));
      vel = 0; // el desfile retoma de a poco cuando se acaba el impulso
      // El click que dispara soltar no tiene que abrir el local.
      const cancelarClick = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      vp.addEventListener('click', cancelarClick, { capture: true, once: true });
      setTimeout(() => vp.removeEventListener('click', cancelarClick, { capture: true }), 0);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') encima = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') encima = false;
    };
    const sinDragNativo = (e: DragEvent) => e.preventDefault();

    vp.addEventListener('pointerdown', onDown);
    vp.addEventListener('pointerenter', onEnter);
    vp.addEventListener('pointerleave', onLeave);
    vp.addEventListener('dragstart', sinDragNativo);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener('pointerdown', onDown);
      vp.removeEventListener('pointerenter', onEnter);
      vp.removeEventListener('pointerleave', onLeave);
      vp.removeEventListener('dragstart', sinDragNativo);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      pista.style.transform = '';
    };
  }, [viewportRef, trackRef, velocidad, clave]);
}
