// ==============================================================================
// TIPOS PARA EL SISTEMA DE GESTIÓN DE ACTIVOS FIJOS - ROMDEAU
// Basado en esquema PostgreSQL con PostGIS y jerarquía corporativa ramificada
// ==============================================================================

// ==============================================================================
// 1. CATÁLOGOS Y ENUMERACIONES
// ==============================================================================

export enum RolUsuario {
  ADMIN = 1,
  AUDITOR = 2,
  EMPLEADO = 3
}

export enum EstadoActivo {
  NUEVO = 1,
  BUENO = 2,
  MALO = 3,
  BAJA = 4
}

export enum EstadoAuditoria {
  BUENO = 1,
  DANADO = 2,
  NO_ENCONTRADO = 3
}

export enum TipoRastreo {
  FIJO = 'FIJO',
  MOVIL = 'MOVIL'
}

export enum TipoAlerta {
  VENCIMIENTO_GARANTIA = 'VENCIMIENTO_GARANTIA',
  MANTENIMIENTO_PREVENTIVO = 'MANTENIMIENTO_PREVENTIVO',
  DEPRECIACION_CERO = 'DEPRECIACION_CERO'
}

export enum EstadoTicket {
  ABIERTO = 'ABIERTO',
  EN_PROGRESO = 'EN_PROGRESO',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO'
}

export enum MotivoBaja {
  OBSOLESCENCIA = 'OBSOLESCENCIA',
  DAÑO_IRREPARABLE = 'DAÑO_IRREPARABLE',
  ROBO_EXTRAVIO = 'ROBO_EXTRAVIO',
  VENTA = 'VENTA',
  DONACION = 'DONACION'
}

// ==============================================================================
// 2. JERARQUÍA GEOGRÁFICA (Esquema Snowflake)
// ==============================================================================

export interface Pais {
  id: number;
  nombre: string;
}

export interface EstadoRep {
  id: number;
  nombre: string;
  pais_id: number;
}

export interface Municipio {
  id: number;
  nombre: string;
  estado_id: number;
}

export interface Colonia {
  id: number;
  nombre: string;
  codigo_postal?: string;
  municipio_id: number;
}

export interface Calle {
  id: number;
  nombre: string;
  colonia_id: number;
}

export interface Direccion {
  id: string;
  numero_exterior: string;
  numero_interior?: string;
  calle_id: number;
  // Poblado con JOINs
  calle?: Calle;
  colonia?: Colonia;
  municipio?: Municipio;
  estado?: EstadoRep;
  pais?: Pais;
}

// ==============================================================================
// 3. JERARQUÍA CORPORATIVA RAMIFICADA (Arco Exclusivo)
// ==============================================================================

export interface Sede {
  id: string;
  nombre: string;
  direccion_id?: string;
  direccion?: Direccion;
}

// RAMA A: Administrativa
export interface Edificio {
  id: string;
  nombre: string;
  sede_id: string;
  sede?: Sede;
}

export interface Piso {
  id: string;
  nombre: string;
  edificio_id: string;
  edificio?: Edificio;
}

export interface Oficina {
  id: string;
  nombre: string;
  piso_id: string;
  piso?: Piso;
}

// RAMA B: Almacén e Inventario
export interface Almacen {
  id: string;
  nombre: string;
  sede_id: string;
  sede?: Sede;
}

export interface Pasillo {
  id: string;
  nombre: string;
  almacen_id: string;
  almacen?: Almacen;
}

export interface Estante {
  id: string;
  nombre: string;
  pasillo_id: string;
  pasillo?: Pasillo;
}

// ==============================================================================
// 4. TABLAS PRINCIPALES DEL DOMINIO
// ==============================================================================

export interface Usuario {
  id: string; // UUID vinculado a Supabase Auth (auth.uid())
  nombre_completo: string;
  email: string;
  rol_id: RolUsuario;
  activo: boolean;
  created_at: string;
  // Campos adicionales de UI
  avatar?: string;
  departamento?: string;
  telefono?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  tipo_rastreo: TipoRastreo;
  vida_util_anios: number;
  porcentaje_depreciacion?: number; // GENERATED COLUMN
}

export interface Proveedor {
  id: string;
  razon_social: string;
  rfc_tax_id?: string;
  contacto_soporte?: string;
  direccion_fiscal?: string;
  sitio_web?: string;
  // Campos adicionales de UI
  email?: string;
  telefono_emergencia?: string;
  activos_count?: number;
}

export interface Activo {
  id: string;
  codigo_etiqueta: string;
  categoria_id: string;
  custodio_actual_id?: string;
  oficina_id?: string;
  estante_id?: string;
  especificaciones: Record<string, any>; // JSONB
  estado_operativo_id: EstadoActivo;
  foto_principal_url?: string;
  created_at: string;
  updated_at: string;
  
  // Relaciones pobladas (para UI)
  categoria?: Categoria;
  custodio_actual?: Usuario;
  oficina?: Oficina;
  estante?: Estante;
  datos_financieros?: DatosFinancieros;
  
  // Campos adicionales para UI
  nombre?: string; // Derivado de especificaciones
  valor_libro?: number; // Derivado de datos_financieros
  dias_hasta_vencimiento_garantia?: number;
}

