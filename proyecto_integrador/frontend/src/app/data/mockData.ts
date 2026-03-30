// ==============================================================================
// DATOS MOCK PARA EL SISTEMA DE GESTIÓN DE ACTIVOS FIJOS - ROMDEAU
// Basado en esquema PostgreSQL con PostGIS y jerarquía corporativa ramificada
// ==============================================================================

import {
  Usuario,
  Categoria,
  Proveedor,
  Sede,
  Edificio,
  Piso,
  Oficina,
  Almacen,
  Pasillo,
  Estante,
  Activo,
  DatosFinancieros,
  LogAuditoria,
  MovimientoActivo,
  LogDepreciacion,
  Mantenimiento,
  BajaActivo,
  RolUsuario,
  EstadoActivo,
  EstadoAuditoria,
  TipoRastreo,
  EstadoTicket,
  MotivoBaja,
  Pais,
  EstadoRep,
  Municipio,
  Colonia,
  Calle,
  Direccion,
} from "./types";

// ==============================================================================
// JERARQUÍA GEOGRÁFICA (Esquema Snowflake)
// ==============================================================================

export const paises: Pais[] = [
  { id: 1, nombre: "México" },
  { id: 2, nombre: "Estados Unidos" },
];

export const estadosRep: EstadoRep[] = [
  { id: 1, nombre: "Ciudad de México", pais_id: 1 },
  { id: 2, nombre: "Jalisco", pais_id: 1 },
  { id: 3, nombre: "Nuevo León", pais_id: 1 },
];

export const municipios: Municipio[] = [
  { id: 1, nombre: "Benito Juárez", estado_id: 1 },
  { id: 2, nombre: "Guadalajara", estado_id: 2 },
  { id: 3, nombre: "Monterrey", estado_id: 3 },
];

export const colonias: Colonia[] = [
  {
    id: 1,
    nombre: "Crédito Constructor",
    codigo_postal: "03940",
    municipio_id: 1,
  },
  {
    id: 2,
    nombre: "San Pedro de los Pinos",
    codigo_postal: "03800",
    municipio_id: 1,
  },
  { id: 3, nombre: "Providencia", codigo_postal: "44630", municipio_id: 2 },
];

export const calles: Calle[] = [
  { id: 1, nombre: "Av. Insurgentes Sur", colonia_id: 1 },
  { id: 2, nombre: "Av. Revolución", colonia_id: 2 },
  { id: 3, nombre: "Av. Chapultepec", colonia_id: 3 },
];

export const direcciones: Direccion[] = [
  {
    id: "dir-001",
    numero_exterior: "1602",
    numero_interior: undefined,
    calle_id: 1,
  },
  {
    id: "dir-002",
    numero_exterior: "877",
    numero_interior: "Piso 5",
    calle_id: 2,
  },
  {
    id: "dir-003",
    numero_exterior: "450",
    numero_interior: undefined,
    calle_id: 3,
  },
];

// ==============================================================================
// JERARQUÍA CORPORATIVA - RAMA A: ADMINISTRATIVA
// ==============================================================================

export const sedes: Sede[] = [
  {
    id: "sede-001",
    nombre: "Sede Central Ciudad de México",
    direccion_id: "dir-001",
  },
  {
    id: "sede-002",
    nombre: "Sede Occidente Guadalajara",
    direccion_id: "dir-002",
  },
  {
    id: "sede-003",
    nombre: "Sede Norte Monterrey",
    direccion_id: "dir-003",
  },
];

export const edificios: Edificio[] = [
  { id: "edif-001", nombre: "Edificio Corporativo A", sede_id: "sede-001" },
  { id: "edif-002", nombre: "Edificio Tecnología B", sede_id: "sede-001" },
  { id: "edif-003", nombre: "Torre Administrativa", sede_id: "sede-002" },
  { id: "edif-004", nombre: "Centro de Operaciones", sede_id: "sede-003" },
];

export const pisos: Piso[] = [
  { id: "piso-001", nombre: "Planta Baja", edificio_id: "edif-001" },
  { id: "piso-002", nombre: "Piso 1", edificio_id: "edif-001" },
  { id: "piso-003", nombre: "Piso 2", edificio_id: "edif-001" },
  { id: "piso-004", nombre: "Piso 3", edificio_id: "edif-001" },
  { id: "piso-005", nombre: "Piso 1 - IT", edificio_id: "edif-002" },
  { id: "piso-006", nombre: "Piso 2 - IT", edificio_id: "edif-002" },
  { id: "piso-007", nombre: "Piso 1", edificio_id: "edif-003" },
];

