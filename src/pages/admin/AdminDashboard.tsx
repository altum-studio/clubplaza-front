// pages/admin/AdminDashboard.tsx
// Panel Admin · Dashboard general. KPIs reales, "Altas de miembros" desde
// GET /api/usuarios/altas?rol=comun (mes/semana/rango) y "Top locales por
// canjes". El selector de mes actualiza los canjes del mes y el ranking (?mes=).

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { PChip, PCard, Stat, LogoBox } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { AltasChart } from '@/components/panel/AltasChart';
import { MonthPicker, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { ddmm, hoyAR, rangoSemana } from '@/lib/fechas';
import { promoPorVencer, promoVencida, promoVigente } from '@/lib/opciones';
import type { AltaBucket, ApiLocal, ApiPromo, Profile } from '@/types';
import { ADMIN_NAV } from '@/data/panelMock';

// La vista mensual arranca en el mes de lanzamiento (no mostramos meses previos).
const LAUNCH_MONTH = '2026-06';

// Cuántos meses se muestran por "ventana" en la vista Mes (navegable hacia atrás).
const MESES_VISTA = 6;
const MES_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const mesCorto = (ym: string) => `${MES_ABBR[Number(ym.slice(5, 7)) - 1] ?? ''} '${ym.slice(2, 4)}`;

// La ventana semanal navegable usa rangoSemana() de lib/fechas (huso AR).
const weekRange = rangoSemana;

// Enumera 'YYYY-MM' desde `from` hasta `to` inclusive (serie de canjes por mes).
function monthsRange(from: string, to: string): string[] {
  const out: string[] = [];
  let y = Number(from.slice(0, 4));
  let m = Number(from.slice(5, 7));
  const ty = Number(to.slice(0, 4));
  const tm = Number(to.slice(5, 7));
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export default function AdminDashboard() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  // Métrica del gráfico principal: se alterna con la flecha del título.
  const [metric, setMetric] = useState<'altas' | 'canjes'>('altas');
  // Navegación de semanas en la vista "Semana" (0 = semana actual, +1 = anterior…).
  const [semanaBack, setSemanaBack] = useState(0);
  // Navegación de meses en la vista "Mes" (0 = ventana actual, +1 = ventana anterior).
  const [mesBack, setMesBack] = useState(0);
  const mes = monthValue(monthOffset);

  // Base: totales (cada fuente cae por separado, así un endpoint roto no tumba todo).
  const base = useAsync(
    () =>
      Promise.all([
        api.locales.list({ limit: 500 }).catch(() => ({ data: [] as ApiLocal[], count: 0 })),
        api.promos.list({ limit: 500 }).catch(() => ({ data: [] as ApiPromo[], count: 0 })),
        api.usuarios.list({ limit: 1 }).catch(() => ({ data: [] as Profile[], count: 0 })),
      ]).then(([l, p, u]) => {
        const hoy = hoyAR();
        // El backend no manda el conteo de beneficios por local → lo calculamos.
        const benef = new Map<string, number>();
        for (const pr of p.data) benef.set(pr.local_id, (benef.get(pr.local_id) ?? 0) + 1);
        // Vencimientos (aviso): publicados pero vencidos, y los que vencen en 30 días.
        const activas = p.data.filter((pr) => pr.activa);
        const vencidos = activas.filter((pr) => promoVencida(pr, hoy)).length;
        const porVencer = activas.filter((pr) => promoPorVencer(pr, hoy)).length;
        return {
          vencidos,
          porVencer,
          locales: l.data,
          // "Activos" = estado disponible. `activo` también es true para los
          // "próximamente" (todavía no abrieron), por eso no sirve para contar.
          localesCount: l.data.filter((x) => (x.estado ?? (x.activo ? 'disponible' : 'inactivo')) === 'disponible')
            .length,
          // "Publicados" = activa y vigente HOY (el count del endpoint incluye vencidas).
          promos: p.data.filter((pr) => pr.activa && promoVigente(pr, hoy)).length,
          // Total de usuarios de todos los roles (el desglose por rol vive en Usuarios).
          miembrosCount: u.count,
          benef,
        };
      }),
    [],
  );

  // Altas de MIEMBROS (rol comun): mes = 12 meses; semana = ventana de 7 días
  // navegable hacia atrás por rango de fechas.
  const altas = useAsync(() => {
    if (vista === 'mes') return api.usuarios.altas('mes', 'comun');
    if (semanaBack === 0) return api.usuarios.altas('semana', 'comun');
    const { desde, hasta } = weekRange(semanaBack);
    return api.usuarios.altasRango(desde, hasta, 'comun').catch(() => [] as AltaBucket[]);
  }, [vista, semanaBack]);

  // Serie de canjes en el MISMO formato que altas, para el toggle del gráfico.
  // Semana → últimos 7 días (canjes_ultimos_7_dias); Mes → total de cada mes
  // desde el lanzamiento (una llamada a stats por mes). No usa el backend nuevo.
  const canjesSerie = useAsync(async () => {
    if (vista === 'semana') {
      if (semanaBack === 0) {
        const s = await api.canjes.stats({});
        return (s.serie ?? s.canjes_ultimos_7_dias).map((d) => ({ periodo: d.fecha, count: d.cantidad }));
      }
      const { desde, hasta } = weekRange(semanaBack);
      return api.canjes
        .serie(desde, hasta)
        .then((rows) => rows.map((d) => ({ periodo: d.fecha, count: d.cantidad })))
        .catch(() => [] as { periodo: string; count: number }[]);
    }
    const months = monthsRange(LAUNCH_MONTH, monthValue(0));
    return Promise.all(
      months.map((m) =>
        api.canjes
          .stats({ mes: m })
          .then((s) => ({ periodo: m, count: s.canjes_mes }))
          .catch(() => ({ periodo: m, count: 0 })),
      ),
    );
  }, [vista, semanaBack]);

  // Del mes: canjes globales + ranking por local (refetch al cambiar el mes).
  const mesData = useAsync(async () => {
    const b = base.data;
    if (!b) return null;
    const [globalStats, ranking] = await Promise.all([
      api.canjes.stats({ mes }).catch(() => null),
      Promise.all(
        b.locales.map((loc) =>
          api.canjes
            .stats({ local_id: loc.id, mes })
            .then((s) => ({ local: loc, canjes: s.canjes_mes }))
            .catch(() => ({ local: loc, canjes: 0 })),
        ),
      ),
    ]);
    ranking.sort((a, b2) => b2.canjes - a.canjes);
    return { canjesMes: globalStats?.canjes_mes ?? null, ranking };
  }, [mes, base.data]);

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Dashboard general"
    >
      <DataView state={base}>
        {(b) => {
          const md = mesData.data;
          const ranking = md?.ranking ?? [];
          const altasData = altas.data ?? [];
          const canjesData = canjesSerie.data ?? [];
          // El gráfico principal muestra altas o canjes según el toggle.
          const esAltas = metric === 'altas';
          // Vista Mes: ventana de MESES_VISTA meses, navegable hacia atrás con ‹ ›.
          // Altas: TODOS los meses que devuelve la API (12). Canjes: desde el
          // lanzamiento (una llamada a stats por mes; no pedimos meses extra).
          const mesesAltas = [...new Set(altasData.map((b) => b.periodo))].sort();
          const allMonths =
            esAltas && vista === 'mes' && mesesAltas.length > 0 ? mesesAltas : monthsRange(LAUNCH_MONTH, monthValue(0));
          // Clamp: al cambiar de métrica la cantidad de ventanas puede achicarse.
          const mesBackMax = Math.max(0, Math.ceil(allMonths.length / MESES_VISTA) - 1);
          const mesBackEf = Math.min(mesBack, mesBackMax);
          const mesEnd = allMonths.length - mesBackEf * MESES_VISTA;
          const mesStartIdx = Math.max(0, mesEnd - MESES_VISTA);
          const windowMonths = allMonths.slice(mesStartIdx, mesEnd);
          const hayMesesPrevios = mesStartIdx > 0;
          const altasMap = new Map(altasData.map((b) => [b.periodo, b.count]));
          const canjesMap = new Map(canjesData.map((b) => [b.periodo, b.count]));
          // Mensual: la ventana (rellenando 0 los meses sin dato). Semanal: tal cual.
          const altasVista =
            vista === 'mes'
              ? windowMonths.map((m) => ({ periodo: m, count: altasMap.get(m) ?? 0 }))
              : altasData;
          const canjesVista =
            vista === 'mes'
              ? windowMonths.map((m) => ({ periodo: m, count: canjesMap.get(m) ?? 0 }))
              : canjesData;
          const chartState = esAltas ? altas : canjesSerie;
          const chartData = esAltas ? altasVista : canjesVista;
          // Período en curso: el último bucket es el mes/día de HOY (solo pasa en
          // la ventana actual). Se marca como parcial en el gráfico y el subtítulo.
          const hoy = hoyAR();
          const ultimo = chartData[chartData.length - 1]?.periodo;
          const ultimoParcial = !!ultimo && (vista === 'mes' ? ultimo === hoy.slice(0, 7) : ultimo === hoy);
          const subBase = esAltas
            ? vista === 'mes'
              ? 'Nuevos miembros por mes'
              : 'Nuevos miembros por día'
            : vista === 'mes'
              ? 'Canjes por mes'
              : 'Canjes por día';

          return (
            <div className="flex flex-col gap-4 lg:gap-[18px]">
              {/* Totales globales: NO dependen del mes seleccionado. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Stat live label="Miembros totales" info="Usuarios registrados en ClubPlaza, de todos los roles." value={String(b.miembrosCount)} icon="users" />
                <Stat live label="Locales activos totales" info="Locales con estado Disponible. No incluye Próximamente ni Inactivos." value={String(b.localesCount)} icon="store" />
                <Stat live label="Beneficios publicados totales" info="Beneficios activos y dentro de su vigencia hoy." value={String(b.promos)} icon="tag" />
              </div>

              {/* Aviso de vencimientos (solo si hay algo que avisar). */}
              {(b.vencidos > 0 || b.porVencer > 0) && (
                <div className="flex flex-col gap-1.5 rounded-[12px] border border-warn/40 bg-warn-soft px-4 py-3 text-[12.5px] transition-colors hover:bg-[oklch(0.925_0.06_80)]">
                  {b.vencidos > 0 && (
                    <Link
                      to="/admin/beneficios?resaltar=vencidos"
                      className="flex items-center gap-2 py-0.5 text-ink"
                    >
                      <Icon name="clock" size={14} className="flex-shrink-0 text-bad" />
                      <span>
                        <b>{b.vencidos}</b> {b.vencidos === 1 ? 'beneficio vencido sigue publicado' : 'beneficios vencidos siguen publicados'}
                      </span>
                      <Icon name="chevR" size={14} className="text-mute" />
                    </Link>
                  )}
                  {b.porVencer > 0 && (
                    <Link
                      to="/admin/beneficios?resaltar=por-vencer"
                      className="flex items-center gap-2 py-0.5 text-ink"
                    >
                      <Icon name="cal" size={14} className="flex-shrink-0 text-warn" />
                      <span>
                        <b>{b.porVencer}</b> {b.porVencer === 1 ? 'beneficio vence' : 'beneficios vencen'} en los próximos 30 días
                      </span>
                      <Icon name="chevR" size={14} className="text-mute" />
                    </Link>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
                <PCard
                  fill
                  title={
                    <button
                      type="button"
                      onClick={() => setMetric((m) => (m === 'altas' ? 'canjes' : 'altas'))}
                      className="group -my-1 flex cursor-pointer items-center gap-1.5"
                      aria-label={esAltas ? 'Ver canjes' : 'Ver altas de miembros'}
                      title={esAltas ? 'Ver canjes' : 'Ver altas de miembros'}
                    >
                      {/* Serie filtrada con ?rol=comun: cuenta solo miembros. */}
                      <span>{esAltas ? 'Altas de miembros' : 'Canjes'}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fill text-mute transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                        <Icon name="chevR" size={15} />
                      </span>
                    </button>
                  }
                  sub={subBase + (ultimoParcial ? ` · último período parcial · al ${ddmm(hoy)}` : '')}
                  actions={
                    <div className="flex flex-shrink-0 gap-1.5">
                      <PChip
                        active={vista === 'mes'}
                        onClick={() => {
                          setVista('mes');
                          setMesBack(0);
                        }}
                      >
                        Mes
                      </PChip>
                      <PChip
                        active={vista === 'semana'}
                        onClick={() => {
                          setVista('semana');
                          setSemanaBack(0);
                        }}
                      >
                        Semana
                      </PChip>
                    </div>
                  }
                >
                  {/* Navegador de período: semanas (vista Semana) o meses (vista Mes) */}
                  <div className="mb-2.5 flex items-center justify-between rounded-lg bg-fill px-2 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        vista === 'semana' ? setSemanaBack((w) => w + 1) : setMesBack(mesBackEf + 1)
                      }
                      disabled={vista === 'mes' && !hayMesesPrevios}
                      aria-label={vista === 'semana' ? 'Semana anterior' : 'Meses anteriores'}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-graytext hover:bg-white disabled:opacity-30"
                    >
                      <Icon name="chevL" size={15} />
                    </button>
                    <span className="text-[12px] font-semibold text-graytext">
                      {vista === 'semana'
                        ? semanaBack === 0
                          ? 'Últimos 7 días'
                          : weekRange(semanaBack).label
                        : mesBackEf === 0
                          ? `Últimos ${windowMonths.length} meses`
                          : `${mesCorto(windowMonths[0])} – ${mesCorto(windowMonths[windowMonths.length - 1])}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        vista === 'semana'
                          ? setSemanaBack((w) => Math.max(0, w - 1))
                          : setMesBack(Math.max(0, mesBackEf - 1))
                      }
                      disabled={(vista === 'semana' ? semanaBack : mesBackEf) === 0}
                      aria-label={vista === 'semana' ? 'Semana siguiente' : 'Meses siguientes'}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-graytext hover:bg-white disabled:opacity-30"
                    >
                      <Icon name="chevR" size={15} />
                    </button>
                  </div>
                  {chartState.error ? (
                    <PanelEmpty
                      icon={esAltas ? 'users' : 'ticket'}
                      title={esAltas ? 'No se pudieron cargar las altas' : 'No se pudieron cargar los canjes'}
                      hint={chartState.error}
                    />
                  ) : chartState.loading && chartData.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-14 text-[13px] text-mute">
                      Cargando…
                    </div>
                  ) : vista === 'semana' && semanaBack > 0 && chartData.length === 0 ? (
                    // Semana anterior sin datos (el rango depende del backend): estado
                    // vacío explícito en vez de un gráfico en blanco.
                    <PanelEmpty icon="cal" title="Sin datos para esta semana" hint="No hay registros disponibles en este rango." />
                  ) : (
                    <AltasChart buckets={chartData} vista={vista} parcial={ultimoParcial} />
                  )}
                </PCard>

                {/* Bloque "Del mes": TODO lo de adentro depende del selector de mes
                    (canjes del mes + ranking de locales). Por eso el selector vive acá. */}
                <div className="flex flex-col gap-3 rounded-[16px] border border-dashed border-line bg-fill/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <span className="text-[12.5px] font-bold text-graytext">Del mes</span>
                    <MonthPicker offset={monthOffset} onChange={setMonthOffset} />
                  </div>
                  {md?.canjesMes != null ? (
                    <Stat live label="Canjes del mes" info="Canjes válidos de todos los locales en el mes elegido." value={String(md.canjesMes)} icon="ticket" />
                  ) : (
                    <Stat live label="Canjes del mes" info="Canjes válidos de todos los locales en el mes elegido." value={mesData.loading ? '…' : '—'} icon="ticket" />
                  )}
                  <PCard title="Top locales por canjes" sub="Ordenado de mayor a menor">
                    {mesData.loading ? (
                      <div className="py-[11px] text-[13px] text-mute">Cargando…</div>
                    ) : ranking.length === 0 ? (
                      <div className="py-[11px] text-[13px] text-mute">Sin locales</div>
                    ) : (
                      <div className="max-h-[280px] overflow-y-auto pr-3">
                        {ranking.map((r, i) => (
                          <div
                            key={r.local.id}
                            className={`flex items-center gap-3 py-[11px] ${i === ranking.length - 1 ? '' : 'border-b border-line-soft'}`}
                          >
                            <div
                              className={`w-[22px] text-sm font-extrabold ${i === 0 ? 'text-brand' : 'text-faint'}`}
                            >
                              {i + 1}
                            </div>
                            {r.local.logo_url ? (
                              <img
                                src={r.local.logo_url}
                                className="h-[34px] w-[34px] rounded-full border border-line object-cover"
                              />
                            ) : (
                              <LogoBox size={34} />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-bold text-ink">{r.local.nombre}</div>
                              <div className="text-[11px] text-mute">{b.benef.get(r.local.id) ?? 0} benef.</div>
                            </div>
                            <span className="text-[13px] font-extrabold text-ink">{r.canjes}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </PCard>
                </div>
              </div>
            </div>
          );
        }}
      </DataView>
    </PanelShell>
  );
}
