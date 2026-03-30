import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, MapPin, ShieldCheck } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useFinancialSummary } from '../../hooks/useFinancialSummary';

const chartData = [
  { value: 4200000 },
  { value: 4350000 },
  { value: 4280000 },
  { value: 4500000 },
  { value: 4650000 },
  { value: 4820000 },
  { value: 5240000 },
];

export function FinancialWidgets() {
  const { data: summary, loading } = useFinancialSummary();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  const today = new Date();
  const currentMonth = today.toLocaleDateString('es-ES', { month: 'long' });
  const currentYear = today.getFullYear();

  if (loading || !summary) return <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Depreciación Mensual / Inventario Total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-6 md:p-8 relative overflow-hidden"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-1 dark:text-white">Inventario Financiero</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Actualizado a {currentMonth} {currentYear}</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 opacity-10 dark:opacity-5 h-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#000000"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valor Inventario Total</p>
              <h2 className="text-4xl md:text-5xl font-black dark:text-white tracking-tight">
                {formatCurrency(summary.valorTotalAdquisicion)}
              </h2>
              <p className="text-sm text-blue-500 font-bold mt-2">
                {summary.totalActivos} activos registrados en auditoría
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 rounded-full border border-emerald-100 dark:border-emerald-500/30">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">MAESTRO OK</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Depreciación Acumulada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-6 md:p-8 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Depreciación Acumulada</p>
              <h3 className="text-2xl md:text-3xl font-bold dark:text-white">{formatCurrency(summary.depreciacionAcumulada)}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-500/20">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-black text-red-500">{summary.porcentajeDepreciado}%</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Desgaste</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-400 uppercase tracking-wider">Valor en Libros</span>
            <span className="text-emerald-500">{formatCurrency(summary.valorEnLibros)}</span>
          </div>
        </div>
      </motion.div>

      {/* Alerta de Garantías Críticas (Simulado) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="lg:col-span-3 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 dark:opacity-10">
          <ShieldCheck className="w-32 h-32 text-gray-900 dark:text-white" />
        </div>

        <div className="relative z-10">
          <h4 className="text-gray-900 dark:text-white font-bold text-xl mb-6">Estado de Cobertura Crítica</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mb-2">Garantías Vigentes</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.garantias.vigentes}</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mb-2">Vencimientos Hoy</p>
              <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{summary.garantias.criticas}</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mb-2">Expiradas</p>
              <p className="text-3xl font-black text-red-600 dark:text-red-500">{summary.garantias.vencidas}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