export const oficinas: Oficina[] = [
  { id: "ofi-001", nombre: "Recepción", piso_id: "piso-001" },
  { id: "ofi-002", nombre: "Sala de Juntas Principal", piso_id: "piso-001" },
  { id: "ofi-003", nombre: "Recursos Humanos", piso_id: "piso-002" },
  { id: "ofi-004", nombre: "Finanzas y Contabilidad", piso_id: "piso-002" },
  { id: "ofi-005", nombre: "Dirección General", piso_id: "piso-003" },
  { id: "ofi-006", nombre: "Departamento Legal", piso_id: "piso-003" },
  { id: "ofi-007", nombre: "Desarrollo de Software", piso_id: "piso-005" },
  { id: "ofi-008", nombre: "Infraestructura IT", piso_id: "piso-005" },
  { id: "ofi-009", nombre: "Centro de Datos", piso_id: "piso-006" },
  { id: "ofi-010", nombre: "Operaciones Guadalajara", piso_id: "piso-007" },
];

// ==============================================================================
// JERARQUÍA CORPORATIVA - RAMA B: ALMACENAMIENTO
// ==============================================================================

export const almacenes: Almacen[] = [
  { id: "alm-001", nombre: "Almacén General", sede_id: "sede-001" },
  { id: "alm-002", nombre: "Bodega de Tecnología", sede_id: "sede-001" },
  { id: "alm-003", nombre: "Almacén de Refacciones", sede_id: "sede-002" },
];

export const pasillos: Pasillo[] = [
  { id: "pas-001", nombre: "Pasillo A", almacen_id: "alm-001" },
  { id: "pas-002", nombre: "Pasillo B", almacen_id: "alm-001" },
  { id: "pas-003", nombre: "Pasillo IT-1", almacen_id: "alm-002" },
  { id: "pas-004", nombre: "Pasillo IT-2", almacen_id: "alm-002" },
];

export const estantes: Estante[] = [
  { id: "est-001", nombre: "Estante A1 - Nivel 1", pasillo_id: "pas-001" },
  { id: "est-002", nombre: "Estante A1 - Nivel 2", pasillo_id: "pas-001" },
  { id: "est-003", nombre: "Estante A2 - Nivel 1", pasillo_id: "pas-001" },
  { id: "est-004", nombre: "Rack IT-1", pasillo_id: "pas-003" },
  { id: "est-005", nombre: "Rack IT-2", pasillo_id: "pas-003" },
  { id: "est-006", nombre: "Rack Servidores", pasillo_id: "pas-004" },
];

// ==============================================================================
// CATÁLOGOS DEL DOMINIO
// ==============================================================================

export const categorias: Categoria[] = [
  {
    id: "cat-001",
    nombre: "Equipos de Cómputo",
    tipo_rastreo: TipoRastreo.MOVIL,
    vida_util_anios: 5,
    porcentaje_depreciacion: 20,
  },
  {
    id: "cat-002",
    nombre: "Mobiliario de Oficina",
    tipo_rastreo: TipoRastreo.FIJO,
    vida_util_anios: 10,
    porcentaje_depreciacion: 10,
  },
  {
    id: "cat-003",
    nombre: "Vehículos",
    tipo_rastreo: TipoRastreo.MOVIL,
    vida_util_anios: 8,
    porcentaje_depreciacion: 12.5,
  },
  {
    id: "cat-004",
    nombre: "Servidores y Equipos de Red",
    tipo_rastreo: TipoRastreo.FIJO,
    vida_util_anios: 5,
    porcentaje_depreciacion: 20,
  },
  {
    id: "cat-005",
    nombre: "Equipos de Audio/Video",
    tipo_rastreo: TipoRastreo.MOVIL,
    vida_util_anios: 7,
    porcentaje_depreciacion: 14.29,
  },
  {
    id: "cat-006",
    nombre: "Herramientas y Maquinaria",
    tipo_rastreo: TipoRastreo.FIJO,
    vida_util_anios: 15,
    porcentaje_depreciacion: 6.67,
  },
];

