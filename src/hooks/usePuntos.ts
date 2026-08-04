// hooks/usePuntos.ts
// Sistema de puntos (feature "Niveles"). Por ahora devuelve datos PLACEHOLDER:
// todos los números son 00 a propósito — la lógica de negocio (puntos por uso,
// umbrales de nivel, duración del plazo) la define producto. La estructura sí es
// la definitiva, así que cuando exista el backend se reemplaza la fuente sin
// tocar la UI.
//
// TODO BACKEND: traer saldo, meta del tramo, nivel actual/base/próximo, fecha
// límite, lista de niveles con su beneficio, e historial de movimientos.

export type NivelEstado = 'done' | 'current' | 'todo';

export interface PtCupon {
  titulo: string;
  estado: 'activo' | 'usado';
}

export interface PtNivel {
  n: number; // número de nivel
  estado: NivelEstado;
  cupon?: PtCupon | null; // beneficio exclusivo del nivel (si ya se desbloqueó)
}

export interface PtMovimiento {
  id: string;
  titulo: string; // "Beneficio usado · 2x1"
  local: string; // "Local adherido"
  rubro: string; // "Gastronomía"
  puntos: number; // +00
  momento: string; // "Hoy" | "Ayer" | "Hace 00 días"
}

export interface PuntosData {
  saldo: number; // 00
  meta: number; // 00 (meta del tramo actual)
  nivelActual: number; // 00
  nivelBase: number; // 00 (nivel base del tramo)
  nivelProximo: number; // 00
  fechaLimite: string; // "00/00/00"
  diasRestantes: number; // 00
  faltanPuntos: number; // 00
  niveles: PtNivel[];
  historial: PtMovimiento[];
  // Código del beneficio exclusivo (mono). Placeholder hasta el backend.
  codigoBeneficio: string;
}

const PLACEHOLDER: PuntosData = {
  saldo: 0,
  meta: 0,
  nivelActual: 0,
  nivelBase: 0,
  nivelProximo: 0,
  fechaLimite: '00/00/00',
  diasRestantes: 0,
  faltanPuntos: 0,
  codigoBeneficio: 'MVRYR9',
  niveles: [
    { n: 1, estado: 'done', cupon: { titulo: 'Beneficio exclusivo Nivel 1', estado: 'activo' } },
    { n: 2, estado: 'done', cupon: { titulo: 'Beneficio exclusivo Nivel 2', estado: 'usado' } },
    { n: 3, estado: 'current', cupon: null },
    { n: 4, estado: 'todo', cupon: null },
  ],
  historial: [
    { id: 'h1', titulo: 'Beneficio usado · 2x1', local: 'Local adherido', rubro: 'Gastronomía', puntos: 0, momento: 'Hoy' },
    { id: 'h2', titulo: 'Beneficio usado · Descuento', local: 'Local adherido', rubro: 'Indumentaria', puntos: 0, momento: 'Ayer' },
    { id: 'h3', titulo: 'Beneficio usado · Combo', local: 'Local adherido', rubro: 'Gastronomía', puntos: 0, momento: 'Hace 00 días' },
    { id: 'h4', titulo: 'Beneficio usado · Descuento', local: 'Local adherido', rubro: 'Salud', puntos: 0, momento: 'Hace 00 días' },
  ],
};

export function usePuntos() {
  // Cuando exista el backend, acá va el fetch (con loading/error).
  return { data: PLACEHOLDER, loading: false, error: null as string | null };
}
