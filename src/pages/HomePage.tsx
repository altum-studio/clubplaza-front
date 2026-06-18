// pages/HomePage.tsx
// Pantalla 2 · Home / Beneficios (/beneficios) — VARIANTE B del wireflow.
// Header verde compacto + "Beneficio del día" (hero) + fila de filtros + grid
// "Más beneficios" + barra de WhatsApp al pie. Datos desde usePromos() (mock).
// Sin banner Mundialistas y sin bottom nav (la variante B no los incluye).

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, ChevronDown, X } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/app-button';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import { BenefitCard } from '@/components/benefits/BenefitCard';
import { BenefitCarousel } from '@/components/benefits/BenefitCarousel';
import { CredentialSheet } from '@/components/credential/CredentialSheet';
import { BenefitCardSkeleton, ErrorState, Skeleton } from '@/components/feedback/States';
import { usePromos } from '@/hooks/usePromos';
import { useSocio } from '@/hooks/useSocio';
import { useDragSheet } from '@/hooks/useDragSheet';
import { RUBROS, labelCategoria } from '@/lib/categorias';
import type { Categoria } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { promos, loading, error } = usePromos();
  const { socio } = useSocio();
  const [rubro, setRubro] = useState<Categoria | 'todos'>('todos');
  const [dia, setDia] = useState<DiaFiltro>('todos');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Primer nombre para el saludo (ej: "María González" → "María").
  const primerNombre = socio?.nombre?.trim().split(/\s+/)[0] ?? '';

  // Credencial como panel arrastrable (top sheet) que se superpone al home.
  const sheet = useDragSheet();

  const buscando = query.trim() !== '';

  // Beneficios para el carrusel "Beneficio del día":
  //   'todos' → todos · 'hoy' → día real de hoy · número → ese día (0=Dom).
  const beneficiosDia = useMemo(() => {
    if (dia === 'todos') return promos;
    const d = dia === 'hoy' ? new Date().getDay() : dia;
    return promos.filter((p) => p.dias.includes(d));
  }, [promos, dia]);

  // "Más beneficios": los que NO entran en el carrusel (otros días), por rubro.
  // Con 'todos' el carrusel ya muestra todo, así que esta lista queda vacía.
  const masBeneficios = useMemo(() => {
    if (dia === 'todos') return [];
    const d = dia === 'hoy' ? new Date().getDay() : dia;
    return promos
      .filter((p) => !p.dias.includes(d))
      .filter((p) => rubro === 'todos' || p.categoria === rubro);
  }, [promos, rubro, dia]);

  // Búsqueda: sobre TODAS las promos (título, descripción y local).
  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return promos.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.local_nombre.toLowerCase().includes(q),
    );
  }, [promos, query]);

  return (
    <AppCanvas>
      {/* Header verde con esquinas inferiores redondeadas */}
      <header className={`${STATUS_PAD} rounded-b-[26px] bg-brand px-4 pb-2`}>
        {/* Arriba: saludo + acceso a la credencial */}
        <div className="flex items-center justify-between gap-3">
          {/* Saludo */}
          <div className="min-w-0">
            <p className="mb-1 text-[15px] font-semibold text-white">
              Hola de nuevo{primerNombre ? `, ${primerNombre}` : ''}
            </p>
            <Logo size={19} onGreen iso={false} />
          </div>

          {/* Mi credencial */}
          <button
            type="button"
            onClick={() => sheet.setOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white/15 py-1.5 pl-2 pr-3 text-white hover:bg-white/25"
          >
            <QrCode size={16} />
            <span className="text-xs font-semibold">Mi credencial</span>
          </button>
        </div>

        {/* Abajo del todo: barra para arrastrar y bajar la credencial (o tap) */}
        <button
          type="button"
          {...sheet.handleProps}
          onClick={sheet.toggle}
          aria-label="Bajar mi credencial"
          className="mx-auto mt-2 flex touch-none flex-col items-center gap-0.5 text-white/75 hover:text-white"
        >
          <span className="block h-1 w-9 rounded-full bg-white/50" />
          <ChevronDown size={18} className="animate-bounce" />
        </button>
      </header>

      {/* Cuerpo */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 pt-4">
        {error ? (
          <ErrorState message={error} onRetry={() => navigate(0)} />
        ) : (
          <>
            {/* Beneficio del día */}
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="text-xs font-bold tracking-[0.3px] text-brand">BENEFICIO DEL DÍA</span>
            </div>

            {loading ? (
              <div className="-mx-4 mb-3 flex gap-3 overflow-hidden px-4">
                <div className="w-[82%] flex-shrink-0">
                  <HeroSkeleton />
                </div>
                <div className="w-[82%] flex-shrink-0">
                  <HeroSkeleton />
                </div>
              </div>
            ) : beneficiosDia.length === 0 ? (
              <p className="mb-3 px-2 py-6 text-center text-[13px] text-mute">
                No hay beneficios disponibles
                {dia === 'todos'
                  ? ''
                  : dia === 'hoy'
                    ? ' para hoy'
                    : ` el ${DIAS.find((d) => d.value === dia)?.label.toLowerCase()}`}
                .
              </p>
            ) : (
              <BenefitCarousel promos={beneficiosDia} />
            )}

            {/* Fila de filtros / búsqueda (debajo del beneficio del día).
                Altura fija para que al abrir el buscador no se mueva lo de abajo. */}
            <div className="mb-3 flex h-[34px] items-center gap-2">
              {searchOpen ? (
                <div className="flex w-full items-center gap-2 rounded-full border border-line bg-fill px-3.5 py-[7px]">
                  <Search size={16} className="flex-shrink-0 text-graytext" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar beneficios o locales…"
                    className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-mute"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery('');
                    }}
                    aria-label="Cerrar búsqueda"
                    className="flex-shrink-0 text-graytext hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <RubroSelect value={rubro} onChange={setRubro} />
                  <DiaSelect value={dia} onChange={setDia} />
                  <button
                    type="button"
                    aria-label="Buscar beneficios"
                    onClick={() => setSearchOpen(true)}
                    className="ml-auto flex h-[34px] w-10 items-center justify-center rounded-full border border-line text-graytext hover:bg-fill"
                  >
                    <Search size={17} />
                  </button>
                </>
              )}
            </div>

            {buscando ? (
              /* Resultados de búsqueda (sobre todas las promos) */
              resultados.length === 0 ? (
                <p className="px-2 py-10 text-center text-[13px] text-mute">
                  No encontramos beneficios para “{query.trim()}”.
                </p>
              ) : (
                <>
                  <h3 className="mb-2.5 ml-0.5 text-[15px] font-bold">
                    Resultados ({resultados.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {resultados.map((p) => (
                      <BenefitCard key={p.id} promo={p} />
                    ))}
                  </div>
                </>
              )
            ) : (
              /* "Más beneficios" (otros días). Se oculta si no hay nada que mostrar. */
              loading ? (
                <>
                  <h3 className="mb-2.5 ml-0.5 text-[15px] font-bold">Más beneficios</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <BenefitCardSkeleton />
                    <BenefitCardSkeleton />
                    <BenefitCardSkeleton />
                    <BenefitCardSkeleton />
                  </div>
                </>
              ) : masBeneficios.length > 0 ? (
                <>
                  <h3 className="mb-2.5 ml-0.5 text-[15px] font-bold">Más beneficios</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {masBeneficios.map((p) => (
                      <BenefitCard key={p.id} promo={p} />
                    ))}
                  </div>
                </>
              ) : null
            )}
          </>
        )}
      </div>

      {/* Barra WhatsApp al pie */}
      <footer className="border-t border-line-soft bg-white px-4 pb-[max(env(safe-area-inset-bottom),22px)] pt-2.5">
        <div className="flex items-center gap-3">
          <WhatsAppGlyph size={24} className="text-wa" />
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

      {/* Credencial arrastrable, superpuesta al home */}
      <CredentialSheet sheet={sheet} />
    </AppCanvas>
  );
}

// Filtro de día: 'todos' (default, muestra todo) · 'hoy' (día real) · número getDay() (0=Dom).
type DiaFiltro = number | 'hoy' | 'todos';

const DIAS: { value: DiaFiltro; label: string }[] = [
  { value: 'todos', label: 'Todas las fechas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

function DiaSelect({ value, onChange }: { value: DiaFiltro; onChange: (v: DiaFiltro) => void }) {
  // Con 'todos' mostramos un texto neutro tipo placeholder.
  const label = value === 'todos' ? 'Fecha' : (DIAS.find((d) => d.value === value)?.label ?? 'Fecha');
  return (
    <div className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-fill px-3.5 py-[7px] text-[12.5px] font-medium text-graytext">
      <span>{label}</span>
      <ChevronDown size={12} />
      <select
        aria-label="Filtrar por día"
        value={String(value)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === 'hoy' || v === 'todos' ? v : Number(v));
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {DIAS.map((d) => (
          <option key={String(d.value)} value={String(d.value)}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
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