export const proveedores: Proveedor[] = [
  {
    id: "prov-001",
    razon_social: "Apple Inc.",
    rfc_tax_id: "APL850101XXX",
    contacto_soporte: "soporte@apple.com.mx",
    direccion_fiscal: "Av. Santa Fe 495, Col. Cruz Manca, Cuajimalpa, CDMX",
    sitio_web: "https://www.apple.com",
    email: "enterprise@apple.com",
    telefono_emergencia: "800-692-7753",
  },
  {
    id: "prov-002",
    razon_social: "Dell Technologies México",
    rfc_tax_id: "DEL900202YYY",
    contacto_soporte: "enterprise-support@dell.com.mx",
    direccion_fiscal:
      "Blvd. Manuel Ávila Camacho 36, Lomas de Chapultepec, CDMX",
    sitio_web: "https://www.dell.com.mx",
    email: "ventas@dell.com.mx",
    telefono_emergencia: "800-288-3355",
  },
  {
    id: "prov-003",
    razon_social: "Oficina Depot de México",
    rfc_tax_id: "OFD950303ZZZ",
    contacto_soporte: "servicio@officedepot.com.mx",
    direccion_fiscal: "Av. Ejército Nacional 769, Granada, CDMX",
    telefono_emergencia: "800-112-2222",
  },
  {
    id: "prov-004",
    razon_social: "Cisco Systems México",
    rfc_tax_id: "CIS880404AAA",
    contacto_soporte: "tac@cisco.com",
    direccion_fiscal: "Paseo de la Reforma 505, Cuauhtémoc, CDMX",
    sitio_web: "https://www.cisco.com",
    telefono_emergencia: "800-553-2447",
  },
];

export const usuarios: Usuario[] = [
  {
    id: "usr-001",
    nombre_completo: "Carlos Mendoza",
    email: "carlos.mendoza@romdeau.com",
    rol_id: RolUsuario.EMPLEADO,
    activo: true,
    created_at: "2024-01-10T08:00:00Z",
    avatar: "CM",
    departamento: "Desarrollo de Software",
    telefono: "+52 55 1234 5678",
  },
  {
    id: "usr-002",
    nombre_completo: "Ana García",
    email: "ana.garcia@romdeau.com",
    rol_id: RolUsuario.ADMIN,
    activo: true,
    created_at: "2023-06-15T09:00:00Z",
    avatar: "AG",
    departamento: "Recursos Humanos",
    telefono: "+52 55 2345 6789",
  },
  {
    id: "usr-003",
    nombre_completo: "Roberto Sánchez",
    email: "roberto.sanchez@romdeau.com",
    rol_id: RolUsuario.AUDITOR,
    activo: true,
    created_at: "2023-09-01T10:00:00Z",
    avatar: "RS",
    departamento: "Auditoría Interna",
    telefono: "+52 55 3456 7890",
  },
  {
    id: "usr-004",
    nombre_completo: "María López",
    email: "maria.lopez@romdeau.com",
    rol_id: RolUsuario.ADMIN,
    activo: true,
    created_at: "2022-01-01T08:00:00Z",
    avatar: "ML",
    departamento: "Dirección General",
    telefono: "+52 55 4567 8901",
  },
  {
    id: "usr-005",
    nombre_completo: "Jorge Pérez",
    email: "jorge.perez@romdeau.com",
    rol_id: RolUsuario.AUDITOR,
    activo: true,
    created_at: "2024-03-15T11:00:00Z",
    avatar: "JP",
    departamento: "Auditoría Interna",
    telefono: "+52 55 5678 9012",
  },
];

// ==============================================================================
// ACTIVOS CON UBICACIÓN EXCLUSIVA (Oficina O Estante)
// ==============================================================================

