# Contexto + To Do para usar con Copilot (Romdeau)

## 1) Objetivo de este documento

Este archivo sirve para que cualquier companero le pase a Copilot el contexto real del proyecto y un To Do concreto.
La idea es reducir ambiguedad y que la IA proponga cambios alineados con la arquitectura actual.

---

## 2) Estructura del repositorio

- `proyecto_integrador/backend`: API REST con NestJS + Prisma + Supabase Auth.
- `proyecto_integrador/frontend`: SPA en React + Vite.
- `proyecto_integrador/docs`: documentacion tecnica.

Documentacion clave ya existente:

- `proyecto_integrador/docs/guia-arquitectura-endpoints.md`

---

## 3) Stack tecnico actual

### Backend

- NestJS 11
- Prisma 7
- PostgreSQL (via Prisma datasource)
- Supabase (auth y storage)
- PNPM

Scripts utiles (`backend/package.json`):

- `pnpm run start:dev`
- `pnpm run build`
- `pnpm run test`
- `pnpm run test:e2e`
- `pnpm run lint`

### Frontend

- React 18
- Vite 6
- MUI + Radix UI + utilidades UI
- PNPM

Scripts utiles (`frontend/package.json`):

- `pnpm run dev`
- `pnpm run build`

---

## 4) Arranque rapido local

### Backend

```bash
cd proyecto_integrador/backend
pnpm install
pnpm run start:dev
```

### Frontend

```bash
cd proyecto_integrador/frontend
pnpm install
pnpm run dev
```

Valores por defecto esperados:

- API: `http://localhost:3000`
- Front: `http://localhost:5173`

---

## 5) Variables de entorno importantes

### Backend

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (recomendado)
- `PORT`
- `CORS_ORIGIN`

Nota: el backend valida que existan variables criticas al iniciar.

### Frontend

- `VITE_API_URL`

---

## 6) Arquitectura backend (resumen operativo)

Flujo base de request:

1. Controller recibe request.
2. Guard de auth valida token.
3. Guard de roles valida autorizacion.
4. Service aplica reglas de negocio.
5. PrismaService consulta DB.
6. Controller responde JSON.

Puntos importantes:

- En `AppModule` estan registrados guards globales (`SupabaseAuthGuard` y `RolesGuard`).
- Para endpoints publicos se usa decorador `@Public()`.
- Roles definidos: `ADMIN=1`, `AUDITOR=2`, `EMPLEADO=3`.
- CORS habilitado con `origin` configurable por `CORS_ORIGIN`.

Modulos actuales visibles:

- auth
- usuarios
- activos
- departamentos
- prisma

---

## 7) Arquitectura frontend (resumen operativo)

Piezas clave:

- `src/services/api.ts`:
  - Cliente HTTP centralizado.
  - Agrega `Authorization: Bearer` automaticamente.
  - Si hay 401 intenta refresh token y reintenta request.
- `src/contexts/AuthContext.tsx`:
  - Manejo de sesion global.
  - Login/logout.
  - Validacion al iniciar app.
  - Persistencia en localStorage.
- `src/app/App.tsx`:
  - Shell principal de vistas.
  - Control de navegacion interna.

Regla de integracion:

- El frontend consume backend con rutas que incluyen prefijo `/api`.

---

## 8) Estado de la base de datos (Prisma)

- El schema en `backend/prisma/schema.prisma` ya contiene muchas entidades de inventario/auditoria.
- Entidades centrales: `usuarios`, `activos`, `categorias`, `estados_activo`, `movimientos_activos`, `logs_auditoria`, etc.
- Hay comentarios de Prisma sobre row level security/check constraints en varias tablas.

Si se cambia schema:

```bash
cd proyecto_integrador/backend
pnpm prisma generate
pnpm prisma migrate dev --name nombre_del_cambio
```

---

## 9) Contratos API actuales (alto nivel)

Base paths relevantes:

- `/api/auth`
- `/api/usuarios`
- `/api/departamentos`
- `/api/activos`

Endpoints auth conocidos:

- login
- logout
- refresh-token
- forgot-password
- reset-password
- verify-token
- change-password
- validate-session

---

## 10) Convenciones para cambios

1. Mantener logica de negocio en services, no en controllers.
2. No romper contratos existentes sin avisar y documentar.
3. Si endpoint es protegido, validar roles correctamente.
4. Seleccionar campos explicitamente en Prisma cuando aplique.
5. Integrar manejo de errores util para frontend.
6. Si hay cambio de DB, incluir migracion.
7. Validar flujo end-to-end: UI -> API -> DB -> UI.

---

## 11) To Do para Copilot (rellenar antes de pegar)

Completa esta seccion con tu tarea real.

### To Do principal

- [ ] <Describe aqui la tarea principal>

### Alcance (incluir/excluir)

- Incluir:
  - <modulos, pantallas, endpoints a tocar>
- Excluir:
  - <lo que NO se debe tocar>

### Criterios de aceptacion

- [ ] <criterio 1 medible>
- [ ] <criterio 2 medible>
- [ ] <criterio 3 medible>

### Restricciones tecnicas

- [ ] Mantener arquitectura actual por capas
- [ ] No introducir librerias nuevas sin justificar
- [ ] Conservar contratos API existentes salvo necesidad explicita
- [ ] Agregar/actualizar pruebas si corresponde

### Archivos probables a tocar

- backend:
  - <ruta 1>
  - <ruta 2>
- frontend:
  - <ruta 1>
  - <ruta 2>

---

## 12) Prompt listo para pegar en Copilot

Copia y pega este bloque (ajustando los placeholders):

```md
Contexto del proyecto:

- Monorepo con backend NestJS + Prisma + Supabase y frontend React + Vite.
- Backend en `proyecto_integrador/backend`, frontend en `proyecto_integrador/frontend`.
- Seguir arquitectura actual (controller -> guards -> service -> prisma).
- Frontend usa cliente API centralizado con manejo de token/refresh en `src/services/api.ts` y `AuthContext.tsx`.
- Mantener compatibilidad con rutas `/api/*` existentes.

Tarea:
<PEGA AQUI TU TO DO PRINCIPAL>

Alcance:

- Incluir: <...>
- Excluir: <...>

Criterios de aceptacion:

1. <...>
2. <...>
3. <...>

Instrucciones de implementacion:

1. Analiza primero la arquitectura actual y los archivos relacionados.
2. Propone un plan corto y luego implementa.
3. Aplica cambios minimos y consistentes con el estilo del repo.
4. Si hay cambios de DB, genera migracion Prisma.
5. Verifica con comandos de build/test/lint que apliquen.
6. Entrega resumen final con archivos tocados, riesgos y pasos de validacion.
```

---

## 13) Checklist final antes de enviarlo al companero

- [ ] El To Do esta escrito en terminos concretos y medibles.
- [ ] Se definio claramente que entra y que no entra.
- [ ] Se listaron criterios de aceptacion.
- [ ] Se reviso que el prompt no contradiga la arquitectura del proyecto.
