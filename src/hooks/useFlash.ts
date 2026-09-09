// hooks/useFlash.ts
// Destello temporal: devuelve `true` durante `ms` milisegundos cada vez que
// `key` cambia a un valor no vacío, y después `false`. Sirve para resaltar
// filas al llegar a una pantalla (p. ej. ?resaltar=vencidos) sin dejarlas marcadas.

import { useEffect, useState } from 'react';

export function useFlash(key: string | null | undefined, ms = 3000): boolean {
  const [activo, setActivo] = useState(!!key);
  // Patrón "estado derivado de props" de React: cuando cambia `key`, se
  // (re)enciende el destello en el mismo render, sin efectos ni relojes.
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setActivo(!!key);
  }

  useEffect(() => {
    if (!activo) return;
    const t = setTimeout(() => setActivo(false), ms);
    return () => clearTimeout(t);
  }, [activo, ms]);

  return activo;
}
