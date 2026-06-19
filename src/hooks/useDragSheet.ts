// hooks/useDragSheet.ts
// Panel verde fijo que se REVELA desde arriba con un tap (sin arrastre): tocás y
// baja (se revela), tocás de nuevo y sube (se cierra). El contenido no se mueve;
// lo que cambia es cuánto se ve (clip-path), animado suave.

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

export interface DragSheet {
  panelRef: RefObject<HTMLDivElement | null>;
  headerRef: RefObject<HTMLDivElement | null>;
  collapsedH: number;
  fullH: number;
  revealed: number; // px visibles desde arriba (collapsedH cerrado, fullH abierto)
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

export function useDragSheet(): DragSheet {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [collapsedH, setCollapsedH] = useState(140);
  const [fullH, setFullH] = useState(0);
  const [open, setOpen] = useState(false);

  // Medir el alto del encabezado (colapsado) y el del marco (abierto).
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

  const toggle = () => setOpen((o) => !o);
  const revealed = open ? fullH || collapsedH : collapsedH;

  return { panelRef, headerRef, collapsedH, fullH, revealed, open, setOpen, toggle };
}
