export interface ResumenDto {
  total_activos: number;
  activos_auditados: number;
  activos_con_inconsistencias: number;
  activos_en_movimiento: number;
  auditorias_pendientes: number;
}

export interface FinancieroDto {
  valor_total_activos: number;
  depreciacion_acumulada: number;
  porcentaje_depreciacion: number;
  variacion_mensual: number;
  inventoryTrend: { x: number; y: number }[];
  depreciationTrend: { x: number; y: number }[];
}

export interface AuditoriaRecienteDto {
  id: string;
  usuario: string;
  fecha: string | Date;
  ubicacion: string;
  actividad: string; // e.g. "Reportado como Bueno"
}

export interface AuditoriaProgramadaDto {
  id: string;
  titulo: string;
  usuario: string;
  fechaProgramada: string | Date;
  ubicacion: string;
  estado: string;
  estadoId: number;
}

export interface AlertaDto {
  id: string; // identifier of the asset or audit
  tipo: 'INCONSISTENCIA' | 'SIN_AUDITAR' | 'GARANTIA_VENCER';
  mensaje: string;
  nivel: 'ROJO' | 'AMARILLO';
}

export interface GraficasDto {
  activosPorEstado: { estado: string; cantidad: number }[];
  activosPorDepartamento: { departamento: string; cantidad: number }[];
  auditoriasPorMes: { mes: string; cantidad: number }[];
}
