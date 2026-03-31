import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';

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
  actividad: string;
}

export interface AlertaDto {
  id: string;
  tipo: 'INCONSISTENCIA' | 'SIN_AUDITAR' | 'GARANTIA_VENCER';
  mensaje: string;
  nivel: 'ROJO' | 'AMARILLO';
}

export interface GraficasDto {
  activosPorEstado: { estado: string; cantidad: number }[];
  activosPorDepartamento: { departamento: string; cantidad: number }[];
  auditoriasPorMes: { mes: string; cantidad: number }[];
}

export interface DashboardData {
  resumen: ResumenDto | null;
  financiero: FinancieroDto | null;
  auditorias: AuditoriaRecienteDto[];
  alertas: AlertaDto[];
  graficas: GraficasDto | null;
}

export function useDashboard(pollingInterval = 30000) {
  const [data, setData] = useState<DashboardData>({
    resumen: null,
    financiero: null,
    auditorias: [],
    alertas: [],
    graficas: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [resumen, financiero, auditorias, alertas, graficas] = await Promise.all([
        apiClient.get<ResumenDto>('/api/dashboard/resumen'),
        apiClient.get<FinancieroDto>('/api/dashboard/financiero'),
        apiClient.get<AuditoriaRecienteDto[]>('/api/dashboard/auditorias-recientes'),
        apiClient.get<AlertaDto[]>('/api/dashboard/alertas'),
        apiClient.get<GraficasDto>('/api/dashboard/graficas'),
      ]);

      setData({ resumen, financiero, auditorias, alertas, graficas });
      setError(null);
      setLastUpdated(new Date());
      setSecondsSinceUpdate(0);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Error loading dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Main polling effect
  useEffect(() => {
    fetchDashboardData();
    if (pollingInterval > 0) {
      const interval = setInterval(fetchDashboardData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, pollingInterval]);

  // Seconds-since-update counter (ticks every second)
  useEffect(() => {
    if (lastUpdated === null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastUpdated]);

  return { data, loading, error, lastUpdated, secondsSinceUpdate, refetch: fetchDashboardData };
}
