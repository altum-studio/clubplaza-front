# ClubPlaza · Especificación de datos — Locales y Beneficios

Documento para el equipo de **backend**. Define los campos necesarios para crear/editar
**Locales** y **Beneficios (promos)**, con tipos, enums predefinidos, formatos de archivo
y las diferencias respecto del contrato actual de la API.

Convención de fechas: ISO `YYYY-MM-DD`. Convención de días: `0=Domingo, 1=Lunes … 6=Sábado`.

---

## 1. Enums compartidos (front ↔ back)

### 1.1 Rubros
Ya existen en el frontend; respetar los `value` **exactos** (en minúscula, sin acentos):

| value | label |
|---|---|
| `gastronomia` | Gastronomía |
| `almacen` | Almacén |
| `salud` | Salud y Bienestar |
| `hogar` | Hogar y Mascotas |
| `servicios` | Servicios |
| `tecnologia` | Tecnología y Movilidad |

### 1.2 Tipos de beneficio (propuesta — confirmar lista final)

| value | label | usa `valor` |
|---|---|---|
| `2x1` | 2x1 | no |
| `3x2` | 3x2 | no |
| `descuento` | Descuento % | sí (porcentaje, ej. `20`) |
| `descuento_fijo` | Descuento $ | sí (monto) |
| `cuotas` | Cuotas sin interés | sí (nº de cuotas) |
| `combo` | Combo / precio fijo | opcional (precio) |
| `regalo` | Regalo / 2ª gratis | no |
| `envio_gratis` | Envío gratis | no |
| `bonificacion` | Bonificación | opcional |

### 1.3 Período de límite de uso

`dia` · `semana` · `mes` · `vigencia` · `ilimitado` (default `ilimitado`).

---

## 2. LOCALES

| Campo | Tipo | Requerido | Notas |
|---|---|:---:|---|
| `id` | uuid | — | PK |
| `nombre` | string | ✅ | |
| `nro_local` | string | ✅ | **reemplaza `piso`** (ej. `"L.16"`, `"St.04"`) |
| `rubro` | enum rubro | ✅ | una de las 6 opciones (1.1) |
| `descripcion` | text | — | |
| `logo_url` | string | — | **se sube un archivo SVG** (no se pega URL). El backend lo guarda y devuelve la URL. Ver §4 |
| `banner_url` | string | — | imagen de portada del local (PNG/JPG/WebP) |
| `horarios` | jsonb | — | horarios de apertura por día (formato abajo) |
| `activo` | boolean | — | default `true` |
| `created_at` | timestamptz | — | |

### 2.1 Formato `horarios`
Array por día; soporta turno cortado (varios rangos). Los días no incluidos se consideran cerrados.

```json
[
  { "dia": 1, "cerrado": false, "rangos": [["10:00","13:00"], ["17:00","21:00"]] },
  { "dia": 2, "cerrado": false, "rangos": [["10:00","21:00"]] },
  { "dia": 0, "cerrado": true,  "rangos": [] }
]
```
- `dia`: `0–6`
- `cerrado`: boolean
- `rangos`: array de pares `["HH:MM","HH:MM"]` en formato 24h

### 2.2 Ejemplo — crear local
Metadata JSON + archivos por `multipart/form-data`:

```json
{
  "nombre": "Almacén de Pizzas",
  "nro_local": "L.16",
  "rubro": "gastronomia",
  "descripcion": "Pizzería artesanal",
  "horarios": [
    { "dia": 1, "cerrado": false, "rangos": [["11:00","23:00"]] }
  ],
  "activo": true
}
```
Archivos adjuntos: `logo` (`image/svg+xml`), `banner` (`image/*`).

---

## 3. BENEFICIOS (promos)

