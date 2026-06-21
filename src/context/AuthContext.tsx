// context/AuthContext.tsx
// Estado de auth GLOBAL conectado al backend real (Express + Supabase).
// Guarda perfil + tokens, rehidrata la sesión al montar (GET /auth/me),
// y maneja login/register/logout. Expone el `rol` para el control de acceso.
//
// Compat: el flujo de socio existente consume `socio` (forma vieja). Lo
// derivamos del Profile para no romper esas pantallas (credencial, home).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Profile, RegisterFormData, Role, Socio } from '@/types';
import {
  api,
  clearTokens,
  getAccessToken,
  setTokens,
  setUnauthorizedHandler,
  type RegisterPayload,
} from '@/lib/api';
import { ddmmaaaaToISO } from '@/lib/utils';

interface AuthContextType {
  profile: Profile | null;
  role: Role | null;
  socio: Socio | null; // compat con el flujo de socio (derivado del profile)
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Profile>;
  register: (data: RegisterFormData) => Promise<Profile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Número de socio legible derivado del UUID (estable). El QR codifica el uid,
// que es lo que un endpoint de validación usaría para resolver al miembro.
function numeroSocio(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, '').toUpperCase();
  return `GP-${(hex.slice(0, 4) || '0000').padEnd(4, '0')}-${(hex.slice(4, 8) || '0000').padEnd(4, '0')}`;
}

function profileToSocio(p: Profile): Socio {
  return {
    id: p.id,
    nombre: [p.nombre, p.apellido].filter(Boolean).join(' ').trim() || p.email,
    email: p.email,
    celular: p.telefono ?? '',
    dni: p.dni ?? '',
    fecha_nacimiento: p.fecha_nacimiento ?? '',
    numero_socio: numeroSocio(p.id),
    token_qr: p.id,
    created_at: p.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Si el refresh falla, el cliente API limpia tokens y nos avisa para borrar el perfil.
  useEffect(() => {
    setUnauthorizedHandler(() => setProfile(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Rehidratar sesión al montar: si hay token, traemos el perfil real.
  useEffect(() => {
    let active = true;
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    api.auth
      .me()
      .then((r) => active && setProfile(r.profile))
      .catch(() => {
        if (!active) return;
        clearTokens();
        setProfile(null);
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setTokens(res.session);
    setProfile(res.profile);
    return res.profile;
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    // El form de socio trae un solo "nombre completo" y "celular"; el backend
    // espera nombre + apellido + telefono. Mapeamos lo mejor posible.
    const partes = data.nombre.trim().split(/\s+/);
    const nombre = partes[0] ?? data.nombre;
    const apellido = partes.slice(1).join(' ') || nombre;
    const payload: RegisterPayload = {
      email: data.email,
      password: data.password,
      nombre,
      apellido,
      fecha_nacimiento: ddmmaaaaToISO(data.fecha_nacimiento) || data.fecha_nacimiento,
      dni: data.dni,
      telefono: data.celular,
      rol: 'comun',
    };
    const res = await api.auth.register(payload);
    setTokens(res.session);
    setProfile(res.profile);
    return res.profile;
  }, []);

  const logout = useCallback(async () => {
    // No hay endpoint de logout: limpiamos sesión del lado del cliente.
    clearTokens();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const r = await api.auth.me();
    setProfile(r.profile);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      profile,
      role: profile?.rol ?? null,
      socio: profile ? profileToSocio(profile) : null,
      isLoading,
      isAuthenticated: profile !== null,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [profile, isLoading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  return ctx;
}
