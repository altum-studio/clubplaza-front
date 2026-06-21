// pages/panel/LocalValidar.tsx
// Panel Local (comercio adherido) · Validar credencial. Escáner QR (placeholder)
// + búsqueda manual de código y verificación del miembro encontrado.

import { PanelShell } from '@/components/panel/PanelShell';
import { Avatar, Badge, Field, ImagePh, LogoBox, PButton, PChip } from '@/components/panel/kit';
import { PCard } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { LOCAL_NAV } from '@/data/panelMock';

export default function LocalValidar() {
  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle="Validar credencial"
      topbarActions={<PChip icon="clock">5 validaciones hoy en esta caja</PChip>}
    >
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
        {/* IZQUIERDA — escáner */}
        <PCard
          title="Escanear QR del miembro"
          sub="Pedile al miembro que abra su credencial en la app"
        >
          <div className="flex flex-col gap-4">
            {/* Visor del escáner */}
            <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-[14px] bg-brand-dark">
              <ImagePh h={300} label="" dark className="absolute inset-0 rounded-[14px] border-0" />
              <div className="relative h-[180px] w-[180px]">
                {/* esquinas en L */}
                <div className="absolute left-0 top-0 h-[34px] w-[34px] border-l-[3px] border-t-[3px] border-solid border-white" />
                <div className="absolute right-0 top-0 h-[34px] w-[34px] border-r-[3px] border-t-[3px] border-solid border-white" />
                <div className="absolute bottom-0 left-0 h-[34px] w-[34px] border-b-[3px] border-l-[3px] border-solid border-white" />
                <div className="absolute bottom-0 right-0 h-[34px] w-[34px] border-b-[3px] border-r-[3px] border-solid border-white" />
                {/* línea de escaneo */}
                <div className="absolute left-2 right-2 top-1/2 h-[2px] bg-[#23d366] shadow-[0_0_12px_#23d366]" />
              </div>
              <div className="absolute inset-x-0 bottom-3.5 text-center text-[12.5px] text-white/80">
                Apuntá la cámara al código QR
              </div>
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11.5px] font-semibold text-mute">
                o ingresá el código manualmente
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* Entrada manual */}
            <div className="flex gap-2.5">
              <Field placeholder="GP-XXXX-XXXX" value="GP-8K2D-4F9X" icon="qr" />
              <PButton className="flex-shrink-0">Buscar</PButton>
            </div>
          </div>
        </PCard>

        {/* DERECHA — miembro encontrado */}
        <PCard
          title="Miembro encontrado"
          sub="Verificá identidad con el DNI antes de confirmar"
        >
          <div className="flex flex-col gap-4">
            {/* Bloque del miembro */}
            <div className="flex items-center gap-3.5 rounded-[12px] bg-brand-soft p-4">
              <Avatar name="María González" size={56} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-extrabold">María González</span>
                  <Badge tone="ok">Activo</Badge>
                </div>
                <div className="mt-0.5 font-mono text-[13px] font-medium text-graytext">
                  GP-8K2D-4F9X
                </div>
                <div className="mt-0.5 text-xs text-mute">
                  Miembro desde 06/2026 · DNI 38.xxx.xxx
                </div>
              </div>
              <Icon name="check" size={30} className="text-brand" strokeWidth={2.4} />
            </div>

            {/* Beneficio a aplicar */}
            <div>
              <div className="mb-2 text-xs font-bold text-graytext">Beneficio a aplicar</div>
              <div className="flex items-center gap-3 rounded-[12px] border-[1.5px] border-brand p-3.5">
                <LogoBox size={44} />
                <div className="flex-1">
                  <div className="text-[15px] font-extrabold text-brand">2x1 en cafetería</div>
                  <div className="text-xs text-mute">Válido de lunes a viernes · 1 uso por día</div>
                </div>
                <Icon name="chevD" size={18} className="text-mute" />
              </div>
            </div>

            {/* Aviso */}
            <div className="flex items-center gap-2 rounded-[10px] bg-warn-soft px-3.5 py-3">
              <Icon name="clock" size={18} className="text-warn" />
              <span className="text-[12.5px] font-semibold text-warn">
                Este miembro ya usó un beneficio hoy a las 09:14
              </span>
            </div>

            {/* Botones */}
            <div className="flex gap-2.5">
              <PButton variant="soft" full>
                Cancelar
              </PButton>
              <PButton variant="primary" icon="check" full>
                Confirmar canje
              </PButton>
            </div>
          </div>
        </PCard>
      </div>
    </PanelShell>
  );
}
