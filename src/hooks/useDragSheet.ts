// hooks/useDragSheet.ts
// Panel verde que se EXPANDE desde arriba: colapsado muestra solo su encabezado
// (el saludo del home); al arrastrar la barra hacia abajo crece su altura
// siguiendo el dedo (1:1) y revela la credencial. Es UN mismo elemento.

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type TouchEvent,
} from 'react';

export interface DragSheet {
  panelRef: RefObject<HTMLDivElement | null>;
  headerRef: RefObject<HTMLDivElement | null>;
  collapsedH: number;
  fullH: number;
  style: CSSProperties;
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
  const [collapsedH, setCollapsedH] = useState(140); // alto del encabezado (medido)
  const [fullH, setFullH] = useState(0); // alto del marco (pantalla)
  const [open, setOpen] = useState(false);
  const [dragH, setDragH] = useState<number | null>(null); // alto en vivo durante el arrastre
  const info = useRef<{ startY: number; base: number; moved: boolean } | null>(null);
  const dragHRef = useRef(0);
  const touchedAt = useRef(0);

  // Medir el alto colapsado (encabezado) y el alto total (marco contenedor).
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
    dragHRef.current = base;
    setDragH(base);
  };

  const onTouchMove = (e: TouchEvent) => {
    const d = info.current;
    if (!d) return;
    const dy = e.touches[0].clientY - d.startY;
    if (Math.abs(dy) > 4) d.moved = true;
    const next = Math.min(fullH, Math.max(collapsedH, d.base + dy)); // sigue el dedo, acotado
    dragHRef.current = next;
    setDragH(next);
  };

  const onTouchEnd = () => {
    const d = info.current;
    info.current = null;
    if (!d) return;
    touchedAt.current = Date.now();
    if (!d.moved) {
      setDragH(null);
      setOpen(!open); // tap = alterna
      return;
    }
    setOpen(dragHRef.current > (collapsedH + fullH) / 2); // snap por la posición final
    setDragH(null);
  };

  // Para mouse/desktop. Ignora el click sintético posterior al touch.
  const toggle = () => {
    if (Date.now() - touchedAt.current < 500) return;
    setOpen(!open);
  };

  const height = dragH != null ? dragH : open ? fullH : collapsedH;
  const style: CSSProperties = {
    height: height || collapsedH,
    transition: dragH != null ? 'none' : 'height 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'height',
  };

  return {
    panelRef,
    headerRef,
    collapsedH,
    fullH,
    style,
    open,
    setOpen,
    toggle,
    handleProps: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
