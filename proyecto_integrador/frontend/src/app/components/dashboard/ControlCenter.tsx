import { memo } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingDown, Shield, CheckCircle2 } from 'lucide-react';
import { ResumenDto } from '../../../hooks/useDashboard';
import { useCountUp } from '../../../hooks/useCountUp';

interface ControlCenterProps {
  resumen: ResumenDto | null;
}

interface KpiCardProps {
  id: number;
  name: string;
  icon: React.ElementType;
  value: number;
  subtext: string;
  status: 'info' | 'success' | 'warning' | 'danger';
  bgColor: string;
  iconBg: string;
  textColor: string;
  index: number;
  tooltip: string;
}

const statusStyles: Record<string, string> = {
  info: 'border-blue-200 dark:border-blue-500/30',
  success: 'border-emerald-200 dark:border-emerald-500/30',
  warning: 'border-amber-200 dark:border-amber-500/30',
  danger: 'border-red-200 dark:border-red-500/30',
};

function KpiCard({ name, icon: Icon, value, subtext, status, bgColor, iconBg, textColor, index, tooltip }: KpiCardProps) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      title={tooltip}
      className={`bg-gradient-to-br ${bgColor} dark:from-gray-800/80 dark:to-gray-900 rounded-2xl p-6 border-2 ${statusStyles[status]} cursor-default select-none`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {/* Indicator dot */}
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${
          status === 'success' ? 'bg-emerald-400' :
          status === 'warning' ? 'bg-amber-400' :
          status === 'danger'  ? 'bg-red-400' :
          'bg-blue-400'
        } shadow-[0_0_8px_2px_rgba(0,0,0,.12)]`} />
      </div>

      <p className={`text-sm font-bold ${textColor} dark:text-white mb-1`}>{name}</p>

      <div className={`${textColor} dark:text-white font-bold text-3xl tabular-nums mb-1`}>
        {animated.toLocaleString('es-MX')}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{subtext}</p>
    </motion.div>
  );
}

export const ControlCenter = memo(function ControlCenter({ resumen }: ControlCenterProps) {
  const cards: Omit<KpiCardProps, 'index'>[] = [
    {
      id: 1,
      name: 'Total de Activos',
      icon: Shield,
      value: resumen?.total_activos || 0,
      subtext: 'Registrados en el sistema',
      status: 'info',
      bgColor: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-900',
      tooltip: 'Número total de activos fijos registrados en la base de datos',
    },
    {
      id: 2,
      name: 'Activos Auditados',
      icon: CheckCircle2,
      value: resumen?.activos_auditados || 0,
      subtext: 'Con al menos una auditoría registrada',
      status: 'success',
      bgColor: 'from-emerald-50 to-green-50',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-900',
      tooltip: 'Activos que tienen al menos un registro de auditoría realizado',
    },
    {
      id: 3,
      name: 'Inconsistencias',
      icon: AlertCircle,
      value: resumen?.activos_con_inconsistencias || 0,
      subtext: 'Estado operativo anómalo',
      status: resumen?.activos_con_inconsistencias ? 'warning' : 'success',
      bgColor: resumen?.activos_con_inconsistencias ? 'from-amber-50 to-orange-50' : 'from-emerald-50 to-green-50',
      iconBg: resumen?.activos_con_inconsistencias ? 'bg-amber-500' : 'bg-emerald-500',
      textColor: resumen?.activos_con_inconsistencias ? 'text-amber-900' : 'text-emerald-900',
      tooltip: 'Activos cuyo estado operativo difiere del estado esperado (Bueno)',
    },
    {
      id: 4,
      name: 'Sin Auditar',
      icon: TrendingDown,
      value: resumen?.auditorias_pendientes || 0,
      subtext: 'Activos jamás auditados',
      status: resumen?.auditorias_pendientes ? 'danger' : 'success',
      bgColor: resumen?.auditorias_pendientes ? 'from-red-50 to-rose-50' : 'from-emerald-50 to-green-50',
      iconBg: resumen?.auditorias_pendientes ? 'bg-red-500' : 'bg-emerald-500',
      textColor: resumen?.auditorias_pendientes ? 'text-red-900' : 'text-emerald-900',
      tooltip: 'Activos que nunca han sido auditados mediante QR',
    },
  ];

  return (
    <div className="mb-2">
      <div className="mb-5">
        <h2 className="text-2xl font-bold mb-1 dark:text-white">Resumen Operativo</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Métricas clave del estado de activos — actualizado en tiempo real
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <KpiCard key={card.id} {...card} index={index} />
        ))}
      </div>
    </div>
  );
});