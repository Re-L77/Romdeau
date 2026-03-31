// ─── Health Score ─────────────────────────────────────────────────────────────
export interface HealthScoreBreakdownDto {
  auditados_pct: number;
  buen_estado_pct: number;
  con_ubicacion_pct: number;
  con_custodio_pct: number;
}

export interface HealthScoreDto {
  score: number;
  nivel: 'CRITICO' | 'BAJO' | 'MODERADO' | 'BUENO' | 'EXCELENTE';
  breakdown: HealthScoreBreakdownDto;
}

// ─── User Performance ─────────────────────────────────────────────────────────
export interface UserPerformanceItemDto {
  usuario_id: string;
  nombre: string;
  total_auditorias: number;
  mes_actual: number;
  mes_anterior: number;
  variacion: number;
}

// ─── Cost by Department ───────────────────────────────────────────────────────
export interface CostByDepartmentItemDto {
  departamento: string;
  costo_total: number;
  valor_actual: number;
  activos_count: number;
}

// ─── Temporal Comparison ──────────────────────────────────────────────────────
export interface TemporalMetricDto {
  actual: number;
  anterior: number;
  variacion: number;
}

export interface TemporalComparisonDto {
  auditorias: TemporalMetricDto;
  movimientos: TemporalMetricDto;
  activos_nuevos: TemporalMetricDto;
  valor_adquirido: TemporalMetricDto;
}

// ─── Critical Assets ──────────────────────────────────────────────────────────
export interface CriticalAssetItemDto {
  id: string;
  nombre: string;
  codigo_etiqueta: string | null;
  valor?: number;
  dias_sin_auditoria?: number;
  total_movimientos?: number;
}

export interface CriticalAssetsDto {
  alto_valor: CriticalAssetItemDto[];
  sin_auditoria_reciente: CriticalAssetItemDto[];
  alta_rotacion: CriticalAssetItemDto[];
}

// ─── Movements by Month ───────────────────────────────────────────────────────
export interface MovementsByMonthItemDto {
  mes: string;
  cantidad: number;
}

// ─── Operational Times ────────────────────────────────────────────────────────
export interface OperationalTimesDto {
  promedio_dias_entre_auditorias: number;
  activos_auditados_30dias: number;
  activos_auditados_90dias: number;
  activos_sin_auditoria_reciente: number;
}

// ─── Depreciation Projection ──────────────────────────────────────────────────
export interface DepreciationProjectionItemDto {
  mes: string;
  valor_proyectado: number;
}

// ─── Top Moved Assets ─────────────────────────────────────────────────────────
export interface TopMovedAssetDto {
  id: string;
  nombre: string;
  codigo_etiqueta: string | null;
  total_movimientos: number;
}
