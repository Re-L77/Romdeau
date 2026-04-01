# Flujo de Negocio: Auditorías (Web → Móvil)

> Transcripción del diagrama de wireframes y lógica de negocio.

---

## Regla de Negocio Principal

> **Al crear una auditoría, se debe verificar que la oficina/estante NO tenga ya una auditoría activa asignada.**

---

## Flujo Web — Gestión de Auditorías Programadas

### Pantalla 1 — Lista de Auditorías

Vista principal tipo tabla/lista con todas las auditorías programadas.

- Cada fila muestra: título, auditor asignado, fecha, estado.
- Menú de acciones (`...`) por cada fila.
- **Filtros disponibles:** por estado, auditor, edificio, sede.
- **Botón:** "Crear Auditoría" (solo ADMIN).

```
┌─────────────────────────────┐
│  ···              + Crear   │
│ ┌─────────────────────────┐ │
│ │  Auditoría A  │ Estado  │ │
│ │  Auditoría B  │ Estado  │ │
│ │  Auditoría C  │ Estado  │ │
│ │  Auditoría D  │ Estado  │ │
│ └─────────────────────────┘ │
│  🏠  📊  👤                 │
└─────────────────────────────┘
        Pantalla 1
```

### Pantalla 2 — Ver Auditoría (Detalle Expandido)

Al hacer clic en una auditoría de la lista, se expande o navega a una vista con más información.

- Muestra información completa: título, descripción, auditor, ubicación (oficina/estante), fechas.
- Se visualizan los **logs de auditoría** asociados (activos ya auditados).
- **Timeline** del progreso de la auditoría.

```
┌─────────────────────────────┐
│  ← Auditoría A              │
│ ┌─────────────────────────┐ │
│ │  Título: ...            │ │
│ │  Auditor: ...           │ │
│ │  Ubicación: ...         │ │
│ │  Estado: Programada     │ │
│ │  Fecha: ...             │ │
│ │                         │ │
│ │  [Logs de auditoría]    │ │
│ │  ┌───┐ ┌───┐ ┌───┐     │ │
│ │  │ ✓ │ │ ✓ │ │ … │     │ │
│ │  └───┘ └───┘ └───┘     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
        Pantalla 2
```

### Pantalla 2-1 — Seleccionar Auditoría / Actualizar

Vista de detalle completo de la auditoría seleccionada, con acciones:

- **Conectar Auditoría** → Cambia estado a "En Proceso" o muestra las "Programadas".
- **Editar (Validando)** → Permite editar la auditoría mientras está en estado de validación.
- **Perfil del Ciudadano/Auditor** → Vista del perfil del auditor asignado (sub-pantalla 3-1).

```
┌─────────────────────────────┐
│  ← Detalle Auditoría        │
│                              │
│  📄 Información completa     │
│  ─────────────────────       │
│                              │
│  [Conectar Auditoría]  btn   │
│  (En proceso / Programadas)  │
│                              │
│  [Editar (Validando)]  btn   │
│                              │
│          → Perfil (3-1)      │
└─────────────────────────────┘
       Pantalla 2-1
```

---

## Flujo Móvil — Proceso de Auditoría Real (Ejecución en Campo)

### Pantalla 3 — Grilla de Activos a Auditar

El auditor en campo ve la lista/grilla de activos pendientes de auditar dentro de la auditoría seleccionada.

- Grilla o checklist de activos.
- Cada activo puede ser seleccionado para validar.
- **Acción:** Dar clic en un activo para **aceptar y validar que sea el correcto**.
- Icono de **ubicación GPS** 🌐 (se capturan coordenadas al auditar).

```
┌─────────────────────────────┐
│  ← Auditoría en Proceso     │
│ ┌───┬───┬───┬───┐           │
│ │ ☐ │ ☐ │ ☑ │ ☐ │           │
│ ├───┼───┼───┼───┤           │
│ │ ☑ │ ☐ │ ☐ │ ☑ │           │
│ ├───┼───┼───┼───┤           │
│ │ ☐ │ ☑ │ ☐ │ ☐ │           │
│ └───┴───┴───┴───┘           │
│            🌐                │
└─────────────────────────────┘
         Pantalla 3
```

### Pantalla 4 — Formulario de Registro (Submit)

Al seleccionar/validar un activo, se abre el formulario para registrar el log de auditoría.

- **Campos:**
  - Estado reportado del activo
  - Comentarios / observaciones
  - Coordenadas GPS (capturadas automáticamente)
  - Foto/evidencia (si aplica)
- **Botón:** Submit → Crea un `log_auditoria` vinculado a la auditoría programada.

```
┌─────────────────────────────┐
│  ← Registrar Auditoría      │
│                              │
│  Activo: [nombre/código]     │
│                              │
│  Estado: [  Seleccionar  ▼]  │
│                              │
│  Comentarios:                │
│  ┌─────────────────────┐     │
│  │                     │     │
│  └─────────────────────┘     │
│                              │
│  📍 GPS: -12.04, -77.02      │
│  📷 [Adjuntar foto]          │
│                              │
│  [ Enviar Registro ]   btn   │
└─────────────────────────────┘
         Pantalla 4
```