export interface DatosFinancieros {
  activo_id: string;
  proveedor_id?: string;
  costo_adquisicion: number;
  valor_libro_actual: number;
  fecha_compra: string; // ISO date
  fin_garantia?: string; // ISO date
  
  // Relaciones
  proveedor?: Proveedor;
}

export interface LogAuditoria {
  id: string;
  activo_id: string;
  auditor_id: string;
  fecha_hora: string;
  coordenadas_gps?: {
    latitude: number;
    longitude: number;
  };
  estado_reportado_id: EstadoAuditoria;
  comentarios?: string;
  
  // Relaciones
  activo?: Activo;
  auditor?: Usuario;
}

export interface MovimientoActivo {
  id: string;
  activo_id: string;
  custodio_anterior_id?: string;
  oficina_anterior_id?: string;
  estante_anterior_id?: string;
  custodio_nuevo_id?: string;
  oficina_nueva_id?: string;
  estante_nuevo_id?: string;
  fecha_movimiento: string;
  
  // Relaciones
  activo?: Activo;
  custodio_anterior?: Usuario;
  custodio_nuevo?: Usuario;
}

// ==============================================================================
// 5. MÓDULOS DE EXPANSIÓN (Finanzas, Alertas, Mantenimiento, Bajas)
// ==============================================================================

export interface LogDepreciacion {
  id: string;
  activo_id: string;
  fecha_calculo: string;
  valor_anterior: number;
  monto_depreciado: number;
  valor_nuevo: number;
  metodo_usado: string;
  
  // Relaciones
  activo?: Activo;
}

export interface AlertaSistema {
  id: string;
  activo_id?: string;
  tipo_alerta: TipoAlerta;
  mensaje: string;
  fecha_disparo: string;
  leida: boolean;
  usuario_destino_id?: string;
  created_at: string;
  
  // Relaciones
  activo?: Activo;
  usuario_destino?: Usuario;
}

export interface Mantenimiento {
  id: string;
  activo_id: string;
  solicitante_id: string;
  tecnico_asignado?: string;
  descripcion_falla: string;
  costo_reparacion: number;
  estado_ticket: EstadoTicket;
  fecha_solicitud: string;
  fecha_resolucion?: string;
  
  // Relaciones
  activo?: Activo;
  solicitante?: Usuario;
}

export interface BajaActivo {
  activo_id: string;
  usuario_autoriza_id: string;
  motivo_baja: MotivoBaja;
  fecha_baja: string;
  monto_recuperado: number;
  documento_respaldo_url?: string;
  comentarios?: string;
  created_at: string;
  
  // Relaciones
  activo?: Activo;
  usuario_autoriza?: Usuario;
}

// ==============================================================================
// 6. TIPOS DE UI Y VISTAS
// ==============================================================================

export interface UbicacionCompleta {
  tipo: 'oficina' | 'estante';
  // Para oficinas
  sede?: string;
  edificio?: string;
  piso?: string;
  oficina?: string;
  // Para almacenes
  almacen?: string;
  pasillo?: string;
  estante?: string;
}

export interface ActivoConUbicacion extends Activo {
  ubicacion_completa?: UbicacionCompleta;
  ubicacion_texto?: string; // Ej: "Sede Central → Edificio A → Piso 3 → Oficina 301"
}

export interface MetricasFinancieras {
  valor_total_activos: number;
  depreciacion_acumulada: number;
  activos_garantia_vigente: number;
  activos_garantia_vencida: number;
  costo_promedio_activo: number;
  activos_por_categoria: { categoria: string; count: number; valor: number }[];
}

export interface MetricasAuditoria {
  total_auditorias: number;
  verificados_ok: number;
  no_encontrados: number;
  danados: number;
  tasa_conformidad: number; // Porcentaje
}

// ==============================================================================
// 7. TIPOS PARA FORMULARIOS Y ACCIONES
// ==============================================================================

export interface CrearActivoForm {
  codigo_etiqueta: string;
  categoria_id: string;
  custodio_actual_id?: string;
  especificaciones: Record<string, any>;
  estado_operativo_id: EstadoActivo;
  foto_principal_url?: string;
  
  // Ubicación (solo una)
  ubicacion_tipo: 'oficina' | 'estante';
  oficina_id?: string;
  estante_id?: string;
  
  // Datos financieros
  proveedor_id?: string;
  costo_adquisicion: number;
  fecha_compra: string;
  fin_garantia?: string;
}

export interface RegistrarAuditoriaForm {
  activo_id: string;
  coordenadas_gps?: {
    latitude: number;
    longitude: number;
  };
  estado_reportado_id: EstadoAuditoria;
  comentarios?: string;
}

export interface TransferenciaActivoForm {
  activo_id: string;
  ubicacion_tipo: 'oficina' | 'estante';
  oficina_id?: string;
  estante_id?: string;
  custodio_nuevo_id?: string;
  comentarios?: string;
}

export interface CrearMantenimientoForm {
  activo_id: string;
  descripcion_falla: string;
  tecnico_asignado?: string;
}

export interface CrearAlertaForm {
  activo_id?: string;
  tipo_alerta: TipoAlerta;
  mensaje: string;
  fecha_disparo: string;
  usuario_destino_id?: string;
}