export const activos: Activo[] = [
  {
    id: "act-001",
    codigo_etiqueta: "QR-2024-001-MAC",
    categoria_id: "cat-001",
    custodio_actual_id: "usr-001",
    especificaciones: {
      marca: "Apple",
      modelo: 'MacBook Pro 16"',
      procesador: "Apple M3 Max",
      ram: "32GB",
      almacenamiento: "1TB SSD",
      serial: "C02ZK3YJMD6R",
    },
    estado_operativo_id: EstadoActivo.BUENO,
    foto_principal_url:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca4",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2026-02-20T15:30:00Z",
    oficina_id: "ofi-007",
    estante_id: undefined,
    nombre: 'MacBook Pro 16" M3',
  },
  {
    id: "act-002",
    codigo_etiqueta: "QR-2023-045-DELL",
    categoria_id: "cat-004",
    custodio_actual_id: "usr-001",
    especificaciones: {
      marca: "Dell",
      modelo: "PowerEdge R750",
      procesador: "Intel Xeon Gold 6338",
      ram: "128GB",
      almacenamiento: "8TB SSD RAID",
      serial: "SRV2023XYZ789",
    },
    estado_operativo_id: EstadoActivo.BUENO,
    created_at: "2023-08-10T09:00:00Z",
    updated_at: "2026-02-15T11:20:00Z",
    oficina_id: undefined,
    estante_id: "est-006",
    nombre: "Servidor Dell PowerEdge R750",
  },
  {
    id: "act-003",
    codigo_etiqueta: "QR-2024-012-DESK",
    categoria_id: "cat-002",
    custodio_actual_id: "usr-002",
    especificaciones: {
      tipo: "Escritorio Ejecutivo",
      material: "Madera de Nogal",
      dimensiones: "180cm x 90cm x 75cm",
      color: "Nogal Oscuro",
    },
    estado_operativo_id: EstadoActivo.BUENO,
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z",
    oficina_id: "ofi-005",
    estante_id: undefined,
    nombre: "Escritorio Ejecutivo Nogal",
  },
  {
    id: "act-004",
    codigo_etiqueta: "QR-2023-089-CISCO",
    categoria_id: "cat-004",
    custodio_actual_id: "usr-001",
    especificaciones: {
      marca: "Cisco",
      modelo: "Catalyst 9300",
      puertos: "48-Port",
      tipo: "Switch L3",
      serial: "FCW2145G0K8",
    },
    estado_operativo_id: EstadoActivo.MALO,
    created_at: "2023-11-20T14:00:00Z",
    updated_at: "2026-02-24T09:15:00Z",
    oficina_id: undefined,
    estante_id: "est-004",
    nombre: "Switch Cisco Catalyst 9300",
  },
  {
    id: "act-005",
    codigo_etiqueta: "QR-2024-003-IPAD",
    categoria_id: "cat-001",
    custodio_actual_id: "usr-003",
    especificaciones: {
      marca: "Apple",
      modelo: 'iPad Pro 12.9"',
      generacion: "6ta Gen",
      almacenamiento: "256GB",
      color: "Space Gray",
      serial: "DMPH3456789",
    },
    estado_operativo_id: EstadoActivo.BUENO,
    created_at: "2024-01-20T11:00:00Z",
    updated_at: "2024-01-20T11:00:00Z",
    oficina_id: "ofi-003",
    estante_id: undefined,
    nombre: 'iPad Pro 12.9"',
  },
  {
    id: "act-006",
    codigo_etiqueta: "QR-2022-156-CHAIR",
    categoria_id: "cat-002",
    custodio_actual_id: "usr-004",
    especificaciones: {
      tipo: "Silla Ergonómica",
      marca: "Herman Miller",
      modelo: "Aeron",
      color: "Negro",
    },
    estado_operativo_id: EstadoActivo.BAJA,
    created_at: "2022-05-10T10:00:00Z",
    updated_at: "2026-01-15T14:30:00Z",
    oficina_id: "ofi-005",
    estante_id: undefined,
    nombre: "Silla Ergonómica Herman Miller Aeron",
  },
];

// ==============================================================================
// DATOS FINANCIEROS
// ==============================================================================

