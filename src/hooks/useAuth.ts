// hooks/useAuth.ts
// Acceso al estado de sesión global. Azúcar sintáctico sobre AuthContext
// para que los componentes importen siempre desde `hooks/`.

import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
