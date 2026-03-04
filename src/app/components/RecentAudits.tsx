import { motion } from 'motion/react';
import { Clock, CheckCircle, AlertCircle, MapPin, Calendar, QrCode } from 'lucide-react';

const audits = [
  {
    id: 1,
    auditor: 'Carlos Mendoza',
    avatar: 'CM',
    avatarColor: 'bg-blue-500',
    date: '2026-02-23 14:30',
    location: 'Oficina Central - Piso 3',
    gps: 'GPS: 19.4326, -99.1332',
    qrScanned: '12/12',
    timeSaved: '-45 min',
    status: 'completed',
  },
  {
    id: 2,
    auditor: 'Ana Gutiérrez',
    avatar: 'AG',
    avatarColor: 'bg-purple-500',
    date: '2026-02-23 11:15',
    location: 'Oficina Central - Piso 2',
    gps: 'GPS: 19.4328, -99.1330',
    qrScanned: '8/8',
    timeSaved: '-30 min',
    status: 'completed',
  },
  {
    id: 3,
    auditor: 'Jorge Pérez',
    avatar: 'JP',
    avatarColor: 'bg-pink-500',
    date: '2026-02-22 16:45',
    location: 'Data Center',
    gps: 'GPS: 19.4320, -99.1335',
    qrScanned: '15/15',
    timeSaved: '-60 min',
    status: 'completed',
  },
];

const getStatusIcon = (status: string) => {
  if (status === 'completed') return CheckCircle;
  if (status === 'warning') return AlertCircle;
  return Clock;
};

const getStatusColor = (status: string) => {
  if (status === 'completed') return 'text-emerald-500';
  if (status === 'warning') return 'text-amber-500';
  return 'text-blue-500';
};

export function RecentAudits() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Auditorías Recientes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Últimas verificaciones por QR</p>
        </div>
      </div>

      <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-500/20 border-2 border-emerald-200 dark:border-emerald-700/30 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white">Automatización Activa</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ahorro total: <span className="font-bold text-emerald-600 dark:text-emerald-400">145 minutos</span> vs. auditoría manual
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {audits.map((audit, index) => {
            const StatusIcon = getStatusIcon(audit.status);
            
            return (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative flex gap-5"
              >
                <div className={`w-14 h-14 ${audit.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10 relative`}>
                  {audit.avatar}
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{audit.auditor}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{audit.date}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center ${getStatusColor(audit.status)}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{audit.location}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{audit.gps}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                      <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{audit.qrScanned} QR escaneados</span>
                    </div>
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
                      <span className="text-sm font-bold">{audit.timeSaved}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}