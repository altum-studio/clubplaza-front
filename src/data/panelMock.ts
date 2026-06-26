// data/panelMock.ts
// Datos de ejemplo para los paneles web (Admin/Local), media fidelidad.
// TODO BACKEND: reemplazar por queries reales (locales, beneficios, canjes…).

import type { NavItem } from '@/components/panel/PanelShell';

// ── Navegación (producción = variante sidebar A) ──
export const ADMIN_NAV: NavItem[] = [
  { icon: 'dash', label: 'Dashboard', to: '/admin' },
  { icon: 'store', label: 'Locales', to: '/admin/locales' },
  { icon: 'tag', label: 'Beneficios', to: '/admin/beneficios' },
  { icon: 'users', label: 'Usuarios', to: '/admin/usuarios' },
];

export const LOCAL_NAV: NavItem[] = [
  { icon: 'dash', label: 'Inicio', to: '/panel' },
  { icon: 'qr', label: 'Validar', to: '/panel/validar' },
  { icon: 'tag', label: 'Beneficios', to: '/panel/beneficios' },
  { icon: 'chart', label: 'Stats', to: '/panel/estadisticas' },
  { icon: 'clock', label: 'Historial', to: '/panel/historial' },
];

// ── Admin ──
export const ALTAS = [180, 240, 210, 320, 380, 410, 520, 480, 610, 720, 690, 840];
export const MESES = ['J', 'J', 'A', 'S', 'O', 'N', 'D', 'E', 'F', 'M', 'A', 'M'];

export interface LocalRow {
  nom: string;
  rubro: string;
  bene: number;
  canjes: string;
  estado: 'ok' | 'pend' | 'baja';
}
export const LOCALES: LocalRow[] = [
  { nom: 'Café Central', rubro: 'Gastronomía', bene: 3, canjes: '2.480', estado: 'ok' },
  { nom: 'Indumentaria Norte', rubro: 'Indumentaria', bene: 2, canjes: '1.130', estado: 'ok' },
  { nom: 'Farmacia Plaza', rubro: 'Salud', bene: 1, canjes: '845', estado: 'ok' },
  { nom: 'TecnoHogar', rubro: 'Tecnología', bene: 4, canjes: '612', estado: 'pend' },
  { nom: 'Bazar del Sol', rubro: 'Hogar', bene: 0, canjes: '0', estado: 'baja' },
];

export interface ColaItem {
  n: string;
  loc: string;
  nuevo?: boolean;
}
export const COLA: ColaItem[] = [
  { n: '3 cuotas sin interés', loc: 'TecnoHogar', nuevo: true },
  { n: 'Combo familiar 4x3', loc: 'Pizzería Roma', nuevo: true },
  { n: '30% en óptica', loc: 'Visión Plaza', nuevo: true },
  { n: 'Descuento estudiantes', loc: 'Librería Sur' },
  { n: '2x1 en cine', loc: 'CineClub' },
  { n: 'Envío gratis +$20k', loc: 'MercadoYa' },
  { n: '15% en gimnasio', loc: 'FitPlaza' },
];

// ── Local ──
export const CANJES_DIA = [42, 38, 51, 47, 63, 88, 71];
export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const SERIE_MES = [120, 138, 131, 156, 149, 172, 168, 190, 184, 205, 221, 248];

export interface Validacion {
  hora: string;
  miembro: string;
  cod: string;
  ben: string;
  estado: 'ok' | 'dup' | 'rej';
}
export const VALIDACIONES: Validacion[] = [
  { hora: '14:32', miembro: 'María González', cod: 'A7K2QM', ben: '2x1 en cafetería', estado: 'ok' },
  { hora: '14:18', miembro: 'Lucas Pérez', cod: 'B4N8RP', ben: '2x1 en cafetería', estado: 'ok' },
  { hora: '13:51', miembro: 'Sofía Romero', cod: 'C9L3TX', ben: '15% en pastelería', estado: 'ok' },
  { hora: '13:40', miembro: 'Diego Sosa', cod: 'D2A5CK', ben: '2x1 en cafetería', estado: 'dup' },
  { hora: '13:12', miembro: 'Carla Núñez', cod: 'F6G7HJ', ben: '15% en pastelería', estado: 'ok' },
  { hora: '12:58', miembro: 'Pedro Maidana', cod: 'H8U9YK', ben: '2x1 en cafetería', estado: 'ok' },
  { hora: '12:30', miembro: 'Valentina Cruz', cod: 'J3E4RT', ben: '15% en pastelería', estado: 'rej' },
  { hora: '11:47', miembro: 'Tomás Vega', cod: 'K7Y8UP', ben: '2x1 en cafetería', estado: 'ok' },
  { hora: '11:20', miembro: 'Julieta Paz', cod: 'M2Q3WE', ben: 'Envío sin cargo', estado: 'ok' },
];

export interface BeneficioLocal {
  n: string;
  dias: string;
  canjes: string;
  estado: 'ok' | 'warn' | 'off';
}
export const BENES_LOCAL: BeneficioLocal[] = [
  { n: '2x1 en cafetería', dias: 'Lun a Vie', canjes: '312', estado: 'ok' },
  { n: '15% en pastelería', dias: 'Todos los días', canjes: '88', estado: 'ok' },
  { n: 'Combo desayuno $4.900', dias: 'Fin de semana', canjes: '0', estado: 'warn' },
  { n: 'Envío sin cargo', dias: 'Lun a Jue', canjes: '54', estado: 'off' },
];
