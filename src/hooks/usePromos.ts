// hooks/usePromos.ts
// Lista y detalle de promos. Toda la data va por acá, nunca directo en componentes.
// Hoy devuelve mocks; el día de mañana se reemplaza por la llamada a Supabase
// SIN tocar los componentes que consumen el hook.

import { useEffect, useState } from 'react';
import type { Promo } from '@/types';
import { MOCK_PROMOS } from '@/data/mock';
// import { supabase } from '@/lib/supabase'; // ← descomentar cuando backend esté listo

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // TODO BACKEND:
        //   const { data, error } = await supabase
        //     .from('promos').select('*').eq('activo', true)
        //     .order('vigente_hasta', { ascending: true });
        //   if (error) throw error;
        await new Promise((r) => setTimeout(r, 350)); // simula latencia para ver el skeleton
        if (cancel) return;
        setPromos(MOCK_PROMOS.filter((p) => p.activo));
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : 'Error al cargar beneficios');
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
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
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // TODO BACKEND:
        //   const { data, error } = await supabase
        //     .from('promos').select('*').eq('id', id).single();
        //   if (error) throw error;
        await new Promise((r) => setTimeout(r, 300));
        if (cancel) return;
        const found = MOCK_PROMOS.find((p) => p.id === id) ?? null;
        setPromo(found);
        if (!found) setError('No encontramos ese beneficio');
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : 'Error al cargar el beneficio');
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    if (id) load();
    else {
      setLoading(false);
      setError('Beneficio inválido');
    }
    return () => {
      cancel = true;
    };
  }, [id]);

  return { promo, loading, error };
}
