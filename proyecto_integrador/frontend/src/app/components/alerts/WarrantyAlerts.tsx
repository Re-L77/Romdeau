import { motion } from 'motion/react';
import { AlertTriangle, MapPin, DollarSign, Calendar } from 'lucide-react';

const criticalAssets = [
  {
    id: 1,
    code: 'AST-2023-089',
    name: 'MacBook Pro 16"',
    location: 'Piso 3 - Desk 3B',
    warrantyValue: '$999',
    daysRemaining: 12,
    avatar: 'MB',
    avatarColor: 'bg-purple-500',
  },
  {
    id: 2,
    code: 'AST-2022-156',
    name: 'Dell PowerEdge R750',
    location: 'Data Center - A12',
    warrantyValue: '$2,499',
    daysRemaining: 18,
    avatar: 'AC',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 3,
    code: 'AST-2023-234',
    name: 'HP LaserJet Pro',
    location: 'Contabilidad',
    warrantyValue: '$299',
    daysRemaining: 25,
    avatar: 'ST',
    avatarColor: 'bg-pink-500',
  },
];

export function WarrantyAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl md:rounded-3xl p-4 md:p-8 border-2 border-amber-200 dark:border-amber-800 shadow-[0_8px_30px_rgb(251,146,60,0.15)]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
        <div className="flex items-start gap-2 md:gap-3 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white">Alerta: Garantías Críticas</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Evite pérdidas - Activos expiran en menos de 30 días</p>
          </div>
        </div>
        <div className="px-3 md:px-5 py-1.5 md:py-2 bg-amber-500 text-white rounded-full font-bold text-xs md:text-sm whitespace-nowrap">
          {criticalAssets.length} Activos
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
        {criticalAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg md:rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 shadow-sm"
          >
            {/* Avatar */}
            <div className={`w-10 h-10 md:w-14 md:h-14 ${asset.avatarColor} rounded-lg md:rounded-2xl flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0`}>
              {asset.avatar}
            </div>

            {/* Asset Info */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start md:items-center text-xs md:text-base">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">Activo</p>
                <p className="font-bold text-gray-900 dark:text-white">{asset.code}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{asset.name}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">Ubicación</p>
                  <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">{asset.location}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Valor Garantía</p>
                <p className="text-2xl font-bold text-gray-900">{asset.warrantyValue}</p>
              </div>

              <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-2 md:gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">Expira en</p>
                  <p className="text-xl md:text-3xl font-bold text-red-600">{asset.daysRemaining}</p>
                  <p className="text-xs md:text-sm font-semibold text-red-600">días</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 md:px-6 py-1.5 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg md:rounded-full font-semibold hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors text-xs md:text-base whitespace-nowrap"
                >
                  Renovar
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 md:py-4 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white rounded-lg md:rounded-2xl font-bold text-sm md:text-lg hover:from-amber-600 hover:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 transition-all shadow-lg"
      >
        Ver Todas las Garantías (28 próximas a vencer)
      </motion.button>
    </motion.div>
  );
}