export const datosFinancieros: DatosFinancieros[] = [
  {
    activo_id: "act-001",
    proveedor_id: "prov-001",
    costo_adquisicion: 3499.0,
    valor_libro_actual: 2799.2,
    fecha_compra: "2024-01-15",
    fin_garantia: "2027-01-15",
  },
  {
    activo_id: "act-002",
    proveedor_id: "prov-002",
    costo_adquisicion: 12500.0,
    valor_libro_actual: 8750.0,
    fecha_compra: "2023-08-10",
    fin_garantia: "2026-08-10",
  },
  {
    activo_id: "act-003",
    proveedor_id: "prov-003",
    costo_adquisicion: 1850.0,
    valor_libro_actual: 1665.0,
    fecha_compra: "2024-02-01",
    fin_garantia: "2029-02-01",
  },
  {
    activo_id: "act-004",
    proveedor_id: "prov-004",
    costo_adquisicion: 8900.0,
    valor_libro_actual: 5340.0,
    fecha_compra: "2023-11-20",
    fin_garantia: "2026-11-20",
  },
  {
    activo_id: "act-005",
    proveedor_id: "prov-001",
    costo_adquisicion: 1299.0,
    valor_libro_actual: 1039.2,
    fecha_compra: "2024-01-20",
    fin_garantia: "2025-01-20",
  },
  {
    activo_id: "act-006",
    proveedor_id: "prov-003",
    costo_adquisicion: 1200.0,
    valor_libro_actual: 0.0,
    fecha_compra: "2022-05-10",
    fin_garantia: "2027-05-10",
  },
];

// ==============================================================================
// LOGS DE AUDITORÍA
// ==============================================================================

export const logsAuditoria: LogAuditoria[] = [
  {
    id: "log-001",
    activo_id: "act-001",
    auditor_id: "usr-003",
    fecha_hora: "2026-02-23T14:30:00Z",
    coordenadas_gps: { latitude: 19.3687, longitude: -99.1699 },
    estado_reportado_id: EstadoAuditoria.BUENO,
    comentarios:
      "Activo verificado en perfectas condiciones, ubicación correcta.",
  },
  {
    id: "log-002",
    activo_id: "act-002",
    auditor_id: "usr-003",
    fecha_hora: "2026-02-22T10:15:00Z",
    coordenadas_gps: { latitude: 19.3687, longitude: -99.1699 },
    estado_reportado_id: EstadoAuditoria.BUENO,
    comentarios: "Servidor operando normalmente en centro de datos.",
  },
  {
    id: "log-003",
    activo_id: "act-004",
    auditor_id: "usr-003",
    fecha_hora: "2026-02-24T09:15:00Z",
    estado_reportado_id: EstadoAuditoria.DANADO,
    comentarios: "Puerto 12 dañado, requiere servicio técnico.",
  },
  {
    id: "log-004",
    activo_id: "act-005",
    auditor_id: "usr-005",
    fecha_hora: "2026-02-25T16:45:00Z",
    coordenadas_gps: { latitude: 19.369, longitude: -99.1702 },
    estado_reportado_id: EstadoAuditoria.BUENO,
    comentarios: "iPad en buen estado, batería al 95%.",
  },
];

// ==============================================================================
// MOVIMIENTOS DE ACTIVOS
// ==============================================================================

export const movimientosActivos: MovimientoActivo[] = [
  {
    id: "mov-001",
    activo_id: "act-001",
    custodio_anterior_id: "usr-002",
    oficina_anterior_id: "ofi-003",
    custodio_nuevo_id: "usr-001",
    oficina_nueva_id: "ofi-007",
    fecha_movimiento: "2026-02-10T09:15:00Z",
  },
  {
    id: "mov-002",
    activo_id: "act-003",
    oficina_anterior_id: "ofi-002",
    oficina_nueva_id: "ofi-005",
    custodio_nuevo_id: "usr-004",
    fecha_movimiento: "2024-02-01T08:00:00Z",
  },
];

// ==============================================================================
// LOGS DE DEPRECIACIÓN
// ==============================================================================

export const logsDepreciacion: LogDepreciacion[] = [
  {
    id: "dep-001",
    activo_id: "act-001",
    fecha_calculo: "2025-01-15",
    valor_anterior: 3499.0,
    monto_depreciado: 699.8,
    valor_nuevo: 2799.2,
    metodo_usado: "LINEA_RECTA",
  },
  {
    id: "dep-002",
    activo_id: "act-002",
    fecha_calculo: "2025-08-10",
    valor_anterior: 12500.0,
    monto_depreciado: 2500.0,
    valor_nuevo: 10000.0,
    metodo_usado: "LINEA_RECTA",
  },
];

// ==============================================================================
// MANTENIMIENTOS
// ==============================================================================

