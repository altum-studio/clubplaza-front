// hooks/usePromos.ts
// Lista y detalle de beneficios desde la API real (/api/promos). Mapea ApiPromo
// → Promo (forma que usan las pantallas) y joinea el nombre/logo del local
// (la lista de promos no los trae embebidos).

import { useEffect, useState } from 'react';
import type { Promo } from '@/types';
import { api, humanizeError } from '@/lib/api';
import { mapPromo } from '@/lib/mapApi';

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, l] = await Promise.all([
          api.promos.list({ activa: true, limit: 500 }),
          api.locales.list({ limit: 500 }),
        ]);
        if (cancel) return;
        const locMap = new Map(l.data.map((x) => [x.id, { nombre: x.nombre, logo_url: x.logo_url }]));
        setPromos(p.data.map((pr) => mapPromo(pr, locMap.get(pr.local_id))));
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
      try {
        const p = await api.promos.get(id);
        let loc: { nombre: string; logo_url: string | null } | undefined;
        try {
          const l = await api.locales.get(p.local_id);
          loc = { nombre: l.nombre, logo_url: l.logo_url };
        } catch {
          /* el local no está disponible: el beneficio igual se muestra */
        }
        if (cancel) return;
        setPromo(mapPromo(p, loc));
      } catch (e) {
        if (!cancel) {
          setPromo(null);
          setError(humanizeError(e));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  return { promo, loading, error };
}
