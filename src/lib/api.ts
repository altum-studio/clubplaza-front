// lib/api.ts
// Cliente HTTP de la API ClubPlaza (Express + Supabase). Centraliza:
//  - base URL (VITE_API_URL),
//  - inyección del header Authorization: Bearer <access_token>,
//  - manejo de 401 → refresh del token → reintento,
//  - parseo de errores con el formato { error } del backend.
//
// Los tokens viven en localStorage; el AuthContext los setea/limpia.

import type {
  ApiLocal,
  ApiPromo,
  AuthResponse,
  Canje,
  CanjeHistorialItem,
  CanjeStats,
  Categoria,
  EscaneoHistorialItem,
  EscaneoResult,
  MiembroPorCodigo,
  Paginated,
  Profile,
  Role,
  Session,
} from '@/types';

const BASE = `${import.meta.env.VITE_API_URL}/api`;

const ACCESS_KEY = 'clubplaza.access';
const REFRESH_KEY = 'clubplaza.refresh';

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export function setTokens(s: Session) {
  localStorage.setItem(ACCESS_KEY, s.access_token);
  localStorage.setItem(REFRESH_KEY, s.refresh_token);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// El backend (Express) corta el body del request en ~100 KB. Como los logos y
// banners viajan inline (data-URI), validamos el tamaño total antes de mandar
// para no caer en un 500 opaco.
export const MAX_BODY_BYTES = 90_000;
export function bodyTooLarge(payload: unknown): boolean {
  try {
    return new Blob([JSON.stringify(payload)]).size > MAX_BODY_BYTES;
  } catch {
    return false;
  }
}

// Traduce errores a un mensaje legible. Los errores de infraestructura del
// backend (no puede hablar con su base/Supabase, timeouts, DNS) llegan como
// "fetch failed" / 5xx y no le dicen nada al usuario: los mostramos amigable.
export function humanizeError(e: unknown): string {
  const msg = e instanceof Error ? e.message : '';
  if (!msg || /fetch failed|failed to fetch|networkerror|load failed|enotfound|getaddrinfo|timeout|supabase|internal server/i.test(msg)) {
    return 'El servidor no está disponible en este momento. Probá de nuevo en unos minutos.';
  }
  return msg;
}

// El AuthContext registra acá qué hacer cuando una sesión se cae sin remedio
// (refresh fallido): limpiar el perfil global.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

function qs(query?: Record<string, unknown>) {
  if (!query) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

async function parse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Error ${res.status}`);
  }
  return body;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const body = await res.json();
    if (body?.session) {
      setTokens(body.session as Session);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface ReqOpts {
  method?: string;
  body?: unknown;
  auth?: boolean; // default true
  query?: Record<string, unknown>;
  _retry?: boolean;
}

async function request<T>(path: string, opts: ReqOpts = {}): Promise<T> {
  const { method = 'GET', body, auth = true, query, _retry = false } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getAccessToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE}${path}${qs(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 con token vencido → intentamos refrescar y reintentar UNA vez.
  if (res.status === 401 && auth && !_retry) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, { ...opts, _retry: true });
    clearTokens();
    onUnauthorized?.();
  }

  return (await parse(res)) as T;
}

// Sube un archivo a POST /api/upload?tipo=logo|banner (multipart, campo `file`)
// y devuelve la URL pública. Reintenta una vez si el token está vencido.
async function uploadFile(file: File, tipo: 'logo' | 'banner'): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const doFetch = () => {
    const headers: Record<string, string> = {};
    const t = getAccessToken();
    if (t) headers.Authorization = `Bearer ${t}`;
    // Sin Content-Type: el browser pone el boundary del multipart.
    return fetch(`${BASE}/upload?tipo=${tipo}`, { method: 'POST', headers, body: fd });
  };
  let res = await doFetch();
  if (res.status === 401) {
    if (await tryRefresh()) res = await doFetch();
    else {
      clearTokens();
      onUnauthorized?.();
    }
  }
  const body = await parse(res);
  return String(body?.url ?? '');
}

// ─────────────────────── tipos de payload ───────────────────────
export interface RegisterPayload {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // ISO
  dni: string;
  telefono: string;
  rol?: Role;
}

type LocalInput = Partial<
  Pick<
    ApiLocal,
    | 'nombre'
    | 'descripcion'
    | 'piso'
    | 'nro_local'
    | 'rubro'
    | 'logo_url'
    | 'logo_svg'
    | 'banner_url'
    | 'horarios'
    | 'activo'
  >
>;
type PromoInput = Partial<
  Pick<
    ApiPromo,
    | 'local_id'
    | 'rubro'
    | 'titulo'
    | 'tipo'
    | 'valor'
    | 'precio_anterior'
    | 'precio_nuevo'
    | 'descripcion'
    | 'descuento'
    | 'dias'
    | 'fecha_inicio'
    | 'fecha_fin'
    | 'vigencia_desde'
    | 'vigencia_hasta'
    | 'limite_cantidad'
    | 'limite_periodo'
    | 'imagen_url'
    | 'banner_url'
    | 'activa'
  >
>;
type ProfileInput = Partial<
  Pick<Profile, 'nombre' | 'apellido' | 'fecha_nacimiento' | 'dni' | 'telefono' | 'rol' | 'local_id' | 'activo'>
> & { email?: string; password?: string };

// ─────────────────────── API ───────────────────────
export const api = {
  upload: (file: File, tipo: 'logo' | 'banner') => uploadFile(file, tipo),
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
    register: (payload: RegisterPayload) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: payload, auth: false }),
    me: () => request<{ user: { id: string; email: string }; profile: Profile }>('/auth/me'),
    // Recuperación de contraseña. `forgotPassword` dispara el mail con el link;
    // `resetPassword` recibe el token del link + la clave nueva. Ambos públicos.
    forgotPassword: (email: string) =>
      request<{ ok?: boolean; message?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim() },
        auth: false,
      }),
    resetPassword: (token: string, password: string) =>
      request<{ ok?: boolean; message?: string }>('/auth/reset-password', {
        method: 'POST',
        body: { token, password },
        auth: false,
      }),
  },
  usuarios: {
    updateMe: (body: Pick<ProfileInput, 'nombre' | 'apellido' | 'fecha_nacimiento' | 'telefono'>) =>
      request<Profile>('/usuarios/me', { method: 'PATCH', body }),
    list: (query?: { rol?: Role; local_id?: string; limit?: number; offset?: number }) =>
      request<Paginated<Profile>>('/usuarios', { query }),
    get: (id: string) => request<Profile>(`/usuarios/${id}`),
    // Buscar miembro por código de credencial (Panel Local/Admin). El backend
    // normaliza a mayúsculas, igual lo mandamos en upper por las dudas.
    byCodigo: (codigo: string) =>
      request<MiembroPorCodigo>(`/usuarios/codigo/${encodeURIComponent(codigo.trim().toUpperCase())}`),
    create: (body: ProfileInput) => request<Profile>('/usuarios', { method: 'POST', body }),
    update: (id: string, body: ProfileInput) => request<Profile>(`/usuarios/${id}`, { method: 'PATCH', body }),
    remove: (id: string) => request<{ id: string }>(`/usuarios/${id}`, { method: 'DELETE' }),
  },
  locales: {
    list: (query?: { activo?: boolean; limit?: number; offset?: number }) =>
      request<Paginated<ApiLocal>>('/locales', { query, auth: false }),
    get: (id: string) => request<ApiLocal>(`/locales/${id}`, { auth: false }),
    create: (body: LocalInput) => request<ApiLocal>('/locales', { method: 'POST', body }),
    update: (id: string, body: LocalInput) => request<ApiLocal>(`/locales/${id}`, { method: 'PATCH', body }),
    remove: (id: string) => request<{ id: string }>(`/locales/${id}`, { method: 'DELETE' }),
    mine: () => request<ApiLocal>('/locales/mine/mi-local'),
    updateMine: (body: LocalInput) => request<ApiLocal>('/locales/mine/mi-local', { method: 'PATCH', body }),
  },
  promos: {
    list: (query?: { local_id?: string; rubro?: Categoria; activa?: boolean; limit?: number; offset?: number }) =>
      request<Paginated<ApiPromo>>('/promos', { query, auth: false }),
    get: (id: string) => request<ApiPromo>(`/promos/${id}`, { auth: false }),
    create: (body: PromoInput) => request<ApiPromo>('/promos', { method: 'POST', body }),
    update: (id: string, body: PromoInput) => request<ApiPromo>(`/promos/${id}`, { method: 'PATCH', body }),
    remove: (id: string) => request<{ id: string }>(`/promos/${id}`, { method: 'DELETE' }),
    mine: (query?: { activa?: boolean; limit?: number; offset?: number }) =>
      request<Paginated<ApiPromo>>('/promos/mine/mis-promos', { query }),
    createMine: (body: PromoInput) => request<ApiPromo>('/promos/mine/mis-promos', { method: 'POST', body }),
  },
  // Validar credencial (registra el escaneo + lista historial del local).
  escaneos: {
    create: (codigo: string) =>
      request<EscaneoResult>('/escaneos', { method: 'POST', body: { codigo: codigo.trim().toUpperCase() } }),
    mine: (query?: { desde?: string; hasta?: string; limit?: number; offset?: number }) =>
      request<Paginated<EscaneoHistorialItem>>('/escaneos/mine', { query }),
  },
  // Canjes: registrar, historial (local/admin) y métricas.
  canjes: {
    create: (body: { codigo?: string; usuario_id?: string; promo_id: string }) =>
      request<Canje>('/canjes', {
        method: 'POST',
        body: body.codigo ? { ...body, codigo: body.codigo.trim().toUpperCase() } : body,
      }),
    mine: (query?: { desde?: string; hasta?: string; estado?: string; limit?: number; offset?: number }) =>
      request<Paginated<CanjeHistorialItem>>('/canjes/mine', { query }),
    list: (query?: {
      local_id?: string;
      promo_id?: string;
      desde?: string;
      hasta?: string;
      estado?: string;
      limit?: number;
      offset?: number;
    }) => request<Paginated<CanjeHistorialItem>>('/canjes', { query }),
    statsMine: () => request<CanjeStats>('/canjes/stats/mine'),
    stats: (query?: { local_id?: string }) => request<CanjeStats>('/canjes/stats', { query }),
  },
};
