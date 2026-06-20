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
