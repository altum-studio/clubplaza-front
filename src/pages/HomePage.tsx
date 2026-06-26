// pages/HomePage.tsx
// Pantalla 2 · Home / Beneficios (/beneficios) — VARIANTE B del wireflow.
// Header verde compacto + "Beneficio del día" (hero) + fila de filtros + grid
// "Más beneficios" + barra de WhatsApp al pie. Datos desde usePromos() (mock).
// Sin banner Mundialistas y sin bottom nav (la variante B no los incluye).

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import { Logo } from '@/components/brand/Logo';
import { CredencialIcon } from '@/components/brand/CredencialIcon';
import { BenefitCard } from '@/components/benefits/BenefitCard';
import { BenefitCarousel } from '@/components/benefits/BenefitCarousel';
import { LocalsMarquee } from '@/components/benefits/LocalsMarquee';
import { CredentialOverlay } from '@/components/credential/CredentialOverlay';
import { BenefitCardSkeleton, ErrorState, Skeleton } from '@/components/feedback/States';
import { useLocalesDir } from '@/hooks/useLocales';
import { usePromos } from '@/hooks/usePromos';
import { useSocio } from '@/hooks/useSocio';
import { useAuth } from '@/hooks/useAuth';
import { RUBROS, labelCategoria } from '@/lib/categorias';
import type { Categoria, Promo } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { promos, loading, error } = usePromos();
  const { socio } = useSocio();
  const { isAuthenticated } = useAuth();
  const [rubro, setRubro] = useState<Categoria | 'todos'>('todos');
  const [dia, setDia] = useState<DiaFiltro>('todos');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Credencial superpuesta (sube desde abajo). Se abre con el icono de QR.
  // Si el socio no inició sesión, lo mandamos a la pantalla de ingreso.
  const [credOpen, setCredOpen] = useState(false);
  const abrirCredencial = () =>
    isAuthenticated ? setCredOpen(true) : navigate('/ingresar');

  const primerNombre = socio?.nombre?.trim().split(/\s+/)[0] ?? '';
  const buscando = query.trim() !== '';

  // Carrusel "BENEFICIO DEL DÍA": SOLO lo vigente HOY (cada beneficio tiene sus
  // días). Es INDEPENDIENTE de los filtros de Rubro/Fecha (esos afinan la grilla).
  const beneficiosHoy = useMemo(() => {
    const hoy = new Date().getDay();
    return promos.filter((p) => p.dias.includes(hoy));
  }, [promos]);

  // Grilla de abajo: TODOS los beneficios (para leer todo). Se afina con los
  // filtros: sin fecha específica muestra todos; con fecha, los de ese día.
  const beneficiosFiltrados = useMemo(() => {
    const porRubro = (p: Promo) => rubro === 'todos' || p.categoria === rubro;
    if (dia === 'todos') return promos.filter(porRubro);
    const d = dia === 'hoy' ? new Date().getDay() : dia;
    return promos.filter((p) => p.dias.includes(d) && porRubro(p));
  }, [promos, rubro, dia]);

  // Directorio de locales (API) para el marquee de logos (todo el shopping).
  const { locales: dir } = useLocalesDir();
  const locales = useMemo(() => dir.map((l) => ({ nombre: l.nombre, logo: l.logo_url })), [dir]);

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
      {/* Encabezado verde: saludo + logo en blanco, y el QR (blanco con icono verde) */}
      <header
        className={`${STATUS_PAD} flex items-center justify-between gap-3 rounded-b-[22px] bg-brand px-4 pb-4`}
      >
        <div className="min-w-0">
          <p className="mb-1 truncate text-[15px] font-semibold text-white">
            Hola de nuevo{primerNombre ? `, ${primerNombre}` : ''}
          </p>
          <Logo size={18} iso={false} onGreen />
        </div>
        <button
          type="button"
          onClick={abrirCredencial}
          aria-label="Mi perfil / credencial"
          className="flex h-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white px-3.5 text-brand shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
        >
          <CredencialIcon height={24} />
        </button>
      </header>

      {/* Cuerpo scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
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
            ) : beneficiosHoy.length === 0 ? (
              <p className="mb-3 px-2 py-6 text-center text-[13px] text-mute">
                Hoy no hay beneficios vigentes. Mirá todos más abajo.
              </p>
            ) : (
              <BenefitCarousel promos={beneficiosHoy} />
            )}

            {/* Marquee de logos de locales (loop infinito, sin dots) */}
            {!loading && <LocalsMarquee locales={locales} />}

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
              /* Grilla con TODOS los beneficios (o los del día/rubro elegido). */
              <>
                <h3 className="mb-2.5 ml-0.5 text-[15px] font-bold">
                  {dia === 'todos'
                    ? 'Todos los beneficios'
                    : `Beneficios ${dia === 'hoy' ? 'de hoy' : `del ${DIAS.find((d) => d.value === dia)?.label.toLowerCase()}`}`}
                </h3>
                {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                    <BenefitCardSkeleton />
                    <BenefitCardSkeleton />
                    <BenefitCardSkeleton />
                    <BenefitCardSkeleton />
                  </div>
                ) : beneficiosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {beneficiosFiltrados.map((p) => (
                      <BenefitCard key={p.id} promo={p} />
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-8 text-center text-[13px] text-mute">
                    No hay beneficios con esos filtros.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Etiqueta flotante: sumarse a la comunidad de WhatsApp.
          TODO: poner la URL real del canal/comunidad de Green Plaza. */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.preventDefault()}
        aria-label="Sumate a la comunidad de WhatsApp"
        className="fixed bottom-[max(env(safe-area-inset-bottom),16px)] right-4 z-30 flex items-center gap-2 rounded-full bg-wa py-2.5 pl-3 pr-4 text-white shadow-[0_4px_12px_rgba(37,211,102,0.22)] active:scale-95 sm:absolute"
      >
        <WhatsAppGlyph size={20} className="text-white" />
        <span className="text-[12.5px] font-semibold leading-tight">Sumate a la comunidad</span>
      </a>

      {/* Credencial superpuesta (sube desde abajo al tocar el QR) */}
      <CredentialOverlay open={credOpen} onClose={() => setCredOpen(false)} />
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
