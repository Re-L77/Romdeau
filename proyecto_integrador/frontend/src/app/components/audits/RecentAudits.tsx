<<<<<<< HEAD
import { motion } from 'motion/react';
import { Clock, CheckCircle, AlertCircle, MapPin, Calendar, QrCode } from 'lucide-react';
import { AuditoriaRecienteDto } from '../../../hooks/useDashboard';

interface RecentAuditsProps {
  auditorias: AuditoriaRecienteDto[];
}
=======
import { motion } from "motion/react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { useState } from "react";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-cyan-500",
];
>>>>>>> sofia

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

<<<<<<< HEAD
const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getColorClass = (index: number) => {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'];
  return colors[index % colors.length];
};

export function RecentAudits({ auditorias }: RecentAuditsProps) {
  if (!auditorias || auditorias.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Auditorías Recientes</h2>
        <p className="text-gray-500 dark:text-gray-400">No hay auditorías recientes registradas.</p>
      </div>
    );
  }
=======
export function RecentAudits() {
  const [audits] = useState<any[]>([]);
  const loading = false;
>>>>>>> sofia

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
<<<<<<< HEAD
          <h2 className="text-2xl font-bold dark:text-white">Auditorías Recientes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Últimas verificaciones en el sistema</p>
=======
          <h2 className="text-2xl font-bold dark:text-white">
            Auditorías Recientes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Últimos registros de auditoría
          </p>
>>>>>>> sofia
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Cargando...
        </div>
      ) : audits.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Sin registros recientes.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

<<<<<<< HEAD
        <div className="space-y-6">
          {auditorias.map((audit, index) => {
            // Assuming default completed status for logs successfully generated
            const StatusIcon = getStatusIcon('completed');
            const avatarColor = getColorClass(index);
            const formattedDate = new Date(audit.fecha).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short'
            });

            return (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative flex gap-5"
              >
                <div className={`w-14 h-14 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10 relative`}>
                  {getInitials(audit.usuario)}
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{audit.usuario}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center ${getStatusColor('completed')}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
=======
          <div className="space-y-6">
            {audits.map((audit, index) => {
              const estadoNombre: string =
                audit.estados_auditoria?.nombre ?? "";
              const StatusIcon = getStatusIcon(estadoNombre);
              const auditorNombre: string =
                audit.usuarios?.nombre_completo ?? audit.auditor_id ?? "—";
              const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const initials = getInitials(auditorNombre);
              const activoLabel =
                audit.activos?.nombre ?? audit.activos?.codigo_etiqueta ?? "—";
              const fecha = audit.fecha_hora
                ? new Date(audit.fecha_hora).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—";

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
                    {initials}
>>>>>>> sofia
                  </div>

                  <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {auditorNombre}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{fecha}</span>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center ${getStatusColor(estadoNombre)}`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
<<<<<<< HEAD
                        <p className="font-semibold text-gray-900 dark:text-white">{audit.ubicacion}</p>
=======
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {activoLabel}
                        </p>
                        {audit.activos?.codigo_etiqueta &&
                          audit.activos?.nombre && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {audit.activos.codigo_etiqueta}
                            </p>
                          )}
>>>>>>> sofia
                      </div>
                    </div>

<<<<<<< HEAD
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                      <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{audit.actividad}</span>
                    </div>
=======
                    {audit.comentarios && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {audit.comentarios}
                      </p>
                    )}
>>>>>>> sofia
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
