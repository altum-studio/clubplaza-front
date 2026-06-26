// hooks/useLocales.ts
// TEMP (preview): directorio de locales HARDCODEADO desde MOCK_LOCALES, para que
// las pantallas de local matcheen con los beneficios mock (ver usePromos). Para
// volver a la API real, revertir este archivo (versión con `api.locales.list`).

import { useEffect, useState } from 'react';
import type { LocalDirectorio } from '@/types';
import { MOCK_LOCALES } from '@/data/mock';

export function useLocalesDir() {
  const [locales, setLocales] = useState<LocalDirectorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 350));
      if (cancel) return;
      setLocales(MOCK_LOCALES);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { locales, loading, error };
}
