# Romdeau

<p align="center">
  <img src="proyecto_integrador/docs/images/banner.svg" alt="Romdeau Banner" width="100%" />
</p>

<p align="center">
  Plataforma inteligente para gestionar activos, ejecutar auditorías y tomar decisiones con trazabilidad real.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/backend-NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="Backend NestJS" />
  <img src="https://img.shields.io/badge/frontend-React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="Frontend React" />
  <img src="https://img.shields.io/badge/mobile-Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Mobile Expo" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Database PostgreSQL" />
</p>

## La idea

Romdeau unifica operación, control y analítica en un solo ecosistema. El objetivo es simple: menos fricción en campo, mejor visibilidad para equipos administrativos y decisiones respaldadas por datos.

- Web para gestión administrativa y analítica.
- App móvil para ejecución de auditorías en terreno.
- API central para reglas de negocio, seguridad y trazabilidad.

### Datos y servicios clave

- Prisma: ORM principal del backend para modelado, consultas y migraciones sobre PostgreSQL.
- Supabase: usado para autenticación y capacidades en tiempo real/almacenamiento en clientes y flujos de evidencia.

## Por qué destaca

| Pilar | Valor |
|---|---|
| Operación conectada | Equipos de oficina y campo trabajan sobre la misma información. |
| Trazabilidad | Cambios, eventos y auditorías quedan registrados de forma consistente. |
| Escalabilidad | Arquitectura modular para crecer por dominios sin perder orden. |

## Recorrido del usuario

1. El equipo crea o actualiza activos desde web.
2. La app móvil ejecuta auditorías y registra evidencia.
3. El backend consolida datos y reglas de negocio.
4. El dashboard muestra estado, alertas y hallazgos accionables.

## Demo visual

> Reemplaza estas rutas por capturas reales del proyecto.

| Vista | Modo Claro | Modo Oscuro |
|---|---|---|
| Dashboard web | ![Dashboard web - placeholder](proyecto_integrador/docs/images/web-dashboard-placeholder.png) | ![Dashboard web dark - placeholder](proyecto_integrador/docs/images/web-dashboard-placeholder-dark.png) |
| App móvil | <img src="proyecto_integrador/docs/images/mobile-home-placeholder.png" alt="App móvil - placeholder" width="300" /> | <img src="proyecto_integrador/docs/images/mobile-home-placeholder-dark.png" alt="App móvil dark - placeholder" width="300" /> |
| Activos | ![Activos - placeholder](proyecto_integrador/docs/images/activos-placeholder.png) | ![Activos dark - placeholder](proyecto_integrador/docs/images/activos-placeholder-dark.png) |
| Auditorías | ![Auditorías - placeholder](proyecto_integrador/docs/images/auditorias-placeholder.png) | ![Auditorías dark - placeholder](proyecto_integrador/docs/images/auditorias-placeholder-dark.png) |
## Tabla de contenido

- [La idea](#la-idea)
- [Por qué destaca](#por-qué-destaca)
- [Recorrido del usuario](#recorrido-del-usuario)
- [Datos y servicios clave](#datos-y-servicios-clave)
- [Arquitectura rápida](#arquitectura-rápida)
- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Requisitos previos](#requisitos-previos)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Scripts útiles](#scripts-útiles)
- [Pruebas](#pruebas)
- [Documentación](#documentación)

## Arquitectura rápida

```mermaid
flowchart LR
  W[Portal Web React] --> API[NestJS API]
  M[App móvil Expo] --> API
  W --> SB[Supabase Auth/Realtime/Storage]
  M --> SB
  API --> DB[(PostgreSQL)]
  API --> PR[Prisma ORM]
  API --> ST[Storage / Servicios externos]
  API --> AN[Analítica y reportes]
```

## Inicio rápido visual

| Paso | Comando |
|---|---|
| 1. Backend | `cd proyecto_integrador/backend && pnpm install && pnpm run start:dev` |
| 2. Frontend | `cd proyecto_integrador/frontend && pnpm install && pnpm run dev` |
| 3. App móvil | `cd proyecto_integrador/mobile && pnpm install && pnpm run start` |

## Tecnologías

| Capa | Stack |
|---|---|
| API backend | NestJS, Prisma, PostgreSQL, Jest |
| Frontend web | React, Vite, Tailwind, Vitest |
| App móvil | React Native, Expo |
| Datos y servicios | Prisma ORM, Supabase (Auth, Realtime, Storage) |

## Estructura

```text
Romdeau/
  proyecto_integrador/
    backend/      # API NestJS + Prisma
    frontend/     # Aplicación web React + Vite
    mobile/       # Aplicación móvil React Native + Expo
    docs/         # Documentación del proyecto
```

## Requisitos previos

- Node.js 20+ recomendado.
- pnpm instalado globalmente.
- Base de datos PostgreSQL para backend.
- Expo CLI/EAS CLI (opcional para flujo móvil avanzado).

## Inicio rápido

### 1) Clonar repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Romdeau
```

### 2) Levantar backend

```bash
cd proyecto_integrador/backend
pnpm install
pnpm run start:dev
```

API local esperada: `http://localhost:3000`.

### 3) Levantar frontend

```bash
cd proyecto_integrador/frontend
pnpm install
pnpm run dev
```

Web local esperada: `http://localhost:5173`.

### 4) Levantar app móvil

```bash
cd proyecto_integrador/mobile
pnpm install
pnpm run start
```

Desde Expo puedes abrir Android, iOS o web.

## Variables de entorno

Cada módulo puede requerir su propio `.env`.

### Backend: `proyecto_integrador/backend/.env`

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/romdeau
PORT=3000
NODE_ENV=development
```

### Frontend: `proyecto_integrador/frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

### App móvil: `proyecto_integrador/mobile/.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://<TU_IP_LOCAL>:3000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_AUDIT_EVIDENCE_BUCKET=evidencias_auditoria
```

## Scripts útiles

<details>
<summary><strong>Backend</strong></summary>

- `pnpm run start:dev` inicia API en desarrollo.
- `pnpm run build` compila la API.
- `pnpm run lint` ejecuta lint y fix.
- `pnpm run test` ejecuta unit tests.
- `pnpm run test:e2e` ejecuta pruebas E2E.

</details>

<details>
<summary><strong>Frontend</strong></summary>

- `pnpm run dev` inicia Vite.
- `pnpm run build` genera build de producción.
- `pnpm run test` ejecuta pruebas con Vitest.

</details>

<details>
<summary><strong>App móvil</strong></summary>

- `pnpm run start` inicia Expo.
- `pnpm run android` abre Android.
- `pnpm run ios` abre iOS.
- `pnpm run web` abre modo web.

</details>

## Pruebas

```bash
# Backend
cd proyecto_integrador/backend
pnpm run test

# Frontend
cd ../frontend
pnpm run test
```

## Documentación

- Arquitectura y endpoints:
  - `proyecto_integrador/docs/guia-arquitectura-endpoints.md`
- Flujo de auditorías web/móvil:
  - `proyecto_integrador/docs/flujo-auditorias-web-movil.md`
