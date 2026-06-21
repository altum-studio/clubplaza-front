// pages/admin/AdminCargarBeneficio.tsx
// Panel Admin · Beneficios · cargar beneficio. Form (media fidelidad) para
// cargar un beneficio de un local adherido + previsualización para el miembro
// y opciones de publicación. Subpágina de Beneficios → botón "volver".

import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, Field, ImagePh, LogoBox, PButton, PChip, PCard, Toggle } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { ADMIN_NAV } from '@/data/panelMock';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const PUBLICACION: [string, string, boolean][] = [
  ['Publicar ahora', 'Visible para 12.840 miembros', true],
  ['Programar publicación', 'Elegí fecha y hora', false],
  ['Guardar como borrador', 'No visible todavía', false],
];

export default function AdminCargarBeneficio() {
  const navigate = useNavigate();

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Cargar beneficio"
      topbarActions={
        <>
          <PButton icon="eye" variant="outline">
            Previsualizar
          </PButton>
          <PButton icon="check">Publicar beneficio</PButton>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:gap-[18px]">
        {/* ── Columna izquierda ── */}
        <div className="flex flex-col gap-4">
          <PCard title="Datos del beneficio" sub="Cargá un beneficio para un local adherido">
            <div className="flex flex-col gap-[14px]">
              <div className="flex gap-3">
                <Field label="Local" value="Café Central" icon="store" />
                <Field label="Rubro" value="Gastronomía" icon="tag" />
              </div>

              <Field label="Título del beneficio" value="2x1 en cafetería" />

              <div className="flex gap-3">
                <Field label="Tipo" value="2x1" icon="tag" />
                <Field label="Valor / descuento" placeholder="Ej. 20% · 3 cuotas" value="—" />
              </div>

              <Field
                label="Descripción para el miembro"
                area
                value="Llevá dos cafés y pagá uno. Válido para café de especialidad, de lunes a viernes."
              />

              <div>
                <div className="mb-2 text-xs font-semibold text-graytext">Días válidos</div>
                <div className="flex gap-1.5">
                  {DIAS.map((d, i) => (
                    <PChip key={d} active={i < 5}>
                      {d}
                    </PChip>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Field label="Vigente desde" value="01/07/2026" icon="cal" />
                <Field label="Vigente hasta" value="31/07/2026" icon="cal" />
              </div>

              <div className="flex items-center justify-between rounded-[10px] bg-fill px-3.5 py-3">
                <div>
                  <div className="text-[13px] font-bold">Límite: 1 uso por miembro por día</div>
                  <div className="text-[11.5px] text-mute">Evita usos repetidos en la misma jornada</div>
                </div>
                <Toggle on />
              </div>

              <Field label="Imagen del beneficio" value="banner-cafe-central.jpg" icon="upload" />
            </div>
          </PCard>
        </div>

        {/* ── Columna derecha ── */}
        <div className="flex flex-col gap-4">
          <PCard title="Vista del miembro" sub="Así se verá en la app">
            <div className="overflow-hidden rounded-[14px] border border-line">
              <ImagePh h={104} label="banner-cafe-central.jpg" r={0} className="border-0" />
              <div className="p-3.5">
                <div className="mb-2 flex items-center gap-2">
                  <LogoBox size={26} />
                  <span className="text-[11.5px] font-bold text-graytext">Café Central</span>
                  <Badge tone="ok" dot={false} className="ml-auto">
                    Gastronomía
                  </Badge>
                </div>
                <div className="text-[20px] font-extrabold text-brand">2x1 en cafetería</div>
                <div className="mt-1 text-[12.5px] text-graytext">
                  Llevá dos cafés y pagá uno. Válido para café de especialidad.
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-mute">
                  <Icon name="cal" size={14} />
                  <span className="text-[11.5px] font-semibold">Lun a Vie · hasta 31/07</span>
                </div>
              </div>
            </div>
          </PCard>

          <PCard title="Publicación">
            <div className="flex flex-col gap-2.5">
              {PUBLICACION.map(([t, s, sel]) => (
                <div
                  key={t}
                  className={`flex items-center gap-[11px] rounded-[10px] border px-3.5 py-[11px] ${
                    sel ? 'border-brand bg-brand-soft' : 'border-line bg-white'
                  }`}
                >
                  <div
                    className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      sel ? 'border-brand' : 'border-line'
                    }`}
                  >
                    {sel && <div className="h-[8px] w-[8px] rounded-full bg-brand" />}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-ink">{t}</div>
                    <div className="text-[11.5px] text-mute">{s}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex items-center gap-2 rounded-[10px] bg-info-soft px-3.5 py-3">
              <Icon name="wa" size={18} className="text-brand" />
              <span className="text-xs font-semibold text-info">
                Avisar por el canal de WhatsApp al publicar
              </span>
              <span className="ml-auto">
                <Toggle on />
              </span>
            </div>
          </PCard>

          <div className="flex gap-2.5">
            <PButton variant="soft" full>
              Guardar borrador
            </PButton>
            <PButton variant="primary" icon="check" full>
              Publicar
            </PButton>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
