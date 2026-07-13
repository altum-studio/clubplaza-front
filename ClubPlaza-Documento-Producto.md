# ClubPlaza — Documento explicativo del producto

> Insumo para presentación comercial (dueños del shopping y locatarios). En cada punto: primero **qué hace técnicamente** y después **cómo explicárselo a alguien que no sabe de tecnología**. Se prioriza lo que está realmente funcionando por sobre lo planeado.

**Contexto general:** ClubPlaza es el club de beneficios del shopping Green Plaza. Tiene tres tipos de usuario: **miembros** (los clientes/socios), **comercios/locales** (locatarios) y **administradores** (Green Plaza). El miembro usa una app con una credencial digital (código único + QR); el local valida esa credencial desde su panel; el admin gestiona todo. Hay tres accesos con permisos separados por rol.

---

## 1) Panel de Administrador

Acceso: rol **admin**. Menú con 4 secciones: Dashboard, Locales, Beneficios, Usuarios.
Rutas: `/admin`, `/admin/locales`, `/admin/beneficios`, `/admin/usuarios`.

### A. Dashboard (`/admin`)
**Técnico:**
- 4 indicadores en vivo (datos reales de la base): Miembros totales, Locales activos, Beneficios publicados, Canjes del mes.
- Gráfico **"Altas de miembros"**: nuevos registros por mes (arranca en el mes de lanzamiento, Junio) o por día (últimos 7). Tiene eje con números, tooltip al pasar el mouse (muestra el número exacto) y scroll horizontal para ver más meses.
- **"Top locales por canjes"**: ranking de locales ordenado por cantidad de canjes del mes, con scroll.
- Selector de mes (arriba a la derecha): cambia los canjes del mes y el ranking al mes elegido (no deja ir al futuro).

**Simple:** Es la pantalla de resumen. De un vistazo, Green Plaza ve cuántos socios hay, cuántos locales y beneficios activos, cuántos canjes hubo en el mes, cómo crecen las altas de socios y qué locales son los más usados.

### B. Locales (`/admin/locales`)
**Técnico:**
- Indicadores: Locales, Activos, Inactivos, Beneficios totales.
- Buscador + filtros (todos / activos / inactivos) + tabla con logo, nombre, nº de local, cantidad de beneficios y estado.
- **ABM completo**: dar de alta, editar y dar de baja locales. Campos de cada local: nombre, nº de local, rubro, descripción, logo (SVG), banner (imagen), horarios de atención por día, activo/inactivo.

**Simple:** Acá el admin da de alta un comercio nuevo, le carga su logo, rubro, horarios y foto, y lo puede activar, pausar o eliminar. Es la "guía de locales" del shopping.

### C. Beneficios (`/admin/beneficios`)
**Técnico:**
- Lista de locales; cada uno se despliega y muestra sus beneficios. Contador "Publicados · N".
- El admin puede cargar un beneficio (eligiendo el local) o agregarlo desde un local desplegado, y editar/eliminar cualquiera. **No hay circuito de aprobación**: se publican directo.
- Campos de un beneficio: título, tipo (2x1, 3x2, descuento %, descuento $, cuotas sin interés, combo, regalo, envío gratis, bonificación), valor (o precio anterior tachado + precio nuevo para "Descuento $"), descripción, días válidos, vigencia (fechas o "sin vencimiento"), límite de uso (por día/semana/mes), banner, activo/pausado. El rubro se toma solo del local.

**Simple:** El admin puede ver y administrar todos los beneficios de todos los locales, y cargar o editar promociones en nombre de cualquier comercio.

### D. Usuarios (`/admin/usuarios`)
**Técnico:**
- Indicadores: Usuarios (total), Miembros, Comercios, Administradores.
- Buscador + filtros por rol + tabla con nombre, email, rol, locales asignados y estado.
- **ABM completo**: crear, editar y eliminar usuarios; cambiar el rol (miembro/comercio/admin); a un usuario "comercio" se le pueden asignar uno o varios locales (multi-local). Campos: email, contraseña, nombre, apellido, DNI, teléfono, fecha de nacimiento, rol, locales asignados, activo.

**Simple:** Acá el admin ve todos los registrados (socios, comercios y administradores), puede crear o dar de baja cuentas, cambiar permisos y decidir qué local(es) maneja cada comercio.

