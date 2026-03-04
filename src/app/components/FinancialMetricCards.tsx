import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function FinancialMetricCards() {
  // Data points for sparkline charts (simplified for SVG path)
  const inventoryTrend = [
    { x: 0, y: 60 },
    { x: 20, y: 55 },
    { x: 40, y: 58 },
    { x: 60, y: 52 },
    { x: 80, y: 57 },
    { x: 100, y: 50 },
    { x: 120, y: 54 },
    { x: 140, y: 48 },
    { x: 160, y: 52 },
    { x: 180, y: 45 },
  ];

  const depreciationTrend = [
    { x: 0, y: 30 },
    { x: 20, y: 32 },
    { x: 40, y: 35 },
    { x: 60, y: 38 },
    { x: 80, y: 42 },
    { x: 100, y: 45 },
    { x: 120, y: 50 },
    { x: 140, y: 52 },
    { x: 160, y: 55 },
    { x: 180, y: 60 },
  ];

  const createPath = (points: { x: number; y: number }[]) => {
    const pathData = points.map((point, i) => {
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ');
    return pathData;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inventory Value Card - Black */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-black dark:bg-gradient-to-br dark:from-indigo-600 dark:to-purple-700 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
      >
        {/* Sparkline in background */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-24 opacity-20"
          viewBox="0 0 180 80"
          preserveAspectRatio="none"
        >
          <path
            d={createPath(inventoryTrend)}
            fill="none"
            stroke="white"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="relative z-10">
          <p className="text-gray-400 dark:text-indigo-200 text-xs uppercase tracking-wider font-medium mb-3">
            VALOR DEL INVENTARIO
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            $471,100
          </h2>
          <p className="text-gray-400 dark:text-indigo-200 text-sm mb-6">
            Valor en libros actual
          </p>
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 px-3 py-2 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">+2.4% vs mes anterior</span>
          </div>
        </div>
      </motion.div>

      {/* Depreciation Card - White */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
      >
        {/* Sparkline in background */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-24 opacity-10 dark:opacity-20"
          viewBox="0 0 180 80"
          preserveAspectRatio="none"
        >
          <path
            d={createPath(depreciationTrend)}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="relative z-10">
          <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">
            DEPRECIACIÓN ACUMULADA
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2">
            $134,400
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Sobre costo de adquisición
          </p>
          
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-full">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-semibold">22% depreciado</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}