// pages/LocalPage.tsx
// Pantalla de un local (/local/:slug): info del local (logo + nombre + cantidad
// de beneficios) y la grilla de sus beneficios. Los datos salen de las promos
// (mock) filtradas por local.

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { LocalLogo } from '@/components/benefits/LocalLogo';
import { BenefitCard } from '@/components/benefits/BenefitCard';
import { BenefitCardSkeleton, ErrorState } from '@/components/feedback/States';
import { usePromos } from '@/hooks/usePromos';
import { MOCK_LOCALES } from '@/data/mock';
import { slugify } from '@/lib/utils';

export default function LocalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { promos, loading, error } = usePromos();

  // Info del local desde el directorio (funciona aunque no tenga beneficios).
  const local = useMemo(() => MOCK_LOCALES.find((l) => slugify(l.nombre) === slug), [slug]);
  const delLocal = useMemo(
    () => promos.filter((p) => slugify(p.local_nombre) === slug),
    [promos, slug],
  );

  return (
    <AppCanvas>
      {/* Header verde con info del local */}
      <header className={`${STATUS_PAD} rounded-b-[22px] bg-brand px-4 pb-5`}>
        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate(-1)}
          className="-ml-1 mb-2 flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <ChevronLeft size={22} />
        </button>

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
            <p className="text-[12.5px] font-normal text-white/85">
              {delLocal.length === 1 ? '1 beneficio' : `${delLocal.length} beneficios`}
            </p>
          </div>
        </div>
      </header>

      {/* Beneficios del local */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {error ? (
          <ErrorState message={error} onRetry={() => navigate(0)} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
              {delLocal.map((p) => (
                <BenefitCard key={p.id} promo={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppCanvas>
  );
}
