// hooks/useDragSheet.ts
// Panel verde fijo que se REVELA desde arriba: el contenido no se mueve ni
// cambia de tamaño; lo que cambia es cuánto se ve (clip). Colapsado se ve solo
// el encabezado (saludo); al arrastrar la barra hacia abajo se revela el resto
// siguiendo el dedo (1:1). Como no toca el layout, el gesto es fluido.

import { useLayoutEffect, useRef, useState, type RefObject, type TouchEvent } from 'react';

export interface DragSheet {
  panelRef: RefObject<HTMLDivElement | null>;
  headerRef: RefObject<HTMLDivElement | null>;
  collapsedH: number;
  fullH: number;
  revealed: number; // px visibles desde arriba (collapsedH … fullH)
  dragging: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  handleProps: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function useDragSheet(): DragSheet {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [collapsedH, setCollapsedH] = useState(140);
  const [fullH, setFullH] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragR, setDragR] = useState<number | null>(null); // revelado en vivo durante el arrastre
  const info = useRef<{ startY: number; base: number; moved: boolean } | null>(null);
  const dragRRef = useRef(0);
  const touchedAt = useRef(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (headerRef.current) setCollapsedH(headerRef.current.offsetHeight);
      const parent = panelRef.current?.parentElement;
      setFullH(parent?.clientHeight ?? window.innerHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    const base = open ? fullH : collapsedH;
    info.current = { startY: e.touches[0].clientY, base, moved: false };
    dragRRef.current = base;
    setDragR(base);
  };

  const onTouchMove = (e: TouchEvent) => {
    const d = info.current;
    if (!d) return;
    const dy = e.touches[0].clientY - d.startY;
    if (Math.abs(dy) > 4) d.moved = true;
    const next = Math.min(fullH, Math.max(collapsedH, d.base + dy)); // sigue el dedo, acotado
    dragRRef.current = next;
    setDragR(next);
  };

  const onTouchEnd = () => {
    const d = info.current;
    info.current = null;
    if (!d) return;
    touchedAt.current = Date.now();
    if (!d.moved) {
      setDragR(null);
      setOpen(!open); // tap = alterna
      return;
    }
    setOpen(dragRRef.current > (collapsedH + fullH) / 2); // snap por la posición final
    setDragR(null);
  };

  const toggle = () => {
    if (Date.now() - touchedAt.current < 500) return; // ignora el click sintético del touch
    setOpen(!open);
  };

  const revealed = dragR != null ? dragR : open ? fullH || collapsedH : collapsedH;

  return {
    panelRef,
    headerRef,
    collapsedH,
    fullH,
    revealed,
    dragging: dragR != null,
    open,
    setOpen,
    toggle,
    handleProps: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
