import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, MapPin } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const depreciationData = [
  { month: 'Ago', value: 5240000, depreciation: 1640000 },
  { month: 'Sep', value: 5180000, depreciation: 1710000 },
  { month: 'Oct', value: 5120000, depreciation: 1780000 },
  { month: 'Nov', value: 5060000, depreciation: 1850000 },
  { month: 'Dic', value: 5000000, depreciation: 1920000 },
  { month: 'Ene', value: 4940000, depreciation: 1990000 },
  { month: 'Feb', value: 4880000, depreciation: 2060000 },
];

const chartData = [
  { value: 4200000 },
  { value: 4350000 },
  { value: 4280000 },
  { value: 4500000 },
  { value: 4650000 },
  { value: 4820000 },
  { value: 5240000 },
];

const expiringWarranties = [
  { 
    id: 1, 
    asset: 'MacBook Pro 16"',
    assetId: 'AST-2023-089',
    location: 'Piso 3 - Desk 3B',
    daysLeft: 12,
    warrantyValue: '$999',
    initial: 'MB', 
    color: 'from-purple-400 to-purple-600' 
  },
  { 
    id: 2, 
    asset: 'Dell PowerEdge R750',
    assetId: 'AST-2022-156',
    location: 'Data Center - A12',
    daysLeft: 18,
    warrantyValue: '$2,499',
    initial: 'AC', 
    color: 'from-blue-400 to-blue-600' 
  },
  { 
    id: 3, 
    asset: 'HP LaserJet Pro',
    assetId: 'AST-2023-234',
    location: 'Contabilidad',
    daysLeft: 25,
    warrantyValue: '$299',
    initial: 'ST', 
    color: 'from-pink-400 to-pink-600' 
  },
];

export function FinancialWidgets() {
  const today = new Date();
  const currentMonth = today.toLocaleDateString('es-ES', { month: 'long' });
  const currentYear = today.getFullYear();
  const totalAssets = 342;
  const avgDepreciationRate = 35;
  const monthlyDepreciation = 60420;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Depreciación Mensual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8 relative overflow-hidden"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-1 dark:text-white">Depreciación Mensual</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Proyección {currentMonth} {currentYear}</p>
        </div>

        <div className="absolute inset-0 opacity-10 dark:opacity-5">
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
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Valor del Inventario Total</p>
              <h2 className="text-4xl md:text-5xl font-bold dark:text-white">$5,240,000</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {totalAssets} activos registrados
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 rounded-full">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+8.7%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Depreciación Acumulada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Depreciación Acumulada</p>
            <h3 className="text-2xl md:text-3xl font-bold dark:text-white">$1,842,300</h3>
          </div>
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500">{avgDepreciationRate}%</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">del total</span>
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Pérdida mensual</span>
            <span className="font-bold text-red-600 dark:text-red-400">-${monthlyDepreciation.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Garantías por Vencer - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="lg:col-span-3 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1 dark:text-white">Garantías por Vencer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximos 30 días - Alertas automáticas activas</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expiringWarranties.map((warranty, index) => (
            <motion.div
              key={warranty.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700/30 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${warranty.color} rounded-2xl flex items-center justify-center text-white font-bold`}>
                  {warranty.initial}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{warranty.daysLeft}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">días</div>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{warranty.asset}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{warranty.assetId}</p>

              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                <MapPin className="w-3 h-3" />
                <span>{warranty.location}</span>
              </div>

              <div className="pt-3 border-t border-amber-200 dark:border-amber-700/30 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">Valor de garantía</span>
                <span className="font-bold text-gray-900 dark:text-white">{warranty.warrantyValue}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-700/30 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Protección Activa</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Las alertas se envían 30 días antes del vencimiento para evitar pérdida de cobertura
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
