// pages/admin/AdminAprobarBeneficio.tsx
// Panel Admin · Beneficios · aprobaciones (detalle). Cola de revisión a la
// izquierda + detalle del beneficio seleccionado con acciones (aprobar, pedir
// cambios, rechazar). Subpágina de Beneficios → botón "volver".

import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, ImagePh, LogoBox, PButton, PChip, PCard } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { ADMIN_NAV } from '@/data/panelMock';

const COLA: { n: string; loc: string; nuevo?: boolean }[] = [
  { n: '3 cuotas sin interés', loc: 'TecnoHogar', nuevo: true },
  { n: 'Combo familiar 4x3', loc: 'Pizzería Roma', nuevo: true },
  { n: '30% en óptica', loc: 'Visión Plaza', nuevo: true },
  { n: 'Descuento estudiantes', loc: 'Comercio adherido' },
  { n: '2x1 en cine', loc: 'Comercio adherido' },
  { n: 'Envío gratis +$20k', loc: 'Comercio adherido' },
  { n: '15% en gimnasio', loc: 'Comercio adherido' },
];

const META: [string, string][] = [
  ['Tipo', '3 cuotas'],
  ['Vigencia', '01/07 – 31/07'],
  ['Días', 'Todos los días'],
  ['Límite', '1 por miembro / compra'],
];

export default function AdminAprobarBeneficio() {
  const navigate = useNavigate();

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Beneficios · aprobaciones"
      topbarActions={
        <>
          <PChip active>Pendientes · 7</PChip>
          <PChip>Publicados · 312</PChip>
          <PChip>Rechazados</PChip>
        </>
      }
    >
      {/* Volver */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-graytext transition-colors hover:bg-fill"
        aria-label="Volver"
      >
        <Icon name="chevL" size={18} />
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr] lg:gap-[18px]">
        {/* ── Cola de revisión ── */}
        <PCard title="Cola de revisión" sub="7 esperando" pad={0}>
          <div>
            {COLA.map((c, i) => (
              <div
                key={c.n}
                className={`flex items-center gap-[11px] px-4 py-[13px] ${
                  i === 0 ? 'border-l-[3px] border-brand bg-brand-soft' : 'border-l-[3px] border-transparent'
                } ${i === COLA.length - 1 ? '' : 'border-b border-line-soft'}`}
              >
                <LogoBox size={38} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-ink">{c.n}</div>
                  <div className="text-[11.5px] text-mute">{c.loc}</div>
                </div>
                {c.nuevo && (
                  <Badge tone="warn" dot={false}>
                    Nuevo
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </PCard>

        {/* ── Detalle ── */}
        <div className="flex flex-col gap-4">
          <PCard>
            <div className="flex flex-col gap-[18px] sm:flex-row">
              <ImagePh h={150} label="imagen del beneficio" className="flex-shrink-0 sm:w-[220px]" />
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <div className="text-[22px] font-extrabold tracking-[-0.4px]">3 cuotas sin interés</div>
                  <Badge tone="warn">Pendiente</Badge>
                </div>
                <div className="mb-3.5 flex items-center gap-2.5">
                  <LogoBox size={28} />
                  <span className="text-sm font-bold text-graytext">TecnoHogar</span>
                  <span className="text-[12.5px] text-mute">· Tecnología · enviado hace 2 h</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {META.map(([label, val]) => (
                    <div key={label} className="rounded-[9px] bg-fill px-3 py-2.5">
                      <div className="text-[11px] font-semibold text-mute">{label}</div>
                      <div className="text-[13.5px] font-bold">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PCard>

          <PCard title="Descripción para el miembro">
            <p className="text-[13.5px] leading-relaxed text-graytext">
              Comprá cualquier electrodoméstico de la línea blanca en 3 cuotas fijas sin interés con tu
              credencial ClubPlaza. Presentá la credencial digital en caja antes de finalizar la compra.
              No acumulable con otras promociones vigentes.
            </p>
            <div className="mt-3.5 flex items-center gap-2 rounded-[10px] bg-info-soft px-3.5 py-3">
              <Icon name="eye" size={18} className="text-info" />
              <span className="text-[12.5px] font-semibold text-info">
                Verificá que las condiciones sean claras antes de publicar a 12.840 miembros.
              </span>
            </div>
          </PCard>

          <div className="flex flex-wrap items-center gap-3">
            <PButton variant="danger" icon="x">
              Rechazar
            </PButton>
            <PButton variant="soft" icon="edit">
              Pedir cambios
            </PButton>
            <div className="flex-1" />
            <PButton variant="primary" icon="check" size="lg">
              Aprobar y publicar
            </PButton>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
