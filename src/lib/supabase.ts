// lib/supabase.ts
// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER — este archivo lo posee el dev de backend.
// El cliente real de Supabase se inicializa acá. Mientras tanto dejamos un stub
// para que el proyecto compile. Los hooks (useAuth/usePromos/useSocio) NO importan
// este módulo todavía: trabajan con mocks y tienen marcado el punto de conexión
// con `// TODO BACKEND:`.
//
// Cuando el backend esté listo, reemplazar todo este archivo por algo como:
//
//   import { createClient } from '@supabase/supabase-js';
//   import type { Database } from '@/types/supabase'; // supabase gen types typescript
//
//   export const supabase = createClient<Database>(
//     import.meta.env.VITE_SUPABASE_URL,
//     import.meta.env.VITE_SUPABASE_ANON_KEY,
//   );
// ─────────────────────────────────────────────────────────────────────────────

/** Indica si las variables de entorno de Supabase están configuradas. */
export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Stub temporal. Acceder a cualquier propiedad avisa que falta el cliente real.
export const supabase = new Proxy(
  {},
  {
    get() {
      throw new Error(
        '[supabase] Cliente no inicializado. El backend dev debe reemplazar src/lib/supabase.ts con el cliente real.',
      );
    },
  },
) as never;
