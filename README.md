# ClubPlaza · Frontend

PWA mobile-first del programa de beneficios de **Green Plaza**. Los visitantes se
registran como socios, exploran promociones de los locales y muestran su credencial
digital con QR para canjear beneficios.

> Etapa 1 · Lanzamiento. Frontend con datos mock; el backend (Supabase) se conecta
> sin tocar componentes (ver [Conexión al backend](#conexión-al-backend)).

## Stack

- **React 19 + TypeScript + Vite** (con React Compiler)
- **Tailwind CSS v4** — la config vive en `src/index.css` (`@theme`), no hay `tailwind.config.js`
- **shadcn/ui** (estilo radix-nova) — sus componentes en `src/components/ui/` (lowercase, ej. `button.tsx`)
- **React Router v6** — rutas públicas y protegidas
- **react-hook-form + zod** — formulario de alta con validación en tiempo real
- **qrcode.react** — QR de la credencial
- **lucide-react** — iconos
- Tipografías: **Montserrat** (UI, sustituto de Gotham) + **Spline Sans Mono** (código de socio)

## Cómo correr

> El equipo del proyecto usa **npm**. En la máquina donde se portó el frontend solo
> había **Bun**, así que la instalación local se hizo con `bun`. Ambos leen el mismo
> `package.json`. Si usás npm, corré `npm install` para regenerar `package-lock.json`
> con las dependencias nuevas (router, hook-form, zod, qrcode.react). `bun.lock` está
> gitignoreado.

```bash
npm install     # (o: bun install)
npm run dev     # http://localhost:5173
npm run build   # tsc -b + vite build
npm run preview
```

## Las 5 pantallas (variantes del wireflow)

| Ruta | Pantalla | Variante |
|------|----------|----------|
| `/` | Carga / Splash | C — foto del shopping + logo que se dibuja + dots |
| `/registro` | Alta de socio | A — formulario único + consentimiento Ley 25.326 |
| `/beneficios` | Home / Beneficios | B — "Beneficio del día" hero + grid + barra WhatsApp |
| `/beneficios/:id` | Detalle de beneficio | A — imagen hero + "cómo usarlo" + CTA fijo |
| `/credencial` | Credencial digital (protegida) | A — carnet verde full + QR + código GP |

> El splash redirige solo tras ~2.4s (con sesión → `/beneficios`, sin sesión → `/registro`).
> Agregá `?stay` a la URL (`/?stay`) para congelarlo (QA / demos).

Próximas etapas (todavía sin diseño): `/perfil` y el panel `/admin/*`.

## Estructura (lo agregado para ClubPlaza)

```
src/
├── components/
│   ├── auth/ProtectedRoute.tsx   # redirige a /registro si no hay sesión
│   ├── benefits/                 # BenefitCard, BenefitBadge, BenefitImage
│   ├── brand/                    # Logo (wordmark) + BrandMark (isotipo animado)
│   ├── feedback/States.tsx       # Skeleton + ErrorState
│   └── ui/
│       ├── button.tsx            # shadcn (del dev) — NO tocado
│       ├── app-button.tsx        # botón del wireflow (verde, wa, outline…)
│       ├── AppCanvas.tsx · Chip.tsx · TextField.tsx
├── context/AuthContext.tsx       # estado de auth GLOBAL del socio
├── hooks/                        # useAuth, usePromos, useSocio
├── lib/                          # utils (cn + helpers), categorias, schemas, supabase (stub)
├── data/mock.ts                  # MOCK_PROMOS, MOCK_SOCIO
├── pages/                        # las 5 pantallas
└── types/index.ts                # Socio, Promo, Local (espejean Supabase)
```

> Nota: el botón de la marca está en `app-button.tsx` para no colisionar con el
> `button.tsx` de shadcn (macOS es case-insensitive). Ambos conviven.

## Conexión al backend

Todas las llamadas a datos viven en **custom hooks** (`hooks/`), nunca en componentes.
Hoy devuelven mocks con la **misma forma** que devolverá la API. Cada punto de
integración está marcado con `// TODO BACKEND:`.

Para conectar Supabase:

1. Reemplazar `src/lib/supabase.ts` (stub) por el cliente real y completar `.env`
   (ver `.env.example`).
2. En `hooks/usePromos.ts` y `hooks/useSocio.ts`, descomentar el import de `supabase`
   y reemplazar el bloque mock por la query (los `TODO BACKEND` indican qué va).
3. En `context/AuthContext.tsx`, reemplazar `login` / `register` / `logout` y la
   rehidratación de sesión por `supabase.auth.*`.
4. Generar los tipos con `supabase gen types typescript` y alinear `types/index.ts`.

La lógica de rutas protegidas (`ProtectedRoute`) **no cambia** al conectar el backend:
solo cambia de dónde sale `isAuthenticated` (ya vive en el `AuthContext`).

## Notas de diseño

- La paleta y los tokens replican el **wireflow** (verde `#23753a` / `#17502a`),
  cargados como tokens de Tailwind v4 en `src/index.css` (`bg-brand`, `text-ink`, etc.).
- La fuente de UI se fijó en **Montserrat** (requisito de marca; reemplaza a Geist del
  starter). El sistema de tema de shadcn quedó intacto para sus componentes.
- El wireflow mostraba las pantallas dentro de un mockup de iPhone (status bar, isla
  dinámica): eso es chrome de presentación, **no** UI del producto, así que no se
  reproduce. En desktop el lienzo se centra con un marco tipo teléfono; en mobile es
  full-screen.
- Las variantes B (Home) y A (Credencial) elegidas no incluyen bottom nav ni banner
  Mundialistas, por eso no están en esta etapa.

## Pendientes (necesitan input)

- URL real del **canal de WhatsApp** de Green Plaza (botón "Sumarme" / compartir).
- Iconos PWA `public/icon-192.png` y `public/icon-512.png` (el manifest ya los referencia).
