# Backend spec — Estado de locales: `disponible` / `proximamente` / `inactivo`

Para el **backend dev**. Hoy un local solo tiene `activo` (boolean), que no alcanza
para lo que necesitamos: queremos **3 estados** y que el endpoint los filtre bien
(hoy el filtro se ignora). Este documento reemplaza y amplía a
`backend-spec-locales-inactivos.md`.

---

## 1. Qué queremos lograr

Cada local puede estar en uno de tres estados:

| Estado | Se ve para el **socio/usuario** | Se ve en el **panel admin** |
|---|---|---|
| **`disponible`** | Sí, normal (aparece en el directorio, se entra y ve sus beneficios) | Sí |
| **`proximamente`** | Sí, pero como **"Próximamente"** (aparece con un cartel/badge; al entrar muestra "Próximamente" en vez de los beneficios) | Sí |
| **`inactivo`** | **No** (no figura en el directorio ni es accesible; sus beneficios no se muestran) | **Sí** (para poder verlo/reactivarlo — NO se borra) |

Ejemplos reales: **Somos Palta** debería poder marcarse como `proximamente`; **BYD**
hoy está "de baja" y tiene que seguir viéndose en el panel admin, pero no para el
socio → `inactivo`.

---

## 2. Problemas actuales (verificados en producción)

1. **No existe el concepto de "próximamente".** Solo hay `activo` (true/false), que
   son 2 estados, no 3.
2. **El endpoint ignora el filtro.** `GET /api/locales?activo=false` devuelve igual
   los **activos** (no los inactivos). Por eso un local inactivo desaparece del
   panel admin y parece borrado (sigue en la base, pero el endpoint nunca lo
   entrega). Esto hay que corregirlo sí o sí.

---

## 3. Cambio en la base

Agregar una columna `estado` a `locales` (texto con CHECK, o un enum de Postgres):

```sql
-- Opción con CHECK (simple, consistente con cómo ya se guarda `rubro`):
ALTER TABLE public.locales
  ADD COLUMN estado text NOT NULL DEFAULT 'disponible'
  CHECK (estado IN ('disponible', 'proximamente', 'inactivo'));

-- Backfill desde el `activo` actual:
UPDATE public.locales
SET estado = CASE WHEN activo THEN 'disponible' ELSE 'inactivo' END;
```

**Sobre `activo`:** conviene dejar de usarlo como fuente de verdad y pasar a
`estado`. Para no romper nada durante la transición, mantenerlo sincronizado
(por trigger o desde la API):

```
activo = (estado <> 'inactivo')
```

Así, un cliente viejo que aún filtra por `activo=true` sigue viendo `disponible` +
`proximamente` (solo que sin el tratamiento visual de "próximamente"), y nunca ve
los `inactivo`. Más adelante se puede eliminar `activo`.

---

## 4. Cambios en la API

### 4.1 · `GET /api/locales` — respetar el filtro por estado

Hoy el endpoint fuerza activos e ignora el query param. Tiene que:

- Aceptar **`?estado=<valor>`** (uno o varios). Sugerido soportar lista:
  `?estado=disponible,proximamente`.
- **Sin filtro de estado:** devolver **todos** (los 3 estados). Lo usa el admin.
- Devolver **`estado`** en cada local del listado y del detalle.

| Request | Debe devolver |
|---|---|
| `GET /api/locales?estado=disponible,proximamente` | lo que ve el **socio** (disponibles + próximamente) |
| `GET /api/locales?estado=inactivo` | solo los inactivos |
| `GET /api/locales` (sin filtro) | **todos** (lo usa el **admin**) |

> Compatibilidad: seguir aceptando `?activo=true|false` mapeado a estado
> (`activo=true` → `estado IN ('disponible','proximamente')`; `activo=false` →
> `estado = 'inactivo'`), **respetándolo de verdad** (hoy se ignora). Pero el
> front va a migrar a `?estado=`.

