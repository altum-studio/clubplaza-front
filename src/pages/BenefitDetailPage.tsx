// pages/BenefitDetailPage.tsx
// Pantalla 3 · Detalle de beneficio (/beneficios/:id) — VARIANTE A del wireflow.
// Imagen hero con controles superpuestos + badges + título + "Cómo usarlo" (pasos)
// + CTA fijo "Ver mi credencial". Datos desde usePromo(id) (mock).

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, QrCode, Share2, Tag, Calendar, Clock, Repeat } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Button } from '@/components/ui/app-button';
import { BenefitBadge } from '@/components/benefits/BenefitBadge';
import { BenefitImage } from '@/components/benefits/BenefitImage';
import { LocalLogo } from '@/components/benefits/LocalLogo';
import { CredentialOverlay } from '@/components/credential/CredentialOverlay';
import { ErrorState, Skeleton } from '@/components/feedback/States';
import { usePromo } from '@/hooks/usePromos';
import { useAuth } from '@/hooks/useAuth';
import { labelCategoria } from '@/lib/categorias';
import { tipoBeneficioLabel, vigenciaLabel, diasLabel, limiteLabel } from '@/lib/opciones';
import { BenefitValue } from '@/components/benefits/BenefitValue';
import { vigenteHoy } from '@/lib/utils';

export default function BenefitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { promo, loading, error } = usePromo(id);
  const { isAuthenticated } = useAuth();
  const [credOpen, setCredOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  // Sin sesión, "Ver mi credencial" lleva a la pantalla de ingreso.
  const verCredencial = () =>
    isAuthenticated ? setCredOpen(true) : navigate('/ingresar');

  const flashShare = (msg: string) => {
    setShareMsg(msg);
    setTimeout(() => setShareMsg(null), 2500);
  };

  const onShare = async () => {
    const url = window.location.href;
    const data = {
      title: promo?.titulo ?? 'ClubPlaza',
      text: promo ? `${promo.titulo} · ${promo.local_nombre} — ClubPlaza` : 'ClubPlaza',
      url,
    };
    // Web Share API nativa (celular / navegadores compatibles).
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return; // canceló
        /* otra falla → caemos al copiado */
      }
    }
    // Fallback (desktop): copiar el link, con feedback visible.
    try {
      await navigator.clipboard.writeText(url);
      flashShare('Link copiado al portapapeles');
    } catch {
      flashShare('No se pudo compartir. Copiá el link de la barra.');
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

        {/* Logo del local montado en el borde inferior de la imagen */}
        <LocalLogo
          src={promo.local_logo_url}
          name={promo.local_nombre}
          size={56}
          className="absolute bottom-0 right-[18px] translate-y-1/2 shadow-md"
        />
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-[18px] pb-4 pt-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <BenefitBadge>{labelCategoria(promo.categoria)}</BenefitBadge>
          {vigente && <BenefitBadge tone="gray">Vigente hoy</BenefitBadge>}
          {promo.tipo && (
            <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
              <BenefitValue
                tipo={promo.tipo}
                valor={promo.valor}
                precioAnterior={promo.precio_anterior}
                precioNuevo={promo.precio_nuevo}
              />
            </span>
          )}
        </div>
        <h1 className="mb-1 text-[23px] font-extrabold text-brand">{promo.titulo}</h1>
        <p className="mb-3.5 text-sm font-medium text-ink">{promo.local_nombre}</p>
        <p className="mb-5 text-[13px] leading-relaxed text-graytext">{promo.descripcion}</p>

        {/* Detalles del beneficio (modelo nuevo) */}
        <div className="mb-5 rounded-2xl border border-line-soft p-4">
          <ul className="flex flex-col gap-3.5">
            {promo.tipo && (
              <DetailRow icon={Tag} label="Tipo" value={tipoBeneficioLabel(promo.tipo)} />
            )}
            <DetailRow icon={Clock} label="Días válidos" value={diasLabel(promo.dias)} />
            <DetailRow
              icon={Calendar}
              label="Vigencia"
              value={vigenciaLabel({
                indefinida: promo.vigencia_indefinida,
                desde: promo.vigente_desde,
                hasta: promo.vigente_hasta,
              })}
            />
            <DetailRow
              icon={Repeat}
              label="Límite de uso"
              value={limiteLabel(promo.limite_cantidad, promo.limite_periodo)}
            />
          </ul>
        </div>

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

      {/* CTA fijo: abre la credencial desde abajo (sin salir del beneficio) */}
      <div className="sticky bottom-0 border-t border-line-soft bg-white px-[18px] pb-[max(env(safe-area-inset-bottom),22px)] pt-3">
        <Button onClick={verCredencial}>
          <QrCode size={18} />
          Ver mi credencial
        </Button>
      </div>

      {/* Feedback de compartir (fallback de copiado) */}
      {shareMsg && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6">
          <div className="rounded-full bg-ink/90 px-4 py-2 text-center text-[12.5px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
            {shareMsg}
          </div>
        </div>
      )}

      {/* Credencial superpuesta (sube desde abajo) */}
      <CredentialOverlay open={credOpen} onClose={() => setCredOpen(false)} />
    </AppCanvas>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 flex-shrink-0 text-mute" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-wide text-mute">{label}</span>
        <span className="text-[13px] font-semibold text-ink">{value}</span>
      </div>
    </li>
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
