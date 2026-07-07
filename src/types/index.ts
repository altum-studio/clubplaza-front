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
  numero_socio: string; // código corto: 6 alfanumérico (ej. A7K2QM)
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
  // Campos del modelo nuevo (ver backend-spec). Opcionales en el mock.
  tipo?: TipoBeneficio;
  valor?: number | null;
  // Para tipo 'descuento_fijo': precio anterior (tachado) y nuevo.
  precio_anterior?: number | null;
  precio_nuevo?: number | null;
  limite_cantidad?: number | null;
  limite_periodo?: LimitePeriodo;
  vigencia_indefinida?: boolean; // si true, ignora vigente_desde/hasta
}

export interface Local {
  id: string;
  nombre: string;
  logo_url: string;
  planta: string;
  categoria: string;
}

// Entrada del directorio de locales (mock del flujo de socio), con los campos
// nuevos para la pantalla del local (nro, rubro, horarios, banner).
export interface LocalDirectorio {
  nombre: string;
  logo_url: string;
  nro_local: string;
  rubro: Categoria;
  descripcion?: string;
  banner_url?: string;
  horarios?: HorarioDia[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Backend real (Express + Supabase). El frontend consume la API REST documentada
// en clubplaza-frontend-prompt.md. Estas formas espejan EXACTO lo que devuelve
// la API. (Conviven con Socio/Promo/Local del flujo mock de socio existente.)
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'comun' | 'local' | 'admin';

// Tipo de beneficio (lista predefinida; ver backend-spec-locales-beneficios.md).
export type TipoBeneficio =
  | '2x1'
  | '3x2'
  | 'descuento'
  | 'descuento_fijo'
  | 'cuotas'
  | 'combo'
  | 'regalo'
  | 'envio_gratis'
  | 'bonificacion';

// Período del límite de uso de un beneficio.
export type LimitePeriodo = 'dia' | 'semana' | 'mes' | 'vigencia' | 'ilimitado';

// Horario de apertura de un día (soporta turno cortado con varios rangos).
export interface HorarioDia {
  dia: number; // 0=Dom … 6=Sáb
  cerrado: boolean;
  rangos: [string, string][]; // [["10:00","13:00"], ["17:00","21:00"]]
}

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
  codigo: string; // código corto de credencial (6 chars, ej. A7K2QM) — va en el QR
  activo: boolean;
  created_at: string;
  locales?: { id: string; nombre: string } | null; // join cuando aplica
}

export interface ApiLocal {
  id: string;
  nombre: string;
  descripcion: string | null;
  piso: string | null; // DEPRECATED → usar nro_local
  nro_local?: string | null;
  rubro?: Categoria | null;
  logo_url: string | null;
  logo_svg?: string | null; // SVG inline (alternativa a logo_url)
  banner_url?: string | null;
  horarios?: HorarioDia[] | null;
  activo: boolean;
  created_at: string;
  // en listado viene como [{ count }]; en detalle como Promo[].
  promos?: { count: number }[] | ApiPromo[];
  promos_count?: number;
}

export interface ApiPromo {
  id: string;
  local_id: string;
  rubro?: Categoria | null; // se deriva del rubro del local
  titulo: string;
  tipo?: TipoBeneficio | null;
  valor?: number | null; // significado según `tipo` (no siempre)
  // Para tipo 'descuento_fijo': precio anterior (tachado) y precio nuevo.
  precio_anterior?: number | null;
  precio_nuevo?: number | null;
  descripcion: string | null;
  descuento: number | null; // DEPRECATED → usar `valor`
  dias?: number[] | null; // días válidos 0–6
  fecha_inicio: string | null; // DEPRECATED → vigencia_desde
  fecha_fin: string | null; // DEPRECATED → vigencia_hasta
  vigencia_desde?: string | null;
  vigencia_hasta?: string | null;
  limite_cantidad?: number | null;
  limite_periodo?: LimitePeriodo | null;
  imagen_url: string | null; // DEPRECATED → banner_url
  banner_url?: string | null;
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

// ─────────────── Validación de credencial / canjes ───────────────

export type EstadoCanje = 'ok' | 'rechazado' | 'repetido';

// Miembro devuelto por GET /usuarios/codigo/:codigo (ficha para el mostrador).
export interface MiembroPorCodigo {
  id: string;
  nombre: string;
  apellido: string;
  codigo: string;
  dni: string;
  activo: boolean;
  created_at: string;
}

// Respuesta de POST /escaneos (validar credencial).
export interface EscaneoResult {
  socio: { nombre: string; activo: boolean };
  beneficios_activos: number;
  escaneo_id: string;
}

export interface Canje {
  id: string;
  usuario_id: string;
  promo_id: string;
  local_id: string;
  estado: EstadoCanje;
  fecha: string; // ISO timestamptz
}

// Item del historial de canjes (join con usuario + promo).
export interface CanjeHistorialItem {
  id: string;
  fecha: string;
  estado: string;
  usuarios: { nombre: string; apellido: string; codigo: string };
  promos: { titulo: string };
}

// Item del historial de escaneos (Supabase devuelve el join bajo `usuarios`).
export interface EscaneoHistorialItem {
  id: string;
  escaneado_en: string;
  usuarios: { nombre: string; apellido: string; codigo: string };
}

// Métricas de canjes (GET /canjes/stats[/mine]).
export interface CanjeStats {
  canjes_mes: number;
  canjes_ultimos_7_dias: { fecha: string; cantidad: number }[];
  miembros_unicos_mes: number;
  beneficio_mas_canjeado: { promo_id: string; titulo: string; cantidad: number } | null;
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
