# Backend — pendientes para los paneles (admin y local)

Fecha: 2026-09-09. El front ya está adaptado a todo lo que sigue: cuando el backend lo implemente, funciona sin cambios del lado del front (salvo donde se indica).

> **Estado 2026-09-11: TODO VERIFICADO contra la API real.** Puntos 1 a 7 implementados y probados
> (ids en canjes, `?rol=` en usuarios y altas, corte de mes en huso AR con un canje a las 23:30 del
> 31/08, `serie`+`desde`/`hasta` en stats, `/canjes/serie` y `/usuarios/altas?desde&hasta`,
> `acepta_comunicaciones` en registro/usuarios, rechazados persistidos con `motivo`). El front ya
> consume todo. Queda este archivo como registro.

## 1. `GET /api/canjes` y `GET /api/canjes/mine`: devolver los ids sueltos

Hoy cada canje viene con los joins (`usuarios{codigo,nombre,apellido}`, `promos{titulo}`) pero **no confirmamos** que traiga `usuario_id`, `promo_id` y `local_id`. El front los usa si vienen y si no cae a un fallback (código de credencial / título), pero:

- **"Local favorito"** en la exportación de campañas (admin) necesita `local_id` en cada canje. Sin eso, esa columna sale vacía.
- **Columna "Canjes"** en Mis beneficios (local) agrupa por `promo_id`; sin él agrupa por título (funciona, pero se rompe si dos promos tienen el mismo título).

**Pedido:** incluir `usuario_id`, `promo_id` y `local_id` en cada ítem de ambos listados. No sacar nada de lo que ya viene.

## 2. `GET /api/usuarios/altas?rol=comun` y `GET /api/usuarios?rol=`

El gráfico del dashboard se llama "Altas de usuarios" porque la serie suma todos los roles. Si `/usuarios/altas` acepta `?rol=comun`, el front lo usa y vuelve a decir "Altas de miembros". Idem `?rol=` en `/usuarios` para contar sin traer el listado.

## 3. Cortes de tiempo en huso Argentina

`canjes_mes`, `canjes_ultimos_7_dias`, `miembros_unicos_mes` y los buckets de `/usuarios/altas` se agrupan en el backend. Verificar que el corte de día/mes se haga en `America/Argentina/Buenos_Aires` y no en UTC: un canje a las 22:00 del 31/08 (hora AR) tiene que contar en agosto. El front ya convierte todo lo que muestra o agrupa por su cuenta.

## 4. `canjes_ultimos_7_dias` con `?mes=` trae el mes entero

El campo se llama "últimos 7 días" pero con `?mes=YYYY-MM` devuelve todos los días del mes (30/31). El front ya lo maneja. Propuesta: agregar `serie: [{fecha, cantidad}]` + `desde`/`hasta` en `/canjes/stats` y `/canjes/stats/mine`, manteniendo el campo viejo hasta que los fronts migren.

## 5. Rango de fechas para el gráfico del dashboard (ya especificado)

`/usuarios/altas?desde=&hasta=` y `/canjes/serie?desde=&hasta=` — ver `backend-spec-stats-por-mes.md`. Hoy la flecha "semana anterior" del dashboard muestra "Sin datos" hasta que exista.

## 6. Consentimiento de comunicaciones (para la exportación de campañas)

Columna `acepta_comunicaciones` (boolean, default false) + `acepta_comunicaciones_at` (timestamptz) en `usuarios`. `POST /auth/register` la recibe, `PATCH /usuarios/me` la permite cambiar, y `GET /usuarios` la devuelve. Cuando exista, la exportación de campañas filtra solo a quienes aceptaron. El tilde en el registro y en el perfil lo hace el front cuando el backend esté.

## 7. Persistir canjes rechazados

`POST /canjes` hoy responde error y no guarda el intento. Guardar con `estado = 'rechazado' | 'repetido'` y `motivo` (`vencido` / `dia_no_habilitado` / `limite_alcanzado` / `pausado`). El front ya muestra esos estados en el historial.

## Verificado que YA está bien (no tocar)

- `GET /locales?estado=` y `?activo=false` funcionan.
- `dias` de promos llega como array de enteros en `/promos` y `/promos/mine`.
- Horarios que cruzan medianoche se aceptan.
- 403 al pedir datos de otro `local_id`.
