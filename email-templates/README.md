# Email de bienvenida — ClubPlaza

Plantilla del mail que se envía **automáticamente cuando un usuario se registra**.

## Archivo

- **`ClubPlaza-Bienvenida.html`** — email HTML completo, listo para usar como cuerpo del mail.
  - Título: "Bienvenido a ClubPlaza".
  - Es **estático**: no tiene variables a reemplazar (no usa `{{nombre}}`, `{{codigo}}`, etc.).

## Cuándo se envía

Después de un registro exitoso, es decir tras `POST /api/auth/register` (ver la guía
de integración del backend). El backend debería disparar el envío con el HTML de este
archivo como cuerpo (`html`) del mail, al `email` del usuario recién creado.

Ejemplo conceptual (Node):

```js
import fs from 'fs';
const html = fs.readFileSync('email-templates/ClubPlaza-Bienvenida.html', 'utf8');

await mailer.sendMail({
  from: 'ClubPlaza <no-reply@clubplaza...>',
  to: usuario.email,
  subject: 'Bienvenido a ClubPlaza',
  html,
});
```

## Responsive

Es responsive: tabla de 600px con `max-width` + media query (`@media max-width:600px`)
que la pasa a ancho completo en celular y adapta título, padding y el hero. Probado en
navegador a distintos anchos.

## Peso e imágenes

El template fue **optimizado**: pasó de **~5 MB a ~460 KB**. La imagen de fondo (hero)
era un PNG de 1.26 MB repetido 3 veces (fondo CSS + atributo + fallback de Outlook); se
convirtió a **JPEG** (~110 KB c/u, 1000px de ancho). Los logos/íconos ya eran livianos.

⚠️ **Para producción (recomendado):** aunque ya pesa mucho menos, sigue llevando las
imágenes embebidas en base64. **Gmail recorta** los mails cuyo HTML supera ~102 KB
("[Mensaje recortado]"). Lo ideal es **subir las imágenes a un hosting/CDN** (o al storage
de Supabase) y reemplazar cada `src="data:image/...;base64,..."` / `url('data:...')` por la
**URL pública**. Así el HTML queda en pocos KB y ningún cliente lo recorta. El diseño no
cambia; solo cambia de dónde se cargan las imágenes.
