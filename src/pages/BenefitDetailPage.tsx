// pages/BenefitDetailPage.tsx
// Pantalla 3 · Detalle de beneficio (/beneficios/:id) — VARIANTE A del wireflow.
// Imagen hero con controles superpuestos + badges + título + "Cómo usarlo" (pasos)
// + CTA fijo "Ver mi credencial". Datos desde usePromo(id) (mock).

import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Button } from '@/components/ui/app-button';
import { BenefitBadge } from '@/components/benefits/BenefitBadge';
import { BenefitImage } from '@/components/benefits/BenefitImage';
import { ErrorState, Skeleton } from '@/components/feedback/States';
import { usePromo } from '@/hooks/usePromos';
import { labelCategoria } from '@/lib/categorias';
import { vigenteHoy } from '@/lib/utils';

export default function BenefitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { promo, loading, error } = usePromo(id);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: promo?.titulo ?? 'ClubPlaza', url });
      } catch {
        /* el usuario canceló */
      }
    } else {
      await navigator.clipboard?.writeText(url);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !promo) {
    return (
      <AppCanvas>
        <div className={`${STATUS_PAD} px-4`}>
          <button
            type="button"
            aria-label="Volver"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-graytext hover:bg-fill"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <ErrorState message={error ?? 'No encontramos ese beneficio'} onRetry={() => navigate('/beneficios')} />
      </AppCanvas>
    );
  }

  const vigente = vigenteHoy(promo.vigente_desde, promo.vigente_hasta);

  return (
    <AppCanvas>
      {/* Hero con controles superpuestos */}
      <div className="relative">
        <div className="h-[210px] w-full">
          <BenefitImage
            src={promo.imagen_url}
            alt={`${promo.titulo} · ${promo.local_nombre}`}
            fallbackLabel={promo.local_nombre}
          />
        </div>
        <div className={`${STATUS_PAD} absolute inset-x-3.5 top-0 flex justify-between`}>
          <button
            type="button"
            aria-label="Volver"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Compartir"
            onClick={onShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-[18px] pb-4 pt-4">
        <div className="mb-2.5 flex gap-1.5">
          <BenefitBadge>{labelCategoria(promo.categoria)}</BenefitBadge>
          {vigente && <BenefitBadge tone="gray">Vigente hoy</BenefitBadge>}
        </div>
        <h1 className="mb-1 text-[23px] font-extrabold text-brand">{promo.titulo}</h1>
        <p className="mb-3.5 text-sm font-medium text-ink">{promo.local_nombre}</p>
        <p className="mb-5 text-[13px] leading-relaxed text-graytext">{promo.descripcion}</p>

        <h2 className="mb-3 text-[13px] font-bold">Cómo usarlo</h2>
        <ol className="flex flex-col gap-2.5">
          {promo.como_usar.map((paso, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span className="pt-0.5 text-[12.5px] leading-snug text-graytext">{paso}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA fijo */}
      <div className="sticky bottom-0 flex gap-2.5 border-t border-line-soft bg-white px-[18px] pb-[max(env(safe-area-inset-bottom),22px)] pt-3">
        <a
          href="https://wa.me/"
          aria-label="Compartir por WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-[1.5px] border-brand text-brand"
          onClick={(e) => e.preventDefault() /* TODO: URL real del canal */}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3a7 7 0 00-6 10.5L3 17l3.7-1A7 7 0 1010 3z" />
            <path d="M7.5 7.8c.2 2 1.7 3.5 3.7 3.7.6.05 1-.5 1.1-.9l-1.4-.7-.7.6c-.7-.3-1.3-.9-1.6-1.6l.6-.7-.7-1.4c-.4.1-.95.5-.9 1.1z" />
          </svg>
        </a>
        <Button onClick={() => navigate('/credencial')}>Ver mi credencial</Button>
      </div>
    </AppCanvas>
  );
}

function DetailSkeleton() {
  return (
    <AppCanvas>
      <Skeleton className="h-[210px] w-full rounded-none" />
      <div className="flex-1 space-y-3 px-[18px] pt-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </AppCanvas>
  );
}
