// landing/sections/Benefits.tsx
// Beneficios reales y vigentes. Celular: carrusel horizontal con snap y la
// siguiente tarjeta asomándose (invita a deslizar). Compu: grilla de 4.
// Si la API falla, la sección no se muestra (el resto de la landing sigue).

import { BenefitImage } from '@/components/benefits/BenefitImage';
import { BenefitValue } from '@/components/benefits/BenefitValue';
import { LocalLogo } from '@/components/benefits/LocalLogo';
import { valorLabel } from '@/lib/opciones';
import type { Promo } from '@/types';
import { URL_BENEFICIOS } from '../links';
import type { LandingData } from '../useLandingData';

const CARD = 'w-[78%] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none';

export function Benefits({ data }: { data: LandingData }) {
  if (data.status === 'error') return null;
  if (data.status === 'ready' && data.destacados.length === 0) return null;

  return (
    <section aria-labelledby="beneficios-titulo" className="bg-screen pb-12 pt-2 md:pb-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="px-5 md:px-[30px]">
          <p className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-graytext">Beneficios activos</p>
          <h2 id="beneficios-titulo" className="mt-1.5 text-[22px] font-extrabold leading-tight text-ink md:text-[30px]">
            Algunos de los beneficios que te esperan
          </h2>
        </div>

        <ul className="cp-noscrollbar mt-5 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-2 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-[30px]">
          {data.status === 'loading'
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className={CARD} aria-hidden="true">
                  <div className="overflow-hidden rounded-2xl border border-line-soft bg-white">
                    <div className="h-[124px] animate-pulse bg-fill" />
                    <div className="space-y-2.5 p-3.5">
                      <div className="h-3 w-1/2 animate-pulse rounded bg-fill" />
                      <div className="h-5 w-4/5 animate-pulse rounded bg-fill" />
                    </div>
                  </div>
                </li>
              ))
            : data.destacados.map((p) => (
                <li key={p.id} className={CARD}>
                  <BenefitTile promo={p} />
                </li>
              ))}
        </ul>

        <div className="mt-4 flex flex-col items-center gap-1.5 px-5 text-center">
          <a href={URL_BENEFICIOS} className="text-[14px] font-bold text-brand hover:underline">
            Ver todos los beneficios →
          </a>
          <p className="text-[11.5px] text-mute">Cada beneficio tiene sus condiciones en el local adherido.</p>
        </div>
      </div>
    </section>
  );
}

// Tarjeta según el design system (10.10): imagen + logo del local montado en el
// borde + nombre del local + título en verde 800. El valor ("20% OFF", "6 cuotas…")
// va como etiqueta solo si el título no lo dice ya.
function BenefitTile({ promo }: { promo: Promo }) {
  const etiqueta = valorLabel(promo.tipo, promo.valor);
  const mostrarValor =
    promo.tipo === 'descuento_fijo'
      ? promo.precio_nuevo != null
      : Boolean(etiqueta) && !promo.titulo.toLowerCase().includes(etiqueta.toLowerCase());

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line-soft bg-white shadow-[0_1px_2px_rgba(20,40,25,0.04)]">
      <div className="h-[124px] border-b border-line-soft">
        <BenefitImage src={promo.imagen_url} alt={`${promo.titulo} · ${promo.local_nombre}`} fallbackLabel={promo.local_nombre} />
      </div>
      <LocalLogo
        src={promo.local_logo_url}
        name={promo.local_nombre}
        size={38}
        className="absolute left-3 top-[124px] -translate-y-1/2 shadow"
      />
      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-2">
        <p className="flex min-h-[22px] items-center truncate pl-[42px] text-[12px] font-medium text-mute">{promo.local_nombre}</p>
        {mostrarValor && (
          <span className="mt-2 w-fit rounded-md bg-brand-soft px-2 py-0.5 text-[11.5px] font-extrabold text-brand">
            <BenefitValue
              tipo={promo.tipo}
              valor={promo.valor}
              precioAnterior={promo.precio_anterior}
              precioNuevo={promo.precio_nuevo}
            />
          </span>
        )}
        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-extrabold leading-[1.2] text-brand">{promo.titulo}</h3>
      </div>
    </article>
  );
}
