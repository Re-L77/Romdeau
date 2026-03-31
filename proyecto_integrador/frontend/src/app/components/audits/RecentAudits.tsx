import { motion } from "motion/react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  QrCode,
} from "lucide-react";
import { AuditoriaRecienteDto } from "../../../hooks/useDashboard";

interface RecentAuditsProps {
  auditorias: AuditoriaRecienteDto[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const getStatusIcon = (nombre: string) => {
  if (nombre === "BUENO") return CheckCircle;
  if (nombre === "DANADO") return AlertCircle;
  return Clock;
};

const getStatusColor = (nombre: string) => {
  if (nombre === "BUENO") return "text-emerald-500";
  if (nombre === "DANADO") return "text-amber-500";
  return "text-blue-500";
};

const getColorClass = (index: number) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];
  return colors[index % colors.length];
};

export function RecentAudits({ auditorias }: RecentAuditsProps) {
  if (!auditorias || auditorias.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <h2 className="text-2xl font-bold dark:text-white mb-4">
          Auditorías Recientes
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          No hay auditorías recientes registradas.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">
            Auditorías Recientes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Últimas verificaciones en el sistema
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {auditorias.map((audit, index) => {
            const StatusIcon = getStatusIcon("completed");
            const avatarColor = getColorClass(index);
            const formattedDate = new Date(audit.fecha).toLocaleString(
              "es-MX",
              {
                dateStyle: "short",
                timeStyle: "short",
              },
            );

            return (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative flex gap-5"
              >
                <div
                  className={`w-14 h-14 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10 relative`}
                >
                  {getInitials(audit.usuario)}
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        {audit.usuario}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center ${getStatusColor("completed")}`}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {audit.ubicacion}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                      <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {audit.actividad}
                      </span>
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
