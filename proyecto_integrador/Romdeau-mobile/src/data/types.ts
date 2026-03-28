// Tipos para el Sistema de Auditoría Móvil - Romdeau

export type AuditStatus = "ENCONTRADO" | "NO_LOCALIZADO" | "DAÑADO";
export type AssetStatus = "PENDIENTE" | "AUDITADO" | "NO_LOCALIZADO";

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface Asset {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  ubicacion_actual: string;
  valor: number;
  categoria: string;
  estado: AssetStatus;
}

export interface AuditData {
  asset_id: string;
  auditor_name: string;
  timestamp: string;
  status: AuditStatus;
  observaciones: string;
  nueva_ubicacion?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  foto_evidencia?: string;
}

export interface AuditStats {
  pending: number;
  completed: number;
  notFound: number;
  total: number;
}

export interface RecentActivity {
  id: string;
  asset: string;
  status: AuditStatus;
  time: string;
  location: string;
  date?: string;
}
