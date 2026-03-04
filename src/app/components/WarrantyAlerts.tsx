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
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border-2 border-amber-200 shadow-[0_8px_30px_rgb(251,146,60,0.15)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Alerta: Garantías Críticas</h3>
            <p className="text-sm text-gray-600">Evite pérdidas - Activos expiran en menos de 30 días</p>
          </div>
        </div>
        <div className="px-5 py-2 bg-amber-500 text-white rounded-full font-bold text-sm">
          {criticalAssets.length} Activos
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-3 mb-6">
        {criticalAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          >
            {/* Avatar */}
            <div className={`w-14 h-14 ${asset.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
              {asset.avatar}
            </div>

            {/* Asset Info */}
            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Activo</p>
                <p className="font-bold text-gray-900">{asset.code}</p>
                <p className="text-sm text-gray-600">{asset.name}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                  <p className="text-sm font-medium text-gray-900">{asset.location}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Valor Garantía</p>
                <p className="text-2xl font-bold text-gray-900">{asset.warrantyValue}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expira en</p>
                  <p className="text-3xl font-bold text-red-600">{asset.daysRemaining}</p>
                  <p className="text-sm font-semibold text-red-600">días</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition-colors"
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
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg"
      >
        Ver Todas las Garantías (28 próximas a vencer)
      </motion.button>
    </motion.div>
  );
}
