// hooks/useDragSheet.ts
// Panel deslizable vertical (top sheet) que sigue el dedo en tiempo real (1:1 en
// píxeles) mientras se arrastra, y hace "snap" abierto/cerrado al soltar.
// Cerrado = translateY(-100%) (arriba, fuera de vista). Abierto = translateY(0).

import { useRef, useState, type CSSProperties, type RefObject, type TouchEvent } from 'react';

export interface DragSheet {
  panelRef: RefObject<HTMLDivElement | null>;
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
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null); // px durante el arrastre; null = en reposo
  const info = useRef<{ startY: number; baseY: number; height: number; moved: boolean } | null>(null);
  const dragYRef = useRef(0);
  const touchedAt = useRef(0);

  const onTouchStart = (e: TouchEvent) => {
    const height = panelRef.current?.clientHeight ?? window.innerHeight;
    const baseY = open ? 0 : -height;
    info.current = { startY: e.touches[0].clientY, baseY, height, moved: false };
    dragYRef.current = baseY;
    setDragY(baseY);
  };

  const onTouchMove = (e: TouchEvent) => {
    const d = info.current;
    if (!d) return;
    const dy = e.touches[0].clientY - d.startY;
    if (Math.abs(dy) > 4) d.moved = true;
    const next = Math.min(0, Math.max(-d.height, d.baseY + dy)); // sigue el dedo, acotado
    dragYRef.current = next;
    setDragY(next);
  };

  const onTouchEnd = () => {
    const d = info.current;
    info.current = null;
    if (!d) return;
    touchedAt.current = Date.now();
    if (!d.moved) {
      setDragY(null);
      setOpen(!open); // tap = alterna
      return;
    }
    setOpen(dragYRef.current > -d.height / 2); // snap por la posición final
    setDragY(null);
  };

  // Para mouse/desktop. Ignora el click sintético que dispara el touch.
  const toggle = () => {
    if (Date.now() - touchedAt.current < 500) return;
    setOpen(!open);
  };

  const style: CSSProperties = {
    transform: dragY != null ? `translateY(${dragY}px)` : `translateY(${open ? '0' : '-100%'})`,
    transition: dragY != null ? 'none' : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  };

  return { panelRef, style, open, setOpen, toggle, handleProps: { onTouchStart, onTouchMove, onTouchEnd } };
}