### ⚠️ Lo que está a medio hacer / placeholder en el admin
- En la tabla de Locales, la columna **"Canjes" por local muestra "—"** (ese dato sí se ve en el ranking del Dashboard, pero no en esa tabla).
- **No hay exportación** de reportes (CSV/Excel) en ninguna pantalla.
- **No hay una pantalla de admin con el detalle/histórico** de todos los canjes y escaneos (ese detalle existe a nivel de cada local, en su propio panel).
- **"Sistema de puntos": a futuro**, no está construido (se menciona como "muy pronto" en el mail de bienvenida).

---

## 2) Mail de bienvenida

**Técnico:**
- Archivo: `email-templates/ClubPlaza-Bienvenida.html`. Es un mail HTML completo, con diseño (foto de fondo, logo, botón).
- **Qué lo dispara:** el registro de un nuevo socio (endpoint `POST /api/auth/register`). Está preparado para enviarse automáticamente al crear la cuenta.
- **A quién llega:** al email del socio recién registrado.
- **Qué datos usa:** es un template **estático** — hoy **NO se personaliza con el nombre real** (el saludo "Hola Camila" está fijo como ejemplo). Todavía no inserta el nombre del socio; eso quedaría para conectar del lado del backend.

**Contenido real (texto del mail):**

```
Asunto/título: Bienvenido a ClubPlaza
Preheader (vista previa): Bienvenida a ClubPlaza. Recorré tus beneficios — y enterate de lo que viene.

TE DAMOS LA BIENVENIDA
Hola Camila,
ya sos parte de ClubPlaza

Qué bueno tenerte acá. ClubPlaza reúne a tus comercios favoritos en un solo
lugar: descubrí descuentos, 2x1 y promociones, y aprovechalos mostrando tu
credencial digital. Sin papeles, sin vueltas.

Explorá — Recorré los comercios adheridos y sus promociones.
Canjeá — Mostrá tu credencial con QR en el local.

[Botón] Recorrer ClubPlaza →

✦ Muy pronto · Sistema de puntos
Estamos preparando un sistema de puntos. Cada beneficio que uses queda
registrado desde hoy, así, cuando lo lancemos, ya empezás con ventaja.
Cuanto antes empieces, más historia sumás.

Seguinos @greenplazaok
```

**Otros mails automáticos:**
- **Recuperación de contraseña** ("Olvidé mi contraseña"): cuando el socio pide restablecer, se dispara un mail con un enlace para crear una contraseña nueva. Ese mail lo genera el servicio de autenticación (Supabase), no hay un template propio en el repo. *(Nota: al momento de esta revisión, ese endpoint del backend daba error 500 — el envío del mail de reseteo hay que terminarlo del lado del backend.)*
- **No hay** mail de "confirmación de email" ni otros automáticos además de esos dos.

**Simple:** Cuando alguien se registra, está preparado un mail de bienvenida lindo que le explica qué es ClubPlaza y cómo usar la credencial. Hoy el saludo va con un nombre de ejemplo fijo ("Hola Camila"); para que diga el nombre real de cada socio falta un ajuste del lado del servidor. El otro mail automático es el de recuperar contraseña.

---

## 3) Panel del Locatario

Acceso: rol **local**. Menú con 5 secciones: Inicio, Validar, Beneficios, Stats, Mi Local.
Rutas: `/panel`, `/panel/validar`, `/panel/beneficios`, `/panel/estadisticas`, `/panel/mi-local` (+ `/panel/historial`).
*(Si un dueño maneja varios locales, arriba tiene un selector con el logo de cada uno para cambiar de local; todo lo que ve se ajusta al local elegido.)*

### A. Inicio (`/panel`)
**Técnico:** saludo "Hola, [nombre del local]", 4 indicadores (Beneficios activos, Beneficios totales, Canjes hoy, Miembros del mes), gráfico de canjes por día (últimos 7) y "Actividad" (las últimas validaciones, scrolleable, con "Ver todo").
**Simple:** El resumen del comercio: cuántas promos activas tiene, cuántos canjes hubo hoy y la actividad reciente.

### B. Validar (`/panel/validar`) — la pantalla más importante
**Técnico:** cámara en vivo para escanear el QR de la credencial + campo para ingresar el código a mano. El local elige el beneficio a aplicar (solo aparecen los que están activos y válidos ese día). Al escanear/ingresar el código, muestra la ficha del miembro (nombre, DNI, si está activo, y cuántos beneficios activos tiene) y un botón "Confirmar canje" que registra el canje.
**Simple:** Es donde el local valida al cliente: escanea el QR o tipea el código, ve quién es, y confirma el beneficio.

### C. Beneficios (`/panel/beneficios`)
**Técnico:** lista de los beneficios del propio local con filtros (activos/pausados). Puede crear, editar y eliminar sus propios beneficios (mismos campos que en el admin). A la derecha, vista previa de cómo se ve el beneficio en la app del socio.
**Simple:** El local carga y edita sus propias promociones, y ve en tiempo real cómo le van a aparecer al cliente.

