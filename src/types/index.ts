// types/index.ts
// Interfaces que espejean las tablas de Supabase.
// Cuando el backend genere los tipos (`supabase gen types typescript`),
// estas formas deben coincidir. No agregar campos sin avisar al backend dev.

// Rubros del directorio de Green Plaza (tabla de locales).
export type Categoria =
  | 'gastronomia' // Gastronomía
  | 'almacen' // Almacén
  | 'salud' // Salud y Bienestar
  | 'hogar' // Hogar y Mascotas
  | 'servicios' // Servicios
  | 'tecnologia'; // Tecnología y Movilidad

export interface Socio {
  id: string;
  nombre: string;
  email: string;
  celular: string;
  dni: string;
  fecha_nacimiento: string; // ISO date
  numero_socio: string; // formato: GP-XXXX-XXXX
  token_qr: string;
  created_at: string;
}

export interface Promo {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  local_nombre: string;
  local_logo_url: string;
  imagen_url: string;
  vigente_desde: string; // ISO date
  vigente_hasta: string; // ISO date
  // Días de la semana en que aplica el beneficio (0=Domingo … 6=Sábado).
  // TODO BACKEND: agregar esta columna a la tabla `promos` (ej: int[] o jsonb).
  dias: number[];
  como_usar: string[]; // array de pasos
  es_mundialista: boolean;
  activo: boolean;
}

export interface Local {
  id: string;
  nombre: string;
  logo_url: string;
  planta: string;
  categoria: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Backend real (Express + Supabase). El frontend consume la API REST documentada
// en clubplaza-frontend-prompt.md. Estas formas espejan EXACTO lo que devuelve
// la API. (Conviven con Socio/Promo/Local del flujo mock de socio existente.)
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'comun' | 'local' | 'admin';

export interface Profile {
  id: string; // UUID (auth uid)
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // ISO date
  email: string;
  dni: string;
  telefono: string;
  rol: Role;
  local_id: string | null; // solo rol "local"
  activo: boolean;
  created_at: string;
  locales?: { id: string; nombre: string } | null; // join cuando aplica
}

export interface ApiLocal {
  id: string;
  nombre: string;
  descripcion: string | null;
  piso: string | null;
  logo_url: string | null;
  activo: boolean;
  created_at: string;
  // en listado viene como [{ count }]; en detalle como Promo[].
  promos?: { count: number }[] | ApiPromo[];
  promos_count?: number;
}

export interface ApiPromo {
  id: string;
  local_id: string;
  titulo: string;
  descripcion: string | null;
  descuento: number | null; // ej 20 = 20%
  fecha_inicio: string | null;
  fecha_fin: string | null;
  imagen_url: string | null;
  activa: boolean;
  created_at: string;
  locales: { id: string; nombre: string; logo_url: string | null };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthResponse {
  user: { id: string; email: string };
  session: Session;
  profile: Profile;
}

export interface Paginated<T> {
  data: T[];
  count: number;
}

// Datos del formulario de alta (los campos de socio deben coincidir con la tabla
// `socios`; `password` es la excepción: se usa para supabase.auth.signUp(), no
// se persiste en la tabla).
export interface RegisterFormData {
  nombre: string;
  dni: string;
  fecha_nacimiento: string; // DD/MM/AAAA en el form, ISO al enviar
  email: string;
  celular: string;
  password: string;
  terminos: boolean;
}
