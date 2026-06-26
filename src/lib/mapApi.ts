// lib/mapApi.ts
// Adapta lo que devuelve el backend (ApiPromo / ApiLocal) a las formas que ya
// consumen las pantallas del socio (Promo / LocalDirectorio), para conectar el
// front a la API sin reescribir los componentes.

import type { ApiLocal, ApiPromo, Categoria, LocalDirectorio, Promo } from '@/types';

// El backend no guarda los "pasos" (como_usar) → usamos los genéricos con credencial.
export const PASOS_GENERICOS = [
  'Mostrá tu credencial digital en la caja',
  'El local valida tu credencial y tu DNI',
  'Aplican el beneficio. ¡Listo!',
];

export function mapPromo(p: ApiPromo, loc?: { nombre: string; logo_url: string | null }): Promo {
  const desde = p.vigencia_desde ?? p.fecha_inicio ?? '';
  const hasta = p.vigencia_hasta ?? p.fecha_fin ?? '';
  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion ?? '',
    categoria: (p.rubro ?? 'servicios') as Categoria,
    local_nombre: loc?.nombre ?? '',
    local_logo_url: loc?.logo_url ?? '',
    imagen_url: p.banner_url ?? p.imagen_url ?? '',
    vigente_desde: desde,
    vigente_hasta: hasta,
    dias: p.dias ?? [],
    como_usar: PASOS_GENERICOS,
    es_mundialista: false,
    activo: p.activa,
    tipo: p.tipo ?? undefined,
    valor: p.valor ?? null,
    limite_cantidad: p.limite_cantidad ?? null,
    limite_periodo: p.limite_periodo ?? undefined,
    vigencia_indefinida: !desde && !hasta,
  };
}

export function mapLocalDir(l: ApiLocal): LocalDirectorio {
  return {
    nombre: l.nombre,
    logo_url: l.logo_url ?? '',
    nro_local: l.nro_local ?? l.piso ?? '',
    rubro: (l.rubro ?? 'servicios') as Categoria,
    descripcion: l.descripcion ?? undefined,
    banner_url: l.banner_url ?? undefined,
    horarios: l.horarios ?? undefined,
  };
}