### D. Stats (`/panel/estadisticas`)
**Técnico:** indicadores (Canjes del mes, Miembros únicos, Canjes por miembro, Últimos 7 días), gráfico de canjes por día, "Beneficio más canjeado" y selector de mes.
**Simple:** Cuántas veces usaron sus promos, cuántos clientes distintos y cuál es su beneficio estrella, mes a mes.

### E. Historial (`/panel/historial`) — se llega desde "Ver todo" en Inicio
**Técnico:** tabla con cada validación/canje: miembro (nombre + código), beneficio, estado (aplicado/rechazado/repetido) y fecha. Con botón "Volver".
**Simple:** El listado de todas las veces que alguien usó una promo del local.

### F. Mi Local (`/panel/mi-local`)
**Técnico:** muestra los datos del local (banner, logo, nombre, rubro, nº de local, descripción, horarios) y un botón "Editar" para modificar descripción, horarios, logo, banner, rubro y nombre. (No puede eliminarse a sí mismo.)
**Simple:** El comercio administra su propia ficha: descripción, horarios, logo y foto.

### Respuestas concretas (confirmado en el código)
- **¿Puede validar escaneando o ingresando un código?** → **SÍ, las dos formas**: cámara con lector de QR y también código escrito a mano.
- **¿Puede ver cuántos clientes usaron sus promos?** → **SÍ**: en Stats (canjes del mes, miembros únicos, beneficio más canjeado) y en el Historial (cada canje uno por uno).
- **¿Puede cargar o editar sus propios beneficios?** → **SÍ**, en la sección Beneficios.
- **¿Ve datos de sus clientes?** → **Parcialmente y solo al momento de validar**: ve el nombre y el DNI del socio (para chequear identidad) y su código, más la cantidad de beneficios activos. En el Historial ve nombre + código de quién canjeó. **No tiene una base de datos de clientes ni un CRM**: solo ve a los socios que interactuaron con él, y solo esos datos básicos.

**Qué está realmente implementado:** validar (QR + código + confirmar canje), estadísticas, ABM de beneficios propios, edición de la ficha del local, historial y actividad. Todo funcionando (los datos vienen del backend; la cámara necesita permiso y conexión segura, ya contemplado).

---

## 4) El paso a paso del local en el día a día

El flujo real, cuando llega un cliente con la credencial ClubPlaza:

1. El cliente muestra su credencial en el celular: un **código** (6 caracteres, ej. A7K2QM) y su **QR**.
2. El local abre en su celular/tablet/PC la pantalla **"Validar credencial"** de su panel ClubPlaza.
3. Elige de una lista **qué beneficio va a aplicar** (solo aparecen los suyos activos y válidos ese día).
4. **Escanea el QR con la cámara** o **tipea el código** que le dicta el cliente.
5. El sistema le muestra al **socio** (nombre y DNI para verificar identidad, si está activo, y cuántos beneficios tiene). El local chequea el DNI si quiere.
6. Toca **"Confirmar canje"** y listo: el beneficio queda registrado. La pantalla se reinicia sola para el próximo cliente.

**Puntos clave (confirmados en el código):**
- El local **NO tiene que cargar la venta ni el monto** en ClubPlaza. El sistema **no procesa el pago, no factura, no cobra**: solo confirma que el socio es válido y registra que usó ese beneficio (guarda socio + beneficio + local + fecha, sin importe).
- Es una pantalla web: **no hay que instalar nada**; se abre desde un navegador en cualquier dispositivo.
- Lo único **nuevo** que hace el local es ese paso de validar (abrir la pantalla, escanear/ingresar el código y confirmar) — son unos segundos.

**Sobre la frase "el local no cambia nada de cómo trabaja hoy, ClubPlaza solo se suma":**
- ✅ **Es verdad en lo esencial:** el local **sigue facturando y cobrando con su sistema de caja de siempre**. ClubPlaza no reemplaza nada de eso: no toca la venta, no maneja el dinero, no emite comprobantes.
- ⚠️ **La única precisión honesta:** sí se agrega **un paso extra** — validar la credencial en ClubPlaza (escanear/confirmar el beneficio). No es un cambio en cómo cobran, es una acción adicional y rápida antes o durante el cobro.
- **Conclusión:** con esa salvedad, la frase se sostiene: **ClubPlaza se suma como una capa de beneficios; el local no cambia su forma de facturar.**