### 4.2 · `POST /api/locales` y `PATCH /api/locales/:id` — aceptar `estado`

- Aceptar `estado` en el body (uno de los 3 valores; validar contra el CHECK).
- Si además se sigue mandando `activo`, priorizar `estado` (o derivar `activo` de él).
- Devolver el local con su `estado` actualizado.

### 4.3 · Permisos / visibilidad

- El endpoint que consume la **app del socio** (público) debe devolver **solo**
  `disponible` + `proximamente`. Nunca `inactivo`.
- El endpoint del **admin** debe poder traer **todos** los estados.
- Si hoy esto se resuelve con el mismo `/api/locales` + query param, alcanza con
  respetar el filtro. Si hay lógica por rol, aplicar: rol admin → todos; resto →
  disponibles + próximamente.

### 4.4 · `GET /api/locales/:id` (detalle de un local)

- Para el **socio**, un local `inactivo` NO debe ser accesible: responder **404**
  (o el mismo "no encontrado" que un id inexistente). `proximamente` sí es accesible
  (el front muestra el cartel).
- Para el **admin**, el detalle debe traerse en cualquier estado, con su `estado`.

---

## 5. Beneficios de locales no disponibles (importante)

Hoy los beneficios se listan por su propio `activa`, sin mirar el estado del local.
Para que un local `inactivo` (o `proximamente`) no "filtre" sus beneficios en el
Home del socio:

- En el endpoint de beneficios que consume el socio, **excluir los beneficios cuyo
  local esté `inactivo`** (y, para `proximamente`, ver punto 6: probablemente
  tampoco se muestren sueltos en el Home, solo dentro del cartel del local).

(Si preferís, esto lo podemos filtrar también en el front; avisá qué te queda mejor.)

### 5.1 · Validación de canjes / escaneos

Para que no se pueda canjear en un local que no está disponible: el endpoint de
**canje/escaneo** (`POST /api/canjes`, `POST /api/escaneos`) debe **rechazar** la
operación si el local del beneficio está `inactivo` (y, según definamos,
también `proximamente`, que en principio no tiene beneficios activos). Devolver un
error claro (ej. "El local no está disponible").

---

## 6. Qué hace el front con cada estado (para contexto — NO es tarea del backend)

> Esta sección es solo para que se entienda el contrato completo. **El "mostrar"
> (badges, cartel de "Próximamente", selector de estado en el panel) lo hace el
> front.** Del backend solo se necesita el campo `estado` y que el endpoint respete
> el filtro (secciones 1–5).

- **`disponible`:** igual que hoy.
- **`proximamente`:** el local aparece en el directorio con un badge "Próximamente";
  al entrar, en vez de los beneficios se muestra un cartel "Próximamente".
- **`inactivo`:** el front del socio no lo pide (usa `?estado=disponible,proximamente`);
  el panel admin lo pide sin filtro y lo muestra con su badge de estado, editable.

El front ya está prácticamente listo para el caso "inactivo no figura para el
socio pero sí para el admin"; solo necesita que el endpoint **respete el filtro** y
**devuelva `estado`**. La parte de "próximamente" (badge + cartel) la sumamos en el
front una vez que el campo exista en la API.

---

## 7. Resumen de lo mínimo a entregar

1. Columna `estado` en `locales` (+ backfill) y `activo` sincronizado.
2. `GET /api/locales` que **respete** `?estado=` (y `?activo=` por compat), devuelva
   **todos** sin filtro, e incluya `estado` en la respuesta.
3. `GET /api/locales/:id`: socio no accede a `inactivo` (404); admin sí, en cualquier estado.
4. `POST`/`PATCH` que acepten `estado`.
5. Socio: solo `disponible` + `proximamente`. Admin: todos.
6. No listar al socio beneficios de locales `inactivo`.
7. `POST /api/canjes` y `POST /api/escaneos`: rechazar si el local no está disponible.