export const mantenimientos: Mantenimiento[] = [
  {
    id: "mant-001",
    activo_id: "act-004",
    solicitante_id: "usr-001",
    tecnico_asignado: "Juan Pérez - Cisco Certified",
    descripcion_falla: "Puerto 12 no responde, requiere diagnóstico",
    costo_reparacion: 450.0,
    estado_ticket: EstadoTicket.EN_PROGRESO,
    fecha_solicitud: "2026-02-24T10:00:00Z",
    fecha_resolucion: undefined,
  },
  {
    id: "mant-002",
    activo_id: "act-001",
    solicitante_id: "usr-001",
    tecnico_asignado: "Apple Genius Bar",
    descripcion_falla: "Batería se descarga rápidamente",
    costo_reparacion: 0.0,
    estado_ticket: EstadoTicket.RESUELTO,
    fecha_solicitud: "2025-06-15T11:30:00Z",
    fecha_resolucion: "2025-06-20T16:00:00Z",
  },
];

// ==============================================================================
// BAJAS DE ACTIVOS
// ==============================================================================

export const bajasActivos: BajaActivo[] = [
  {
    activo_id: "act-006",
    usuario_autoriza_id: "usr-004",
    motivo_baja: MotivoBaja.OBSOLESCENCIA,
    fecha_baja: "2026-01-15",
    monto_recuperado: 150.0,
    documento_respaldo_url:
      "https://docs.romdeau.com/bajas/2026/act-006-baja.pdf",
    comentarios: "Silla con desgaste severo después de 4 años de uso intensivo",
    created_at: "2026-01-15T14:30:00Z",
  },
];

// ==============================================================================
// FUNCIONES HELPER PARA CONSTRUIR UBICACIONES COMPLETAS
// ==============================================================================

export function getUbicacionCompleta(activo: Activo): string {
  if (activo.oficina_id) {
    const oficina = oficinas.find((o) => o.id === activo.oficina_id);
    if (!oficina) return "Ubicación no especificada";

    const piso = pisos.find((p) => p.id === oficina.piso_id);
    const edificio = edificios.find((e) => e.id === piso?.edificio_id);
    const sede = sedes.find((s) => s.id === edificio?.sede_id);

    return `${sede?.nombre} → ${edificio?.nombre} → ${piso?.nombre} → ${oficina.nombre}`;
  } else if (activo.estante_id) {
    const estante = estantes.find((e) => e.id === activo.estante_id);
    if (!estante) return "Ubicación no especificada";

    const pasillo = pasillos.find((p) => p.id === estante.pasillo_id);
    const almacen = almacenes.find((a) => a.id === pasillo?.almacen_id);
    const sede = sedes.find((s) => s.id === almacen?.sede_id);

    return `${sede?.nombre} → ${almacen?.nombre} → ${pasillo?.nombre} → ${estante.nombre}`;
  }

  return "Sin ubicación asignada";
}

export function getDiasHastaVencimientoGarantia(
  activoId: string,
): number | null {
  const datos = datosFinancieros.find((d) => d.activo_id === activoId);
  if (!datos?.fin_garantia) return null;

  const hoy = new Date();
  const vencimiento = new Date(datos.fin_garantia);
  const diferencia = vencimiento.getTime() - hoy.getTime();

  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

export function calcularDepreciacionAcumulada(activoId: string): number {
  const activo = activos.find((a) => a.id === activoId);
  const datos = datosFinancieros.find((d) => d.activo_id === activoId);

  if (!activo || !datos) return 0;

  return datos.costo_adquisicion - datos.valor_libro_actual;
}

// ==============================================================================
// EXPORTS CONSOLIDADOS
// ==============================================================================

export const mockDB = {
  // Jerarquía Geográfica
  paises,
  estadosRep,
  municipios,
  colonias,
  calles,
  direcciones,

  // Jerarquía Corporativa
  sedes,
  edificios,
  pisos,
  oficinas,
  almacenes,
  pasillos,
  estantes,

  // Catálogos
  categorias,
  proveedores,
  usuarios,

  // Dominio Principal
  activos,
  datosFinancieros,
  logsAuditoria,
  movimientosActivos,

  // Módulos de Expansión
  logsDepreciacion,
  mantenimientos,
  bajasActivos,

  // Helpers
  getUbicacionCompleta,
  getDiasHastaVencimientoGarantia,
  calcularDepreciacionAcumulada,
};
