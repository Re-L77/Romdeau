import { memo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TemporalComparisonDto } from '../../../hooks/useAnalytics';

interface Props {
  data: TemporalComparisonDto | null;
}

function formatValue(value: number, isMonetary: boolean) {
  if (isMonetary) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }
  return value.toLocaleString('es-MX');
}

function DeltaBadge({ variacion }: { variacion: number }) {
  if (variacion === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Minus className="w-3 h-3" /> Sin cambio
      </span>
    );
  const positive = variacion > 0;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-500' : 'text-red-500'}`}
    >
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? '+' : ''}{variacion}%
    </span>
  );
}

interface CardProps {
  label: string;
  currentLabel: string;
  previousLabel: string;
  actual: number;
  anterior: number;
  variacion: number;
  isMonetary?: boolean;
  delay: number;
  accentColor: string;
}

const MetricCard = memo(function MetricCard({
  label, currentLabel, previousLabel, actual, anterior, variacion, isMonetary = false, delay, accentColor,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border-t-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)]"
      style={{ borderTopColor: accentColor }}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold dark:text-white tabular-nums mb-1">
        {formatValue(actual, isMonetary)}
      </p>
      <DeltaBadge variacion={variacion} />
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{currentLabel}: <strong className="dark:text-white">{formatValue(actual, isMonetary)}</strong></span>
        <span>{previousLabel}: <strong>{formatValue(anterior, isMonetary)}</strong></span>
      </div>
    </motion.div>
  );
});

export const TemporalComparison = memo(function TemporalComparison({ data }: Props) {
  if (!data) return null;

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Comparativo Temporal</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Este mes vs mes anterior</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Auditorías"
          currentLabel="Este mes"
          previousLabel="Mes ant."
          {...data.auditorias}
          delay={0}
          accentColor="#6366f1"
        />
        <MetricCard
          label="Movimientos"
          currentLabel="Este mes"
          previousLabel="Mes ant."
          {...data.movimientos}
          delay={0.08}
          accentColor="#8b5cf6"
        />
        <MetricCard
          label="Activos nuevos"
          currentLabel="Este mes"
          previousLabel="Mes ant."
          {...data.activos_nuevos}
          delay={0.16}
          accentColor="#10b981"
        />
        <MetricCard
          label="Valor adquirido"
          currentLabel="Este mes"
          previousLabel="Mes ant."
          {...data.valor_adquirido}
          isMonetary
          delay={0.24}
          accentColor="#f59e0b"
        />
      </div>
    </div>
  );
});
