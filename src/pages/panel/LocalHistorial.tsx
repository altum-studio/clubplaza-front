// pages/panel/LocalHistorial.tsx
// Panel Local · Historial de validaciones. Depende de un endpoint de canjes que
// el backend todavía no tiene, así que muestra un estado "próximamente" en vez
// de datos de ejemplo.

import { PanelShell } from '@/components/panel/PanelShell';
import { PanelEmpty } from '@/components/panel/DataState';
import { LOCAL_NAV } from '@/data/panelMock';

export default function LocalHistorial() {
  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Historial de validaciones"
    >
      <PanelEmpty
        icon="clock"
        title="Historial próximamente"
        hint="Cuando el backend registre los canjes, vas a ver acá cada validación: qué miembro usó qué beneficio, cuándo y su estado."
      />
    </PanelShell>
  );
}
