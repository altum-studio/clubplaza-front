// context/LocalScopeContext.tsx
// "Local activo" del panel de comercio. Un usuario rol `local` puede gestionar
// VARIOS locales (tabla intermedia en el back). Este contexto carga la lista
// (api.locales.mias) y expone el local seleccionado; el panel scopea todo a él.
// El seleccionado se persiste en localStorage.

import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ApiLocal } from '@/types';

const KEY = 'clubplaza.activeLocal';

export interface LocalScope {
  misLocales: ApiLocal[];
  activeLocalId: string | null;
  activeLocal: ApiLocal | null;
  setActiveLocalId: (id: string) => void;
  /** true mientras se cargan los locales del usuario. */
  loading: boolean;
  reload: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const LocalScopeCtx = createContext<LocalScope | null>(null);

export function LocalScopeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const isLocal = profile?.rol === 'local';

  const [misLocales, setMisLocales] = useState<ApiLocal[]>([]);
  const [activeLocalId, setActive] = useState<string | null>(() => localStorage.getItem(KEY));
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLocal) {
      setMisLocales([]);
      return;
    }
    let cancel = false;
    setLoading(true);
    api.locales
      .mias()
      .then((list) => {
        if (cancel) return;
        const arr = Array.isArray(list) ? list : [];
        setMisLocales(arr);
        // Mantener el guardado si sigue siendo válido; si no, el primero.
        setActive((cur) => {
          if (cur && arr.some((l) => l.id === cur)) return cur;
          const first = arr[0]?.id ?? null;
          if (first) localStorage.setItem(KEY, first);
          return first;
        });
      })
      .catch(() => {
        if (!cancel) setMisLocales([]);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [isLocal, profile?.id, tick]);

  const setActiveLocalId = (id: string) => {
    setActive(id);
    localStorage.setItem(KEY, id);
  };

  const value = useMemo<LocalScope>(
    () => ({
      misLocales,
      activeLocalId,
      activeLocal: misLocales.find((l) => l.id === activeLocalId) ?? null,
      setActiveLocalId,
      loading,
      reload: () => setTick((t) => t + 1),
    }),
    [misLocales, activeLocalId, loading],
  );

  return <LocalScopeCtx.Provider value={value}>{children}</LocalScopeCtx.Provider>;
}
