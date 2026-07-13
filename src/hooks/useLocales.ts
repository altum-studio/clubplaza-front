// hooks/useLocales.ts
// Directorio de locales activos desde la API (/api/locales), mapeado a
// LocalDirectorio para el marquee de logos y la pantalla del local (incluye
// logo, banner, rubro y horarios reales).

import { useEffect, useState } from 'react';
import type { LocalDirectorio } from '@/types';
import { api, humanizeError } from '@/lib/api';
import { mapLocalDir } from '@/lib/mapApi';

export function useLocalesDir() {
  const [locales, setLocales] = useState<LocalDirectorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const l = await api.locales.list({ activo: true, limit: 500 });
        if (cancel) return;
        setLocales(l.data.map(mapLocalDir));
      } catch (e) {
        if (!cancel) setError(humanizeError(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { locales, loading, error };
}
