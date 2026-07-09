// hooks/useLocalScope.ts
// Acceso al "local activo" del panel (ver LocalScopeContext).

import { useContext } from 'react';
import { LocalScopeCtx } from '@/context/LocalScopeContext';

export function useLocalScope() {
  const ctx = useContext(LocalScopeCtx);
  if (!ctx) throw new Error('useLocalScope debe usarse dentro de <LocalScopeProvider>');
  return ctx;
}
