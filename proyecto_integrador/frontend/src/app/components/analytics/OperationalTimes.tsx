import { memo } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, AlertCircle, CalendarX } from 'lucide-react';
import { OperationalTimesDto } from '../../../hooks/useAnalytics';

interface Props {
  data: OperationalTimesDto | null;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, sub, iconBg, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 flex items-start gap-4"
    >
      <div className={`${iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold dark:text-white tabular-nums">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

export const OperationalTimes = memo(function OperationalTimes({ data }: Props) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-5">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Tiempos Operativos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Métricas de frecuencia de auditoría</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          icon={Clock}
          label="Promedio entre auditorías"
          value={`${data.promedio_dias_entre_auditorias} días`}
          sub="Tiempo promedio entre revisiones"
          iconBg="bg-indigo-500"
          delay={0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Auditados últimos 30 días"
          value={data.activos_auditados_30dias.toLocaleString('es-MX')}
          sub="Activos con revisión reciente"
          iconBg="bg-emerald-500"
          delay={0.07}
        />
        <StatCard
          icon={CalendarX}
          label="Auditados últimos 90 días"
          value={data.activos_auditados_90dias.toLocaleString('es-MX')}
          sub="Activos con revisión trimestral"
          iconBg="bg-blue-500"
          delay={0.14}
        />
        <StatCard
          icon={AlertCircle}
          label="Sin auditoría reciente"
          value={data.activos_sin_auditoria_reciente.toLocaleString('es-MX')}
          sub="Más de 90 días sin revisión"
          iconBg="bg-amber-500"
          delay={0.21}
        />
      </div>
    </motion.div>
  );
});
