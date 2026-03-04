import { motion } from 'motion/react';
import { CheckCircle2, MapPin, User, QrCode } from 'lucide-react';

const audits = [
  {
    id: 1,
    auditor: 'Carlos Mendoza',
    avatar: 'CM',
    timestamp: '2026-02-23 14:30',
    location: 'Oficina Central - Piso 3',
    gpsCoordinates: '19.4326, -99.1332',
    assetsVerified: 12,
    qrScanned: 12,
    validated: true,
    automationSaved: '45 min',
  },
  {
    id: 2,
    auditor: 'Ana Gutiérrez',
    avatar: 'AG',
    timestamp: '2026-02-23 11:15',
    location: 'Oficina Central - Piso 2',
    gpsCoordinates: '19.4328, -99.1330',
    assetsVerified: 8,
    qrScanned: 8,
    validated: true,
    automationSaved: '30 min',
  },
  {
    id: 3,
    auditor: 'Jorge Pérez',
    avatar: 'JP',
    timestamp: '2026-02-22 16:45',
    location: 'Data Center',
    gpsCoordinates: '19.4320, -99.1335',
    assetsVerified: 5,
    qrScanned: 5,
    validated: true,
    automationSaved: '18 min',
  },
  {
    id: 4,
    auditor: 'María Rodríguez',
    avatar: 'MR',
    timestamp: '2026-02-22 09:30',
    location: 'Área Contabilidad',
    gpsCoordinates: '19.4325, -99.1328',
    assetsVerified: 15,
    qrScanned: 15,
    validated: true,
    automationSaved: '52 min',
  },
];

const avatarColors = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-emerald-400 to-emerald-600',
];

export function AuditTimeline() {
  const totalTimeSaved = audits.reduce((acc, audit) => {
    const mins = parseInt(audit.automationSaved);
    return acc + mins;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="hidden xl:block fixed right-6 top-24 bottom-6 w-96 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 overflow-y-auto z-40"
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Auditorías Recientes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Últimas verificaciones QR</p>
      </div>

      {/* Time saved banner */}
      <div className="mb-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4">
        <p className="text-emerald-100 text-xs font-medium mb-1">TIEMPO AHORRADO HOY</p>
        <p className="text-white text-2xl font-bold">{totalTimeSaved} minutos</p>
        <p className="text-emerald-100 text-xs">vs auditoría manual con Excel</p>
      </div>

      <div className="space-y-6 relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {audits.map((audit, index) => {
          const avatarColor = avatarColors[index % avatarColors.length];
          
          return (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline dot with avatar */}
              <div className={`absolute left-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center ring-4 ring-white dark:ring-[#1a1a1a] shadow-lg text-white font-bold text-sm`}>
                {audit.avatar}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1 dark:text-white">{audit.auditor}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {audit.location}
                    </p>
                  </div>
                  {audit.validated && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Activos</p>
                    <p className="font-bold text-sm dark:text-white">{audit.assetsVerified}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      QR Scans
                    </p>
                    <p className="font-bold text-sm dark:text-white">{audit.qrScanned}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{audit.timestamp}</span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                    <span className="font-medium">+{audit.automationSaved}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors shadow-lg"
      >
        Ver Todas las Auditorías
      </motion.button>
    </motion.div>
  );
}
