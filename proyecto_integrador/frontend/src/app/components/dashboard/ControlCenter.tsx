import { motion } from 'motion/react';
import { AlertCircle, TrendingDown, Shield, CheckCircle2 } from 'lucide-react';

const metrics = [
  {
    id: 1,
    problem: 'Financial Blindness',
    solution: 'Warranties Monitored',
    icon: Shield,
    value: '342',
    subtext: '28 expiran en 30 días',
    status: 'warning',
    bgColor: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-900',
  },
  {
    id: 2,
    problem: 'Asset Loss Risk',
    solution: 'GPS-Tracked Assets',
    icon: CheckCircle2,
    value: '100%',
    subtext: 'Última auditoría: Hoy 14:30',
    status: 'success',
    bgColor: 'from-emerald-50 to-green-50',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-900',
  },
  {
    id: 3,
    problem: 'Depreciation Control',
    solution: 'Straight-Line Active',
    icon: TrendingDown,
    value: '-$60K',
    subtext: 'Pérdida mensual calculada',
    status: 'info',
    bgColor: 'from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-900',
  },
  {
    id: 4,
    problem: 'Data Chaos',
    solution: 'Centralized Database',
    icon: AlertCircle,
    value: '0',
    subtext: 'Hojas de Excel eliminadas',
    status: 'success',
    bgColor: 'from-purple-50 to-violet-50',
    iconBg: 'bg-purple-500',
    textColor: 'text-purple-900',
  },
];

export function ControlCenter() {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 dark:text-white">Centro de Control</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Solución a problemas críticos - De caos a control total
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`bg-gradient-to-br ${metric.bgColor} dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 ${
                metric.status === 'warning' ? 'border-amber-200 dark:border-amber-500/30' : 
                metric.status === 'success' ? 'border-emerald-200 dark:border-emerald-500/30' : 
                'border-blue-200 dark:border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${metric.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-500 font-medium line-through">
                  {metric.problem}
                </p>
                <p className={`text-sm font-bold ${metric.textColor} dark:text-white`}>
                  {metric.solution}
                </p>
              </div>
              
              <div className={`${metric.textColor} dark:text-white font-bold text-3xl mb-1`}>
                {metric.value}
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {metric.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}