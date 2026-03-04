import { FinancialWidgets } from './FinancialWidgets';
import { AuditTimeline } from './AuditTimeline';
import { ControlCenter } from './ControlCenter';
import { FinancialMetricCards } from './FinancialMetricCards';
import { RecentAudits } from './RecentAudits';

export function DashboardFinanciero() {
  return (
    <>
      <AuditTimeline />
      <main className="px-6 lg:pl-80 xl:pr-[440px] pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="mb-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Lunes, 23 de Febrero 2026</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Dashboard Financiero</h1>
            <p className="text-gray-600 dark:text-gray-400">Resumen ejecutivo y métricas clave</p>
          </div>
          <FinancialMetricCards />
          <ControlCenter />
          <RecentAudits />
          <FinancialWidgets />
        </div>
      </main>
    </>
  );
}