### Pantalla 3-1 — Perfil del Ciudadano/Auditor

Vista del perfil del auditor asignado a la auditoría.

- Nombre, rol, contacto.
- Historial de auditorías realizadas.

---

## Diagrama de Flujo Completo

```
WEB (Admin)                                    MÓVIL (Auditor)
───────────                                    ───────────────

┌──────────────┐
│ 1. Lista de  │
│  Auditorías  │
└──────┬───────┘
       │ clic en fila
       ▼
┌──────────────┐
│ 2. Detalle   │
│  Auditoría   │
│  (expandido) │
└──────┬───────┘
       │ "Conectar Auditoría"
       ▼
┌──────────────┐    Sincroniza    ┌──────────────────┐
│ 2-1. Acciones│ ──────────────►  │ 3. Grilla de     │
│  - Conectar  │    (estado →     │    activos a      │
│  - Editar    │    "En Proceso") │    auditar        │
│  - Perfil    │                  └────────┬─────────┘
└──────────────┘                           │ clic en activo
                                           │ + validar
                                           ▼
                                  ┌──────────────────┐
                                  │ 4. Formulario    │
                                  │    de registro   │
                                  │    (log)         │
                                  └────────┬─────────┘
                                           │ submit
                                           ▼
                                  ┌──────────────────┐
                                  │ log_auditoria    │
                                  │ creado en BD     │
                                  └──────────────────┘
```

---

## Estados de la Auditoría

| Estado      | ID  | Descripción                                      | Acciones permitidas              |
| ----------- | --- | ------------------------------------------------ | -------------------------------- |
| Programada  | 1   | Creada y asignada, pendiente de iniciar          | Editar, Conectar, Cancelar       |
| En Progreso | 2   | El auditor está ejecutando la auditoría en campo | Auditar activos, Completar       |
| Cancelada   | 3   | Auditoría cancelada por el admin                 | Ninguna                          |
| Completada  | 4   | Todos los activos fueron auditados               | Solo lectura                     |
| Vencida     | 5   | La fecha programada expiró sin completarse       | **Ninguna** (solo visualización) |

> **Nota:** Las auditorías **vencidas** son de solo lectura. No se puede realizar ninguna acción sobre ellas.

---

## Botones Principales

| Botón                  | Contexto           | Acción                                                  |
| ---------------------- | ------------------ | ------------------------------------------------------- |
| **Conectar Auditoría** | Web (Pantalla 2-1) | Cambia estado a "En Proceso" o filtra por "Programadas" |
| **Editar (Validando)** | Web (Pantalla 2-1) | Edita auditoría mientras se valida                      |
| **Submit Registro**    | Móvil (Pantalla 4) | Crea un `log_auditoria` para el activo                  |

---

## Validaciones Clave

1. **Al crear auditoría:** Verificar que la oficina/estante no tenga ya una auditoría activa (estado 1 o 2).
2. **Al auditar activo (móvil):** El auditor debe validar que el activo seleccionado sea el correcto (clic para aceptar).
3. **Coordenadas GPS:** Se capturan automáticamente al registrar un log en móvil.
4. **Transiciones de estado bloqueadas:** No se puede cambiar el estado de auditorías en estados terminales (Cancelada, Completada, Vencida).
5. **Estado "Vencida" es automático:** No se puede asignar manualmente vía API. Se asigna programáticamente cuando `fecha_programada` expira sin completarse.

---

## Sincronización con el Código

### Base de datos (`estados_auditoria_programada`)

Tabla Prisma: `estados_auditoria_programada` con `id` (SmallInt), `nombre`, `descripcion`.  
Seed: [prisma/seed_estado_vencida.sql](../backend/prisma/seed_estado_vencida.sql)

### Backend (NestJS)

- **Controller:** `PATCH /api/auditorias-programadas/:id/estado/:estado_id`
- **Validaciones en `updateStatus()`:**
  - Bloquea transición **a** estado 5 (Vencida) → `BadRequestException`
  - Bloquea transición **desde** estados 3, 4, 5 (terminales) → `BadRequestException`
  - Estado 2 → asigna `fecha_inicio`
  - Estados 3 o 4 → asigna `fecha_fin`

### Frontend (React)

- `ModuloAuditorias`: colores por nombre de estado (`getStateColor`)
- `ScheduledAudits`: colores por `estadoId` numérico (`getEstadoStyle`)

### Móvil (React Native / Expo)

- `AuditDetailScreen`: `estadoConfig` por ID numérico
- `AssetListScreen`: filtros y `getStatusConfig` por ID numérico
- `HomeScreen`: color y label inline por ID numérico

### Colores por estado (sincronizados)

| Estado      | ID  | Web (Tailwind) | Móvil (hex)           |
| ----------- | --- | -------------- | --------------------- |
| Programada  | 1   | `blue-*`       | `#1e40af` / `#2563eb` |
| En Progreso | 2   | `amber-*`      | `#d97706` / `#f59e0b` |
| Cancelada   | 3   | `red-*`        | `#dc2626` / `#ef4444` |
| Completada  | 4   | `emerald-*`    | `#047857` / `#10b981` |
| Vencida     | 5   | `orange-*`     | `#ea580c`             |
