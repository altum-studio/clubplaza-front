# 🐞 Bug backend — `GET /api/usuarios` devuelve 500

## Qué pasa
`GET /api/usuarios` está devolviendo **HTTP 500** con:

```json
{ "error": "No se pudieron obtener los usuarios" }
```

Antes funcionaba. Rompió después de un deploy reciente del backend.

## Cómo lo verifiqué
- **Sin token:** responde `401 { "error": "Token de autenticación requerido" }` → o sea, la ruta y el auth **funcionan**.
- **Con token de admin** (desde el panel): responde **500** con el mensaje de arriba → **la query de usuarios está lanzando una excepción** y cae en el catch.
- No es límite ni paginación: probé `?limit=5`, `?limit=200`, `?limit=1000` — todos fallan igual.

## Causa más probable
El endpoint se rompió al **empezar el cambio de multi-local** (ver `backend-spec-multi-local.md`). Lo más probable:
- Se agregó un **join a `local_managers`** (o el cálculo de `local_ids`) en la query de usuarios, pero **la tabla `local_managers` todavía no existe** (o la query quedó a medias) → la consulta falla → 500.

## Qué revisar
1. Los **logs del backend** en el request a `GET /api/usuarios` (el stack de la excepción dice exactamente qué falla).
2. La **query del listado de usuarios**: si agregaste un join/subquery a `local_managers` o para armar `local_ids`, confirmá que:
   - la tabla `local_managers` exista (corriste la migración), y
   - el join no rompa cuando un usuario **no** tiene filas en esa tabla (usar LEFT JOIN / agrupar bien).
3. Que el endpoint siga devolviendo el shape de siempre: `{ "data": Usuario[], "count": number }`.

## También rompe el REGISTRO (mismo origen)
`POST /api/auth/register` falla con:

```json
{ "error": "No se pudo crear el perfil del usuario" }
```

Esto pasa **con cualquier email nuevo** (no es un mail puntual). El backend crea el usuario de **auth** pero **no puede insertar el perfil en la tabla `usuarios`** → mismo problema que el listado. 

⚠️ **Ojo con los usuarios "huérfanos":** como el auth SÍ se crea pero el perfil NO, esos emails pueden quedar registrados en Supabase Auth **sin** fila en `usuarios`. Al arreglar el back, conviene **limpiar los auth users huérfanos** (o vas a tener mails que dicen "ya registrado" pero sin perfil).

## Impacto en la app
- **Registro (app socio):** nadie puede crear cuenta ("No se pudo crear el perfil del usuario").
- **Panel Admin → Usuarios:** no puede listar usuarios ("No se pudieron obtener los usuarios").
- **Panel Admin → Dashboard:** "Miembros totales" y "Altas de miembros" salen vacíos (se calculan de este endpoint).

> El front ya es resiliente: el dashboard no se cae aunque este endpoint falle, pero **no puede mostrar usuarios ni altas hasta que `GET /api/usuarios` vuelva a responder 200**.

## Cómo confirmar que quedó arreglado
`GET /api/usuarios` (con token admin) debe responder **200** con `{ data: [...], count: N }`.
