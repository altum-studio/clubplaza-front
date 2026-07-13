// pages/LocalPage.tsx
// Pantalla de un local (/local/:slug): info del local (logo + nombre + cantidad
// de beneficios) y la grilla de sus beneficios. Los datos salen de las promos
// (mock) filtradas por local.

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppCanvas } from '@/components/ui/AppCanvas';
import { LocalLogo } from '@/components/benefits/LocalLogo';
import { BenefitCard } from '@/components/benefits/BenefitCard';
import { BenefitCardSkeleton, ErrorState } from '@/components/feedback/States';
import { usePromos } from '@/hooks/usePromos';
import { useLocalesDir } from '@/hooks/useLocales';
import { slugify } from '@/lib/utils';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { DIAS_ORDEN, DIAS_SEMANA, rangosLabel } from '@/lib/opciones';

export default function LocalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { promos, loading, error } = usePromos();

  // Info del local desde el directorio (API). Funciona aunque no tenga beneficios.
  const { locales } = useLocalesDir();
  const local = useMemo(() => locales.find((l) => slugify(l.nombre) === slug), [locales, slug]);
  const delLocal = useMemo(
    () => promos.filter((p) => slugify(p.local_nombre) === slug),
    [promos, slug],
  );

  const hasBanner = !!local?.banner_url;

  return (
    <AppCanvas wide>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      {/* Banner 1200x600 (2:1): se muestra completo, sin recortar */}
      <div className="relative">
        {hasBanner ? (
          <img
            src={local!.banner_url}
            alt={local?.nombre ?? 'Local'}
            className="aspect-[2/1] w-full object-cover"
          />
        ) : (
          <div className="aspect-[2/1] w-full bg-gradient-to-br from-brand to-brand-dark" />
        )}

        {/* Botón Volver, siempre accesible sobre el banner */}
        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate(-1)}
          className="absolute left-3 top-[max(env(safe-area-inset-top),28px)] flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm hover:bg-black/40"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* Header verde con info del local */}
      <header className="-mt-4 rounded-b-[22px] rounded-t-[22px] bg-brand px-4 pb-5 pt-6">
        <div className="flex items-center gap-3.5">
          <LocalLogo
            src={local?.logo_url}
            name={local?.nombre ?? '—'}
            size={64}
            className="ring-2 ring-white/80"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-extrabold text-white">
              {local?.nombre ?? 'Local'}
            </h1>
            {local?.descripcion && (
              <p className="truncate text-[12px] text-white/80">{local.descripcion}</p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              {local && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {CATEGORIA_LABEL[local.rubro]}
                </span>
              )}
              {local && (
                <span className="text-[12px] text-white/85">Local {local.nro_local}</span>
              )}
              <span className="text-[12px] text-white/85">
                {delLocal.length === 1 ? '1 beneficio' : `${delLocal.length} beneficios`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Horarios */}
      {local?.horarios && (
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-line-soft p-4">
            <h2 className="mb-2.5 text-[15px] font-bold">Horarios</h2>
            <ul className="space-y-1.5">
              {DIAS_ORDEN.map((d) => {
                const h = local.horarios!.find((x) => x.dia === d);
                const cerrado = !h || h.cerrado || h.rangos.length === 0;
                return (
                  <li key={d} className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold">{DIAS_SEMANA[d].corto}</span>
                    <span className={cerrado ? 'text-mute' : 'text-graytext'}>
                      {h ? rangosLabel(h) : 'Cerrado'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Beneficios del local */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {error ? (
          <ErrorState message={error} onRetry={() => navigate(0)} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <BenefitCardSkeleton />
            <BenefitCardSkeleton />
          </div>
        ) : delLocal.length === 0 ? (
          <p className="px-2 py-10 text-center text-[13px] text-mute">
            No encontramos beneficios de este local.
          </p>
        ) : (
          <>
            <h2 className="mb-2.5 ml-0.5 text-[15px] font-bold">Beneficios</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {delLocal.map((p) => (
                <BenefitCard key={p.id} promo={p} />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </AppCanvas>
  );
}
