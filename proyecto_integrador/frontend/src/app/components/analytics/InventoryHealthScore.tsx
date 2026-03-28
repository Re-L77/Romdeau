import { memo } from 'react';
import { motion } from 'motion/react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { ShieldCheck, ShieldAlert, ShieldOff, Shield } from 'lucide-react';
import { HealthScoreDto } from '../../../hooks/useAnalytics';

interface Props {
  data: HealthScoreDto | null;
}

const nivelConfig = {
  EXCELENTE: { color: '#10b981', label: 'Excelente', Icon: ShieldCheck },
  BUENO:     { color: '#6366f1', label: 'Bueno',     Icon: ShieldCheck },
  MODERADO:  { color: '#f59e0b', label: 'Moderado',  Icon: Shield },
  BAJO:      { color: '#f97316', label: 'Bajo',       Icon: ShieldAlert },
  CRITICO:   { color: '#ef4444', label: 'Crítico',    Icon: ShieldOff },
};

const BreakdownBar = ({
  label, value, color,
}: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold dark:text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

export const InventoryHealthScore = memo(function InventoryHealthScore({ data }: Props) {
  if (!data) return null;

  const config = nivelConfig[data.nivel];
  const chartData = [{ name: 'score', value: data.score, fill: config.color }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Score de Salud</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Índice global del inventario</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge chart */}
        <div className="relative w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              barSize={12}
              data={chartData}
              startAngle={225} endAngle={-45}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#e5e7eb' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold dark:text-white">{data.score}</span>
            <span className="text-xs font-semibold mt-0.5" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-3 w-full">
          <BreakdownBar label="Auditados"   value={data.breakdown.auditados_pct}    color="#6366f1" />
          <BreakdownBar label="Buen estado" value={data.breakdown.buen_estado_pct}  color="#10b981" />
          <BreakdownBar label="Con ubicación" value={data.breakdown.con_ubicacion_pct} color="#f59e0b" />
          <BreakdownBar label="Con custodio" value={data.breakdown.con_custodio_pct}  color="#3b82f6" />
        </div>
      </div>
    </motion.div>
  );
});
