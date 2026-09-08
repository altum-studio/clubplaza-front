// pages/panel/LocalAyuda.tsx
// Panel Local · Ayuda. Tutoriales paso a paso de las tareas frecuentes del
// comercio + preguntas frecuentes (acordeón). Contenido estático (no necesita
// backend); pensado para editarse a mano a medida que sumamos temas.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { PCard } from '@/components/panel/kit';
import { Icon, type IconName } from '@/components/panel/Icon';
import { LOCAL_NAV } from '@/data/panelMock';

interface Tutorial {
  icon: IconName;
  titulo: string;
  resumen: string;
  pasos: string[];
}

const TUTORIALES: Tutorial[] = [
  {
    icon: 'qr',
    titulo: 'Validar una credencial',
    resumen: 'Aplicá un beneficio a un miembro en el mostrador.',
    pasos: [
      'Entrá a “Validar”.',
      'Apuntá la cámara al QR de la credencial del miembro (o ingresá su código de socio a mano).',
      'Elegí el beneficio a aplicar y confirmá. La cámara se reinicia sola para el siguiente.',
    ],
  },
  {
    icon: 'tag',
    titulo: 'Cargar un beneficio',
    resumen: 'Publicá una promo para que la vean los socios.',
    pasos: [
      'Entrá a “Beneficios” → “Cargar beneficio”.',
      'Completá el título, el tipo (2x1, descuento, combo…), los días válidos y la vigencia.',
      'Subí un banner (arrastrá, pegá o hacé clic en el recuadro) y guardá.',
    ],
  },
  {
    icon: 'store',
    titulo: 'Editar mi local',
    resumen: 'Mantené tus datos y horarios al día.',
    pasos: [
      'Entrá a “Mi Local”.',
      'Actualizá la descripción, los horarios, el logo y el banner.',
      'Los cambios se ven al instante en la app de los socios.',
    ],
  },
  {
    icon: 'chart',
    titulo: 'Ver estadísticas e historial',
    resumen: 'Seguí cómo rinden tus beneficios.',
    pasos: [
      '“Stats” muestra tus canjes por mes y las métricas del local.',
      '“Historial” lista las validaciones más recientes.',
      'Usá el selector de mes para comparar períodos.',
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: '¿Qué hago si el QR no escanea?',
    a: 'Ingresá el código de socio a mano en “Validar”. El código son 6 caracteres que el miembro ve debajo de su QR.',
  },
  {
    q: '¿Cuántos beneficios puedo publicar?',
    a: 'Los que necesites. Podés activarlos o desactivarlos cuando quieras: un beneficio desactivado deja de mostrarse a los socios, pero no se borra y lo podés reactivar.',
  },
  {
    q: '¿Cómo cambio el logo o el banner?',
    a: 'El logo se cambia en “Mi Local”; el banner, en cada beneficio. En los dos casos podés arrastrar la imagen, pegarla (Ctrl/Cmd+V) o hacer clic en el recuadro. Formato recomendado: banner 1200×600, hasta 2 MB.',
  },
  {
    q: '¿Puedo poner un beneficio sin fecha de fin?',
    a: 'Sí. Al cargarlo, activá “Sin vencimiento (indefinido)”. Si después querés ponerle una vigencia, desactivá esa opción y elegí las fechas.',
  },
  {
    q: '¿Los canjes se cuentan solos?',
    a: 'Sí. Cada validación que hacés desde este panel queda registrada y suma en tus estadísticas e historial.',
  },
  {
    q: '¿Puedo limitar cuántas veces se usa un beneficio?',
    a: 'Sí. Al cargar el beneficio, en “Límite de uso” elegís el período (por día, semana, mes o en toda la vigencia) y la cantidad. Por default viene “Sin límite”.',
  },
  {
    q: '¿A quién contacto si tengo un problema?',
    a: 'Escribinos por WhatsApp al equipo de ClubPlaza y te ayudamos. (Dejamos acá el contacto de soporte.)',
  },
];

export default function LocalAyuda() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Ayuda"
    >
      <div className="flex flex-col gap-6">
        {/* Tutoriales */}
        <section>
          <h2 className="mb-1 text-[15px] font-extrabold text-ink">Tutoriales</h2>
          <p className="mb-3.5 text-[13px] text-mute">Guías rápidas de las tareas más comunes del panel.</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TUTORIALES.map((t) => (
              <PCard key={t.titulo}>
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                    <Icon name={t.icon} size={19} className="text-brand" />
                  </span>
                  <div>
                    <div className="text-[14px] font-bold text-ink">{t.titulo}</div>
                    <div className="text-[12px] text-mute">{t.resumen}</div>
                  </div>
                </div>
                <ol className="flex flex-col gap-2 pl-1">
                  {t.pasos.map((paso, i) => (
                    <li key={i} className="flex gap-2.5 text-[12.5px] leading-snug text-graytext">
                      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-fill text-[10.5px] font-bold text-brand">
                        {i + 1}
                      </span>
                      {paso}
                    </li>
                  ))}
                </ol>
              </PCard>
            ))}
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section>
          <h2 className="mb-1 text-[15px] font-extrabold text-ink">Preguntas frecuentes</h2>
          <p className="mb-3.5 text-[13px] text-mute">Tocá una pregunta para ver la respuesta.</p>
          <PCard pad={0}>
            <div className="flex flex-col divide-y divide-line-soft">
              {FAQS.map((f, i) => {
                const open = abierta === i;
                return (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => setAbierta(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-fill/50"
                      aria-expanded={open}
                    >
                      <span className="text-[13.5px] font-semibold text-ink">{f.q}</span>
                      <Icon
                        name="chevD"
                        size={16}
                        className={`flex-shrink-0 text-mute transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {open && (
                      <p className="px-4 pb-4 pt-0 text-[13px] leading-relaxed text-graytext">{f.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </PCard>
        </section>
      </div>
    </PanelShell>
  );
}
