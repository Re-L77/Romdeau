import { memo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { FinancieroDto } from '../../../hooks/useDashboard';
import { useCountUp } from '../../../hooks/useCountUp';

interface FinancialMetricCardsProps {
  financiero: FinancieroDto | null;
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

// Removes hardcoded static paths
function scaleTrendData(points: { x: number; y: number }[] | undefined): { x: number; y: number }[] {
  if (!points || points.length === 0) return [];
  const yValues = points.map(p => p.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = maxY - minY;
  
  return points.map(p => {
    // Scale between 10 and 70 (for an 80h viewBox) so it doesn't touch the edges completely.
    // SVG origin (0,0) is top-left, so we invert it for proper visual climbing.
    const scaledY = range === 0 ? 70 : 70 - ((p.y - minY) / range) * 60;
    return { x: p.x, y: scaledY };
  });
}

const createPath = (points: { x: number; y: number }[]) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

// Animated value display with count-up
function AnimatedValue({ value, prefix = '' }: { value: number; prefix?: string }) {
  const count = useCountUp(value);
  return <span>{prefix}{count.toLocaleString('es-MX')}</span>;
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
      ${isPositive
        ? 'bg-emerald-500/20 text-emerald-400'
        : 'bg-red-500/20 text-red-400'
      }`}>
      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {isPositive ? '+' : ''}{value}% vs mes anterior
    </div>
  );
}

export const FinancialMetricCards = memo(function FinancialMetricCards({ financiero }: FinancialMetricCardsProps) {
  const valorTotal = financiero?.valor_total_activos || 0;
  const depreciacionAcumulada = financiero?.depreciacion_acumulada || 0;
  const porcentaje = financiero?.porcentaje_depreciacion || 0;
  const variacion = financiero?.variacion_mensual || 0;

  const inventoryTrend = scaleTrendData(financiero?.inventoryTrend);
  const depreciationTrend = scaleTrendData(financiero?.depreciationTrend);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Hero Card — Valor Total */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-black dark:bg-gradient-to-br dark:from-indigo-700 dark:to-purple-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.18)] dark:shadow-[0_8px_30px_rgb(79,70,229,.35)] group"
        title="Suma del costo de adquisición de todos los activos registrados"
      >
        {/* Sparkline bg */}
        <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 group-hover:opacity-30 transition-opacity" viewBox="0 0 180 80" preserveAspectRatio="none">
          <path d={createPath(inventoryTrend)} fill="none" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Glow orb */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-400 dark:text-indigo-200 text-xs uppercase tracking-widest font-semibold">
              Valor del Inventario
            </p>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tabular-nums">
            {formatCurrency(valorTotal)}
          </h2>
          <p className="text-gray-400 dark:text-indigo-200/70 text-sm mb-5">
            Valor original de inversión total
          </p>

          <TrendBadge value={variacion} />
        </div>
      </motion.div>

      {/* Depreciación Acumulada */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group"
        title="Diferencia entre el costo de adquisición y el valor en libros actual"
      >
        <svg className="absolute bottom-0 left-0 w-full h-24 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity" viewBox="0 0 180 80" preserveAspectRatio="none">
          <path d={createPath(depreciationTrend)} fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest font-semibold">
              Depreciación Acumulada
            </p>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-1 md:mb-2 tabular-nums">
            {formatCurrency(depreciacionAcumulada)}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-3 md:mb-5">
            Sobre el costo de adquisición
          </p>

          <div className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold
            ${porcentaje > 50 ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400'
              : porcentaje > 25 ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
            <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <AnimatedValue value={Math.round(porcentaje)} />% depreciado
          </div>
        </div>
      </motion.div>
    </div>
  );
});