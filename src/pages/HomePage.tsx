// pages/HomePage.tsx
// Pantalla 2 · Home / Beneficios (/beneficios) — VARIANTE B del wireflow.
// Header verde compacto + "Beneficio del día" (hero) + fila de filtros + grid
// "Más beneficios" + barra de WhatsApp al pie. Datos desde usePromos() (mock).
// Sin banner Mundialistas y sin bottom nav (la variante B no los incluye).

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Search, ChevronDown } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/app-button';
import { BenefitBadge } from '@/components/benefits/BenefitBadge';
import { BenefitCard } from '@/components/benefits/BenefitCard';
import { BenefitImage } from '@/components/benefits/BenefitImage';
import { BenefitCardSkeleton, ErrorState, Skeleton } from '@/components/feedback/States';
import { usePromos } from '@/hooks/usePromos';
import { RUBROS, labelCategoria } from '@/lib/categorias';
import type { Categoria } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { promos, loading, error } = usePromos();
  const [rubro, setRubro] = useState<Categoria | 'todos'>('todos');

  const hero = promos[0];
  const masBeneficios = useMemo(() => {
    const rest = promos.slice(1);
    return rubro === 'todos' ? rest : rest.filter((p) => p.categoria === rubro);
  }, [promos, rubro]);

  return (
    <AppCanvas>
      {/* Header verde compacto */}
      <header className={`${STATUS_PAD} bg-brand px-4 pb-3.5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-0.5 text-[11px] font-normal text-white/75">Hola de nuevo</p>
            <Logo size={16} onGreen iso={false} />
          </div>
          <Link
            to="/credencial"
            className="flex items-center gap-1.5 rounded-full bg-white/15 py-1.5 pl-2 pr-3 text-white hover:bg-white/25"
          >
            <QrCode size={16} />
            <span className="text-xs font-semibold">Mi credencial</span>
          </Link>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 pt-3">
        {error ? (
          <ErrorState message={error} onRetry={() => navigate(0)} />
        ) : (
          <>
            {/* Beneficio del día */}
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="text-xs font-bold tracking-[0.3px] text-brand">BENEFICIO DEL DÍA</span>
            </div>

            {loading || !hero ? (
              <HeroSkeleton />
            ) : (
              <article className="mb-3 overflow-hidden rounded-2xl border border-line-soft bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
                <div className="h-[110px] w-full">
                  <BenefitImage
                    src={hero.imagen_url}
                    alt={`${hero.titulo} · ${hero.local_nombre}`}
                    fallbackLabel={hero.local_nombre}
                  />
                </div>
                <div className="p-3.5">
                  <BenefitBadge>{labelCategoria(hero.categoria)}</BenefitBadge>
                  <h2 className="my-2 text-[22px] font-extrabold leading-tight text-brand">
                    {hero.titulo}
                  </h2>
                  <p className="mb-3 line-clamp-2 text-[12.5px] text-graytext">{hero.descripcion}</p>
                  <Button onClick={() => navigate(`/beneficios/${hero.id}`)}>Ver beneficio</Button>
                </div>
              </article>
            )}

            {/* Fila de filtros */}
            <div className="mb-3 flex items-center gap-2">
              <RubroSelect value={rubro} onChange={setRubro} />
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-fill px-3.5 py-[7px] text-[12.5px] font-medium text-graytext">
                Hoy <ChevronDown size={12} />
              </span>
              <button
                type="button"
                aria-label="Buscar beneficios"
                className="ml-auto flex h-[34px] w-10 items-center justify-center rounded-full border border-line text-graytext hover:bg-fill"
              >
                <Search size={17} />
              </button>
            </div>

            {/* Más beneficios */}
            <h3 className="mb-2.5 ml-0.5 text-[15px] font-bold">Más beneficios</h3>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                <BenefitCardSkeleton />
                <BenefitCardSkeleton />
                <BenefitCardSkeleton />
                <BenefitCardSkeleton />
              </div>
            ) : masBeneficios.length === 0 ? (
              <p className="px-2 py-8 text-center text-[13px] text-mute">
                No hay beneficios de {rubro === 'todos' ? 'este rubro' : labelCategoria(rubro)} por
                ahora.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {masBeneficios.map((p) => (
                  <BenefitCard key={p.id} promo={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Barra WhatsApp al pie */}
      <footer className="border-t border-line-soft bg-white px-4 pb-[max(env(safe-area-inset-bottom),22px)] pt-2.5">
        <div className="flex items-center gap-3">
          <WhatsAppGlyph />
          <div className="flex-1">
            <p className="text-[12.5px] font-bold text-ink">Seguinos en WhatsApp</p>
            <p className="text-[10.5px] font-normal text-graytext">Un beneficio nuevo cada día</p>
          </div>
          {/* TODO: poner la URL real del canal de WhatsApp de Green Plaza */}
          <Button variant="wa" full={false} sm>
            Sumarme
          </Button>
        </div>
      </footer>
    </AppCanvas>
  );
}

function RubroSelect({
  value,
  onChange,
}: {
  value: Categoria | 'todos';
  onChange: (v: Categoria | 'todos') => void;
}) {
  return (
    <div className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-fill px-3.5 py-[7px] text-[12.5px] font-medium text-graytext">
      <span>{value === 'todos' ? 'Rubro' : labelCategoria(value)}</span>
      <ChevronDown size={12} />
      <select
        aria-label="Filtrar por rubro"
        value={value}
        onChange={(e) => onChange(e.target.value as Categoria | 'todos')}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {RUBROS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-line-soft bg-white">
      <Skeleton className="h-[110px] rounded-none" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="#23753a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3a7 7 0 00-6 10.5L3 17l3.7-1A7 7 0 1010 3z" />
      <path d="M7.5 7.8c.2 2 1.7 3.5 3.7 3.7.6.05 1-.5 1.1-.9l-1.4-.7-.7.6c-.7-.3-1.3-.9-1.6-1.6l.6-.7-.7-1.4c-.4.1-.95.5-.9 1.1z" />
    </svg>
  );
}
