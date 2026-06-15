// context/AuthContext.tsx
// Estado de auth GLOBAL del flujo de socio. Vive acá, nunca en componentes sueltos.
// Mientras el backend no esté: login/register simulan éxito y persisten el socio
// en localStorage para que las rutas protegidas funcionen tras un refresh.
// El panel admin tiene su PROPIO contexto de auth (no se mezcla con este).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RegisterFormData, Socio } from '@/types';
import { MOCK_SOCIO } from '@/data/mock';
import { ddmmaaaaToISO } from '@/lib/utils';

interface AuthContextType {
  socio: Socio | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
}

const STORAGE_KEY = 'clubplaza.socio';

const AuthContext = createContext<AuthContextType | null>(null);

// Genera un número de socio GP-XXXX-XXXX (solo para el mock; el backend lo hará en la DB).
function generarNumeroSocio(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `GP-${block()}-${block()}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [socio, setSocio] = useState<Socio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehidratar sesión al montar.
  useEffect(() => {
    // TODO BACKEND: reemplazar por supabase.auth.getSession() + fetch del socio.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSocio(JSON.parse(raw) as Socio);
    } catch {
      /* ignorar JSON inválido */
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((s: Socio | null) => {
    setSocio(s);
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      // TODO BACKEND: supabase.auth.signInWithPassword({ email, password })
      //   y luego traer el socio desde la tabla `socios`.
      await new Promise((r) => setTimeout(r, 500));
      persist({ ...MOCK_SOCIO, email });
    },
    [persist],
  );

  const register = useCallback(
    async (data: RegisterFormData) => {
      // TODO BACKEND: supabase.auth.signUp() + supabase.from('socios').insert(...)
      //   El backend genera numero_socio y token_qr; acá los simulamos.
      await new Promise((r) => setTimeout(r, 700));
      const nuevo: Socio = {
        id: `mock-${Date.now()}`,
        nombre: data.nombre,
        email: data.email,
        celular: data.celular,
        dni: data.dni,
        fecha_nacimiento: ddmmaaaaToISO(data.fecha_nacimiento) || data.fecha_nacimiento,
        numero_socio: generarNumeroSocio(),
        token_qr: `clubplaza-token-${crypto.randomUUID()}`,
        created_at: new Date().toISOString(),
      };
      persist(nuevo);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    // TODO BACKEND: supabase.auth.signOut()
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextType>(
    () => ({
      socio,
      isLoading,
      isAuthenticated: socio !== null,
      login,
      logout,
      register,
    }),
    [socio, isLoading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  return ctx;
}
