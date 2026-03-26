# Auditorías Programadas API

## Descripción

Módulo para gestionar auditorías programadas con control de estados.

## Estados disponibles:

1. **Recién programada** - Auditoría creada pero aún no iniciada
2. **En progreso** - Auditoría en curso
3. **Pausada** - Auditoría pausada temporalmente
4. **Terminada** - Auditoría completada exitosamente
5. **Cancelada** - Auditoría cancelada

## Endpoints

### Crear auditoría

```
POST /api/auditorias-programadas
```

Body:

```json
{
  "titulo": "Auditoría de Almacén A",
  "descripcion": "Auditoría general del almacén",
  "fecha_programada": "2024-04-15T10:00:00Z",
  "auditor_id": "uuid-del-auditor",
  "oficina_id": "uuid-opcional",
  "estante_id": "uuid-opcional"
}
```

### Listar todas las auditorías

```
GET /api/auditorias-programadas
```

### Obtener auditoría por ID

```
GET /api/auditorias-programadas/:id
```

### Filtrar auditorías por estado

```
GET /api/auditorias-programadas/por-estado/:estado_id
```

### Obtener todos los estados disponibles

```
GET /api/auditorias-programadas/estados
```

### Actualizar auditoría

```
PATCH /api/auditorias-programadas/:id
```

### Cambiar estado de auditoría

```
PATCH /api/auditorias-programadas/:id/estado/:estado_id
```

Automáticamente:

- Al pasar a "En progreso" (2): registra `fecha_inicio`
- Al pasar a "Terminada" (4) o "Cancelada" (5): registra `fecha_fin`

### Eliminar auditoría

```
DELETE /api/auditorias-programadas/:id
```

## Permisos

- **POST, PATCH, DELETE**: Requiere rol ADMIN
- **GET**: Requiere rol ADMIN o AUDITOR
- **PATCH estado**: Requiere rol ADMIN o AUDITOR

## Variables de Prisma

- `fecha_programada`: Cuándo está programada la auditoría
- `fecha_inicio`: Cuándo comienza (se registra al pasar a "En progreso")
- `fecha_fin`: Cuándo termina (se registra al pasar a terminada/cancelada)
- `estado_id`: ID del estado actual
- `auditor_id`: ID del usuario auditor
- `oficina_id`: Ubicación opcional (oficina)
- `estante_id`: Ubicación opcional (estante)
