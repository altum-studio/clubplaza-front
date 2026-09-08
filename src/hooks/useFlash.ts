// hooks/useFlash.ts
// Destello temporal: devuelve `true` durante `ms` milisegundos cada vez que
// `key` cambia a un valor no vacío, y después `false`. Sirve para resaltar
// filas al llegar a una pantalla (p. ej. ?resaltar=vencidos) sin dejarlas marcadas.

import { useEffect, useMemo, useState } from 'react';

export function useFlash(key: string | null | undefined, ms = 3000): boolean {
  // Momento en que arrancó el destello para este `key`.
  const inicio = useMemo(() => (key ? Date.now() : 0), [key]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!inicio) return;
    // Re-render cuando vence el destello, para que se apague.
    const t = setTimeout(() => setTick((n) => n + 1), ms + 50);
    return () => clearTimeout(t);
  }, [inicio, ms]);

  return !!inicio && Date.now() - inicio < ms;
}
