// landing/useLandingData.ts
// Datos en vivo para la landing: beneficios vigentes y locales adheridos, desde
// los endpoints públicos de la API (sin login). Si el servidor no responde a
// tiempo, cae a los logos estáticos de /public/locales para que la página nunca
// quede vacía frente a alguien que llega desde un anuncio.

import { useEffect, useState } from 'react';
import type { ApiLocal, ApiPromo, LocalEstado, Promo } from '@/types';
import { api } from '@/lib/api';
import { mapPromo } from '@/lib/mapApi';
import { hoyAR } from '@/lib/fechas';
import { promoVencida } from '@/lib/opciones';

export interface LandingLocal {
  nombre: string;
  logo: string;
  estado?: LocalEstado;
}

export interface LandingData {
  status: 'loading' | 'ready' | 'error';
  /** Beneficios a mostrar (uno por local primero, con foto primero). */
  destacados: Promo[];
  locales: LandingLocal[];
  /** Beneficios vigentes en total (para el dato de la portada). */
  totalBeneficios: number;
  /** Locales abiertos (sin contar "próximamente"). */
  totalLocales: number;
}

const TIMEOUT_MS = 9000;
const MAX_DESTACADOS = 8;
const BASE = import.meta.env.BASE_URL;

// Respaldo si la API no responde: los logos que ya viven en /public/locales.
const LOCALES_RESPALDO: LandingLocal[] = [
  ['Almacén de Pizzas', 'almacen-de-pizzas'],
  ['BoyCut Barbershop', 'boycut-barbershop'],
  ['Bruce', 'bruce'],
  ['BYD', 'byd'],
  ['Concept Vision', 'concept-vision'],
  ['Crumbread', 'crumbread'],
  ['Deli Moon', 'deli-moon'],
  ['El Candil', 'el-candil'],
  ['Eneldo', 'eneldo'],
  ['Farmacia Maschwitz', 'farmacia-maschwitz'],
  ['iTech', 'itech'],
  ['Juan Valdez Café', 'juan-valdez-cafe'],
  ['Kaia Sushi', 'kaia-sushi'],
  ['La Juvenil', 'la-juvenil'],
  ['Mapache', 'mapache'],
  ['Matilda', 'matilda'],
  ['MaxiPet', 'maxipet'],
  ['Nyra', 'nyra'],
  ['Pannus', 'pannus'],
  ['Persicco', 'persicco'],
  ['Ramallo Club', 'ramallo-club'],
  ['SomosPalta', 'somospalta'],
  ['SportClub', 'sportclub'],
  ['Super 2000', 'super2000'],
].map(([nombre, slug]) => ({ nombre, logo: `${BASE}locales/${slug}.svg` }));

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

const tieneImagen = (p: ApiPromo) => Boolean(p.banner_url || p.imagen_url);

// Uno por local en cada "vuelta" (así no aparecen tres del mismo local seguidos),
// priorizando los que tienen foto.
function elegirDestacados(promos: ApiPromo[]): ApiPromo[] {
  const ordenadas = [...promos.filter(tieneImagen), ...promos.filter((p) => !tieneImagen(p))];
  const porLocal = new Map<string, ApiPromo[]>();
  for (const p of ordenadas) {
    const k = p.local_id ?? p.id;
    porLocal.set(k, [...(porLocal.get(k) ?? []), p]);
  }
  const grupos = [...porLocal.values()];
  const out: ApiPromo[] = [];
  for (let vuelta = 0; out.length < MAX_DESTACADOS; vuelta++) {
    let agrego = false;
    for (const g of grupos) {
      if (g[vuelta] && out.length < MAX_DESTACADOS) {
        out.push(g[vuelta]);
        agrego = true;
      }
    }
    if (!agrego) break;
  }
  return out;
}

export function useLandingData(): LandingData {
  const [data, setData] = useState<LandingData>({
    status: 'loading',
    destacados: [],
    locales: [],
    totalBeneficios: 0,
    totalLocales: 0,
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [p, l] = await withTimeout(
          Promise.all([api.promos.list({ activa: true, limit: 500 }), api.locales.list({ activo: true, limit: 500 })]),
          TIMEOUT_MS,
        );
        if (cancel) return;

        const localesVisibles = l.data.filter((x: ApiLocal) => x.estado !== 'inactivo');
        const abiertos = new Set(localesVisibles.filter((x) => x.estado !== 'proximamente').map((x) => x.id));
        const locMap = new Map(localesVisibles.map((x) => [x.id, { nombre: x.nombre, logo_url: x.logo_url }]));

        const hoy = hoyAR();
        // Solo beneficios vigentes de locales abiertos.
        const vigentes = p.data.filter((pr) => pr.activa && !promoVencida(pr, hoy) && abiertos.has(pr.local_id));

        setData({
          status: 'ready',
          destacados: elegirDestacados(vigentes).map((pr) => mapPromo(pr, locMap.get(pr.local_id))),
          // Abiertos primero; los "próximamente" al final (se muestran en gris).
          locales: [...localesVisibles]
            .sort((a, b) => Number(a.estado === 'proximamente') - Number(b.estado === 'proximamente'))
            .map((x) => ({ nombre: x.nombre, logo: x.logo_url ?? '', estado: x.estado })),
          totalBeneficios: vigentes.length,
          totalLocales: abiertos.size,
        });
      } catch {
        if (cancel) return;
        setData({ status: 'error', destacados: [], locales: LOCALES_RESPALDO, totalBeneficios: 0, totalLocales: 0 });
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return data;
}