| Campo | Tipo | Requerido | Notas |
|---|---|:---:|---|
| `id` | uuid | — | PK |
| `local_id` | uuid | ✅ | FK a locales |
| `rubro` | enum rubro | auto | **se toma del rubro del local** (denormalizar al guardar o resolver por join; útil para filtrar) |
| `titulo` | string | ✅ | |
| `tipo` | enum tipo | ✅ | lista 1.2 |
| `valor` | numeric | — | **no siempre**; su significado depende del `tipo` (%, monto, nº cuotas) |
| `descripcion` | text | — | |
| `dias` | int[] | ✅ | días válidos `0–6` (ej. `[1,2,3,4,5]`) |
| `vigencia_desde` | date | ✅ | |
| `vigencia_hasta` | date | ✅ | |
| `limite_cantidad` | int | — | ej. `1` |
| `limite_periodo` | enum | — | `dia` \| `semana` \| `mes` \| `vigencia` \| `ilimitado` (default `ilimitado`) |
| `banner_url` | string | — | imagen del beneficio (PNG/JPG/WebP) |
| `activa` | boolean | — | default `true` |
| `created_at` | timestamptz | — | |

> **Límite de uso** = `limite_cantidad` + `limite_periodo`.
> Ej.: "1 uso por miembro por día" → `{ "limite_cantidad": 1, "limite_periodo": "dia" }`.
> El control real de "por miembro" requiere una tabla de **canjes/validaciones** (hoy inexistente).

### 3.1 Ejemplo — crear beneficio
```json
{
  "local_id": "uuid-del-local",
  "titulo": "2x1 en pizzas",
  "tipo": "2x1",
  "valor": null,
  "descripcion": "Llevás dos y pagás una.",
  "dias": [4, 5, 6],
  "vigencia_desde": "2026-07-01",
  "vigencia_hasta": "2026-07-31",
  "limite_cantidad": 1,
  "limite_periodo": "dia"
}
```
Archivo opcional: `banner` (`image/*`). El campo `rubro` lo completa el backend con el rubro del local.

---

## 4. Archivos (logo SVG + banners)

- **Logo (SVG):** subir archivo `image/svg+xml` — **no** se pega una URL. Recomendado:
  guardar en Supabase Storage (bucket `logos`) y devolver la URL pública en `logo_url`.
  **Sanitizar el SVG** (quitar `<script>` y handlers `on*`) antes de servirlo, por seguridad.
  *Alternativa:* guardar el markup SVG en una columna `logo_svg` (text) para renderizarlo inline
  — el frontend ya inlinea los logos circulares; a definir cuál se prefiere.
- **Banners:** `image/png | jpeg | webp` → bucket `banners` → URL en `banner_url`.
- **Endpoints:** aceptar `multipart/form-data` en el `POST/PATCH` de local y promo, **o**
  exponer un `POST /api/upload` que reciba el archivo y devuelva la URL para mandarla en el JSON.
- Límites sugeridos: logo ≤ 512 KB, banner ≤ 2 MB.

---

## 5. Permisos por rol (sin cambios respecto al modelo actual)

- **admin:** ABM completo de locales y beneficios.
- **local:** edita **su** local (`PATCH /locales/mine/mi-local`) y gestiona **sus** beneficios
  (`/promos/mine/mis-promos`). El `local_id` se infiere del usuario, no se envía.
- **comun / público:** solo lectura de locales y beneficios activos.

---

## 6. Diferencias vs. el contrato actual

### Locales
- ❌ quitar `piso` → ✅ agregar `nro_local`
- ✅ agregar `rubro` (enum), `banner_url`, `horarios` (jsonb)
- 🔄 `logo_url` ahora proviene de **upload de SVG** (antes URL libre)

### Beneficios (promos)
- ✅ agregar `tipo` (enum), `dias` (int[]), `limite_cantidad`, `limite_periodo`, `banner_url`
- ✅ agregar `rubro` (derivado del local)
- 🔄 `fecha_inicio` / `fecha_fin` → `vigencia_desde` / `vigencia_hasta`
- 🔄 `descuento` (number) se generaliza a `valor` (number, opcional, según `tipo`)
- ➕ `imagen_url` actual ≈ `banner_url`

---

*Generado para coordinar front ↔ back. Ante dudas sobre los `value` de enums, son la fuente de
verdad los del frontend (`src/types/index.ts` y `src/lib/categorias.ts`).*
