// lib/exportCampanias.ts
// Exportación de miembros para campañas (solo admin). Arma un CSV con datos de
// contacto y comportamiento AGREGADO de canjes. Nunca incluye DNI, código de
// credencial, IDs internos ni el detalle canje por canje.

import type { ApiLocal, CanjeHistorialItem, Profile } from '@/types';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { fechaAR, hoyAR } from '@/lib/fechas';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const COLUMNAS = [
  'Nombre',
  'Apellido',
  'Email',
  'Celular',
  'Edad',
  'Mes de cumpleaños',
  'Miembro desde',
  'Canjes',
  'Último canje',
  'Rubro favorito',
  'Local favorito',
] as const;

// Edad cumplida a la fecha `hoy` (YYYY-MM-DD). '' si no hay fecha válida.
function edad(nac: string, hoy: string): string {
  const n = nac.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n)) return '';
  let e = Number(hoy.slice(0, 4)) - Number(n.slice(0, 4));
  if (hoy.slice(5) < n.slice(5)) e--;
  return e >= 0 && e < 130 ? String(e) : '';
}

function mesCumple(nac: string): string {
  const m = Number(nac.slice(5, 7));
  return MESES[m - 1] ?? '';
}

/** Miembros a exportar: rol Miembro y cuenta activa. */
export function miembrosExportables(usuarios: Profile[]): Profile[] {
  return usuarios.filter((u) => u.rol === 'comun' && u.activo);
}

export function filasCampania(
  usuarios: Profile[],
  canjes: CanjeHistorialItem[],
  locales: ApiLocal[],
): string[][] {
  const hoy = hoyAR();
  const localById = new Map(locales.map((l) => [l.id, l]));
  const porCodigo = new Map(usuarios.map((u) => [u.codigo, u.id]));

  // Agregado por miembro: cantidad, último canje y local más frecuente.
  type Agg = { n: number; ultimo: string; porLocal: Map<string, number> };
  const agg = new Map<string, Agg>();
  for (const c of canjes) {
    if (c.estado !== 'ok') continue;
    const uid = c.usuario_id ?? (c.usuarios?.codigo ? porCodigo.get(c.usuarios.codigo) : undefined);
    if (!uid) continue;
    const a = agg.get(uid) ?? { n: 0, ultimo: '', porLocal: new Map() };
    a.n++;
    const f = fechaAR(c.fecha);
    if (f > a.ultimo) a.ultimo = f;
    if (c.local_id) a.porLocal.set(c.local_id, (a.porLocal.get(c.local_id) ?? 0) + 1);
    agg.set(uid, a);
  }

  return miembrosExportables(usuarios).map((u) => {
    const a = agg.get(u.id);
    let favorito: ApiLocal | undefined;
    if (a) {
      let max = 0;
      for (const [id, n] of a.porLocal) {
        if (n > max) {
          max = n;
          favorito = localById.get(id);
        }
      }
    }
    return [
      u.nombre ?? '',
      u.apellido ?? '',
      u.email ?? '',
      u.telefono ?? '',
      edad(u.fecha_nacimiento ?? '', hoy),
      mesCumple(u.fecha_nacimiento ?? ''),
      fechaAR(u.created_at),
      String(a?.n ?? 0),
      a?.ultimo ?? '',
      favorito?.rubro ? CATEGORIA_LABEL[favorito.rubro] : '',
      favorito?.nombre ?? '',
    ];
  });
}

// CSV con BOM (para que Excel lea los acentos) y separador ';' (Excel en
// español lo abre en columnas directo). Google Sheets también lo entiende.
export function aCSV(filas: string[][]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lineas = [COLUMNAS.map(esc).join(';'), ...filas.map((f) => f.map(esc).join(';'))];
  return `\uFEFF${lineas.join('\r\n')}`;
}

export function descargarCSV(contenido: string, nombre: string) {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const nombreArchivo = () => `clubplaza-miembros-${hoyAR()}.csv`;
