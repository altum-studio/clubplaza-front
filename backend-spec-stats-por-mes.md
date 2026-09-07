# Backend spec — Estadísticas por mes (selector de calendario)

Para el **backend dev**. El front ya cablea un **selector de mes** en los dashboards (Admin y Panel Local). Para que al cambiar de mes se actualicen los datos, las métricas tienen que aceptar el mes.

## Qué cambia

Agregar el query param **`mes` = `YYYY-MM`** a los endpoints de stats. Default: **mes actual** (comportamiento de hoy, para no romper nada).

| Endpoint | Cambio |
|---|---|
| `GET /api/canjes/stats?local_id=&mes=YYYY-MM` | métricas globales/por-local del mes indicado (admin) |
| `GET /api/canjes/stats/mine?local_id=&mes=YYYY-MM` | métricas del local del mes indicado (rol local) |

### Respuesta (mismo shape de siempre, pero del mes pedido)

```json
{
  "canjes_mes": 42,
  "canjes_ultimos_7_dias": [
    { "fecha": "2026-05-01", "cantidad": 3 },
    { "fecha": "2026-05-02", "cantidad": 5 }
  ],
  "miembros_unicos_mes": 28,
  "beneficio_mas_canjeado": { "promo_id": "…", "titulo": "…", "cantidad": 15 }
}
```

- **`canjes_mes`**, **`miembros_unicos_mes`**, **`beneficio_mas_canjeado`**: calculados sobre el **mes pedido** (`mes`), no el actual.
- **`canjes_ultimos_7_dias`**: la **serie diaria del mes pedido** (puede ser el mes completo día a día, o los últimos 7 días de ese mes — lo que te resulte más simple). El front dibuja las barras según las `fecha` que devuelvas, así que cualquiera de las dos sirve; con la fecha alcanza.

### Notas
- Si `mes` se omite → mes actual (igual que hoy).
- Formato `mes`: `YYYY-MM` (ej. `2026-05`). Si querés validarlo, rechazá formatos inválidos con 400.
- Todo lo demás (permisos por `local_id`, multi-local) sigue igual que en `backend-spec-multi-local.md`.

## Navegación de semanas (gráfico del dashboard) — NUEVO

En el gráfico del dashboard admin, la vista **"Semana"** ahora tiene flechas ‹ › para
ir a **semanas anteriores** (hoy solo se ven los últimos 7 días). El front ya tiene
la UI y el cableado; falta que el back sepa devolver **datos diarios de un rango**.

Agregar soporte de **rango `desde` / `hasta`** (ambos `YYYY-MM-DD`, inclusive) que
devuelva **un bucket por día** del rango (incluyendo los días en 0):

| Endpoint | Devuelve |
|---|---|
| `GET /api/usuarios/altas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` | altas por día del rango |
| `GET /api/canjes/serie?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` | canjes por día del rango |

### Respuestas

`/usuarios/altas` con rango — mismo shape que `?periodo=` (un objeto por día):

```json
[
  { "periodo": "2026-09-01", "count": 4 },
  { "periodo": "2026-09-02", "count": 0 }
]
```

`/canjes/serie`:

```json
[
  { "fecha": "2026-09-01", "cantidad": 3 },
  { "fecha": "2026-09-02", "cantidad": 0 }
]
```

### Notas
- El front pide ventanas de **7 días** (una semana), pero conviene que el endpoint
  acepte **cualquier rango** (por si después sumamos otras vistas).
- Devolver **todos los días del rango**, incluso los que tienen 0 (para que el
  gráfico no “salte” días).
- La **semana actual** (últimos 7 días) el front la sigue resolviendo con los
  endpoints de siempre, así que ya funciona; el rango es solo para **semanas
  pasadas**. Mientras no exista, esas semanas se muestran vacías (no rompe nada).
- `/api/usuarios/altas`: hoy acepta `?periodo=mes|semana`; sumarle `?desde=&hasta=`
  sin romper lo anterior.

## Qué ya hizo el front
- Admin: el KPI "Canjes del mes" y el "Top locales por canjes" se recalculan al cambiar el mes (mandan `?mes=`). El selector de mes se movió **debajo de los KPIs** (solo afecta a esas dos cosas, no a los totales). "Altas de miembros" ya es **real** (calculado en el front desde las fechas de alta de usuarios).
- Gráfico del dashboard: navegación de semanas lista (‹ ›); la semana actual funciona, las anteriores esperan los endpoints de rango de arriba.
- Panel Local (Estadísticas): KPIs + gráfico "Canjes por día" + "Beneficio más canjeado" mandan `?mes=`.
- Mientras el back ignore `mes`/rango, el front sigue mostrando lo actual (no rompe); apenas lo implementes, se actualiza solo.
