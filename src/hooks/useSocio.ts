// hooks/useSocio.ts
// Datos del socio logueado. Por ahora los toma del AuthContext (mock).
// Cuando exista el backend, este hook puede traer datos extra del socio
// (historial de canjes, favoritos, etc.) desde Supabase.

import { useAuth } from '@/hooks/useAuth';

export function useSocio() {
  const { socio, isLoading } = useAuth();

  // TODO BACKEND: si hace falta data extendida del socio:
  //   const { data } = await supabase.from('socios').select('*').eq('id', socio.id).single();

  return { socio, loading: isLoading };
}
