import { memo } from 'react';
import { motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { FinancialWidgets } from "./FinancialWidgets";
import { AuditTimeline } from "../audits/AuditTimeline";
import { ControlCenter } from "./ControlCenter";
import { FinancialMetricCards } from "./FinancialMetricCards";
import { ScheduledAudits } from "../audits/ScheduledAudits";
import { useAuth } from "../../../contexts/AuthContext";
import { useDashboard } from "../../../hooks/useDashboard";
import { Skeleton } from "../ui/skeleton";

// ─── Section Skeleton ────────────────────────────────────────────────────────
function SectionSkeleton({ rows = 1, height = 'h-48' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${height} rounded-3xl bg-gray-100 dark:bg-gray-800`} />
      ))}
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
interface DashboardProps {
  onNavigate?: (view: string) => void;
}

export const Dashboard = memo(function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();

  const displayName =
    user?.nombre_completo ||
    [user?.nombres, user?.apellido_paterno].filter(Boolean).join(' ') ||
    'Usuario';

  return (
    <>
      <AuditTimeline auditorias={data.auditorias} onNavigate={onNavigate} />
      <main className="pl-4 pr-16 sm:pl-6 sm:pr-20 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] lg:pr-20 pt-6 lg:pt-8 pb-16 relative">
        <div className="max-w-[1400px] mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <div>
              <h1 className="text-3xl font-bold dark:text-white">
                Bienvenido, <span className="text-indigo-600 dark:text-indigo-400">{displayName}</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Panel de control — Gestión de activos fijos
              </p>
            </div>
          </div>

          {/* Error Banner (non-blocking) */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
            >
              <WifiOff className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Error al cargar datos: </span>
                {error.message}. Se seguirá reintentando automáticamente.
              </div>
            </motion.div>
          )}

          {/* KPI Cards */}
          {loading && !data.financiero
            ? <SectionSkeleton rows={1} height="h-44" />
            : <FinancialMetricCards financiero={data.financiero} />
          }

          {/* Operational Summary */}
          {loading && !data.resumen
            ? <SectionSkeleton rows={1} height="h-44" />
            : <ControlCenter resumen={data.resumen} />
          }

          {/* Scheduled Audits */}
          <ScheduledAudits />

          {/* Charts + Alerts */}
          {loading && !data.graficas
            ? <SectionSkeleton rows={2} height="h-64" />
            : (
              <FinancialWidgets
                financiero={data.financiero}
                graficas={data.graficas}
              />
            )
          }
        </div>
      </main>
    </>
  );
});
