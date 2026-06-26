// hooks/usePromos.ts
// TEMP (preview): beneficios HARDCODEADOS desde MOCK_PROMOS para ver cómo se veía
// la app antes de conectar al back. Para volver a la API real, revertir este
// archivo (ver git: la versión con `api.promos.*` + mapPromo).

import { useEffect, useState } from 'react';
import type { Promo } from '@/types';
import { MOCK_PROMOS } from '@/data/mock';

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 350)); // simula latencia para ver el skeleton
      if (cancel) return;
      setPromos(MOCK_PROMOS.filter((p) => p.activo));
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { promos, loading, error };
}

export function usePromo(id: string | undefined) {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    if (!id) {
      setLoading(false);
      setError('Beneficio inválido');
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 300));
      if (cancel) return;
      const found = MOCK_PROMOS.find((p) => p.id === id) ?? null;
      setPromo(found);
      if (!found) setError('No encontramos ese beneficio');
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  return { promo, loading, error };
}
