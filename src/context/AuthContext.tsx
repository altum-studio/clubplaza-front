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

// Persistimos el perfil para sobrevivir un refresh sin depender de que /auth/me
// responda al instante (Render free tier puede tardar/caerse).
const PROFILE_KEY = 'clubplaza.profile';
function readStoredProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}
function storeProfile(p: Profile | null) {
  try {
    if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

// Código de socio corto y estable derivado del UUID: 6 caracteres alfanuméricos
// (sin 0/O/1/I para que no se confundan al tipearlo en el mostrador). El QR
// igual codifica el uid completo, que es lo que un endpoint de validación
// resolvería.
const COD_ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 chars, sin ambiguos
function numeroSocio(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, '') || '0';
  let n = 0n;
  for (const c of hex) n = n * 16n + BigInt(parseInt(c, 16));
  const base = BigInt(COD_ALFABETO.length);
  let out = '';
  for (let i = 0; i < 6; i++) {
    out = COD_ALFABETO[Number(n % base)] + out;
    n = n / base;
  }
  return out;
}

function profileToSocio(p: Profile): Socio {
  return {
    id: p.id,
    nombre: [p.nombre, p.apellido].filter(Boolean).join(' ').trim() || p.email,
    email: p.email,
    celular: p.telefono ?? '',
    dni: p.dni ?? '',
    fecha_nacimiento: p.fecha_nacimiento ?? '',
    // El código real viene del backend (profile.codigo). Fallback al derivado del
    // UUID solo si una sesión vieja todavía no lo trae.
    numero_socio: p.codigo || numeroSocio(p.id),
    token_qr: p.codigo || p.id,
    created_at: p.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // setProfile que además persiste (para sobrevivir un refresh).
  const setProfile = useCallback((p: Profile | null) => {
    setProfileState(p);
    storeProfile(p);
  }, []);

  // Solo un 401 definitivo (refresh fallido) tumba la sesión: el cliente API
  // nos avisa para limpiar el perfil.
  useEffect(() => {
    setUnauthorizedHandler(() => setProfile(null));
    return () => setUnauthorizedHandler(null);
  }, [setProfile]);

  // Rehidratar al montar: primero el perfil GUARDADO (optimista, así un refresh
  // mantiene al admin/local en SU panel al instante, sin parpadeo ni rebote), y
  // luego revalidamos contra /auth/me en segundo plano. Un error transitorio
  // (backend lento o caído) NO cierra la sesión; solo un 401 real lo hace
  // (vía onUnauthorized del cliente API).
  useEffect(() => {
    let active = true;
    const stored = readStoredProfile();
    if (stored) {
      setProfileState(stored);
      setIsLoading(false);
    }
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    api.auth
      .me()
      .then((r) => {
        if (active) setProfile(r.profile);
      })
      .catch(() => {
        /* error transitorio: conservamos la sesión guardada */
      })
      .finally(() => {
        if (active && !stored) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setProfile]);

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
