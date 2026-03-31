import { motion } from "motion/react";
import {
  User,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
  Camera,
  FileText,
  Clock,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { activosApi, auditoriasProgramadasApi, auditoriasApi } from "../../../services/api";
import { Skeleton } from "../ui/skeleton";

interface AuditDetailProps {
  auditId: string;
  auditType: "scheduled" | "completed";
  onBack: () => void;
}

const estadoColors = {
  BUENO: {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-700/30",
    icon: CheckCircle2,
  },
  DANADO: {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-700/30",
    icon: AlertTriangle,
  },
  NO_ENCONTRADO: {
    bg: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-700/30",
    icon: XCircle,
  },
};

export function AuditDetail({ auditId, auditType, onBack }: AuditDetailProps) {
  const isScheduled = auditType === "scheduled";
  const [scheduledAudit, setScheduledAudit] = useState<any | null>(null);
  const [isLoadingScheduledAudit, setIsLoadingScheduledAudit] = useState(false);
  const [scheduledAssets, setScheduledAssets] = useState<any[]>([]);
  const [isLoadingScheduledAssets, setIsLoadingScheduledAssets] =
    useState(false);

  useEffect(() => {
    if (!auditId) return;

    let ignore = false;

    if (isScheduled) {
      const loadScheduledAudit = async () => {
        try {
          setIsLoadingScheduledAudit(true);
          const result = await auditoriasProgramadasApi.getById(auditId);
          if (!ignore && result) {
            setScheduledAudit(result);
          }
        } finally {
          if (!ignore) {
            setIsLoadingScheduledAudit(false);
          }
        }
      };
      loadScheduledAudit();
    } else {
      const loadCompletedAudit = async () => {
        try {
          setIsLoadingScheduledAudit(true);
          const result = await auditoriasApi.getById(auditId);
          if (!ignore && result) {
            setScheduledAudit(result);
          }
        } finally {
          if (!ignore) {
            setIsLoadingScheduledAudit(false);
          }
        }
      };
      loadCompletedAudit();
    }

    return () => {
      ignore = true;
    };
  }, [auditId, isScheduled]);

  const scheduledData: any = scheduledAudit ?? {};
  
  // Normalización de datos para modo completado (logs) vs programado
  const data: any = isScheduled
    ? scheduledData
    : {
        ...scheduledAudit,
        id: scheduledAudit?.id,
        titulo:
          scheduledAudit?.auditorias_programadas?.titulo ??
          "Registro de Auditoría Individual",

        // Activo
        activo_codigo: scheduledAudit?.activos?.codigo_etiqueta,
        activo_nombre: scheduledAudit?.activos?.nombre,

        // Estado
        estado_reportado: scheduledAudit?.estados_auditoria?.nombre,

        // Auditor
        auditor: scheduledAudit?.usuarios?.nombre_completo,
        auditor_email: scheduledAudit?.usuarios?.email,

        // Ubicación Jerárquica (Lógica robusta para cualquier tipo de activo)
        campus:
          scheduledAudit?.activos?.oficinas?.pisos?.edificios?.sedes?.nombre ??
          scheduledAudit?.activos?.estantes?.pasillos?.almacenes?.sedes?.nombre ??
          "—",
        edificio:
          scheduledAudit?.activos?.oficinas?.pisos?.edificios?.nombre ??
          scheduledAudit?.activos?.estantes?.pasillos?.almacenes?.nombre ??
          "—",
        piso:
          scheduledAudit?.activos?.oficinas?.pisos?.nombre ??
          scheduledAudit?.activos?.estantes?.pasillos?.nombre ??
          "—",
        salon:
          scheduledAudit?.activos?.oficinas?.nombre ??
          scheduledAudit?.activos?.estantes?.nombre ??
          "—",

        // Metadatos de Sistema
        created_at: scheduledAudit?.fecha_hora,
        updated_at:
          scheduledAudit?.updated_at ??
          scheduledAudit?.auditorias_programadas?.updated_at,
        fecha_inicio:
          scheduledAudit?.fecha_inicio ??
          scheduledAudit?.auditorias_programadas?.fecha_inicio,
        fecha_fin:
          scheduledAudit?.fecha_fin ??
          scheduledAudit?.auditorias_programadas?.fecha_fin,

        // Coordenadas (si existen)
        lat: scheduledAudit?.lat,
        lng: scheduledAudit?.lng,
        coordenadas_gps: scheduledAudit?.coordenadas_gps,
        coincidencia_ubicacion: scheduledAudit?.coincidencia_ubicacion ?? true,
      };

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const scheduledAuditorName =
    scheduledData.usuarios?.nombre_completo ?? scheduledData.auditor ?? "—";
  const scheduledAuditorEmail =
    scheduledData.usuarios?.email ?? scheduledData.auditor_email ?? "—";
  const scheduledDateLabel = scheduledData.fecha_programada
    ? formatDateTime(scheduledData.fecha_programada)
    : `${scheduledData.fecha ?? "—"} a las ${scheduledData.hora ?? "—"}`;
  const scheduledStatusLabel =
    scheduledData.estados_auditoria_programada?.nombre ?? "Pendiente";
  useEffect(() => {
    if (!auditId) return;

    const oficinaId = scheduledData.oficina_id;
    const estanteId = scheduledData.estante_id;

    if (!oficinaId && !estanteId) {
      setScheduledAssets([]);
      return;
    }

    let ignore = false;

    const loadScheduledAssets = async () => {
      try {
        setIsLoadingScheduledAssets(true);
        const response = await activosApi.getList({
          page: 1,
          limit: 100,
          oficinaId,
          estanteId,
        });

        if (!ignore) {
          setScheduledAssets(response.data ?? []);
        }
      } catch {
        if (!ignore) {
          setScheduledAssets([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingScheduledAssets(false);
        }
      }
    };

    loadScheduledAssets();

    return () => {
      ignore = true;
    };
  }, [isScheduled, scheduledData.oficina_id, scheduledData.estante_id]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-full shadow-sm hover:shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </motion.button>
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            {isScheduled
              ? "Auditoría Programada"
              : "Registro de Auditoría Completada"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isScheduled
              ? "Detalles de la auditoría pendiente"
              : "Detalles del registro de auditoría"}
          </p>
        </motion.div>

        {isScheduled && isLoadingScheduledAudit && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left skeleton */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-48" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <div className="space-y-3 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Skeleton className="h-4 w-40" />
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 space-y-4">
                <Skeleton className="h-5 w-40" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            </div>
            {/* Right skeleton */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 space-y-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="space-y-2 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Skeleton className="h-4 w-32" />
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-3 w-full" />
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 space-y-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {(!isScheduled || !isLoadingScheduledAudit) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Main Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                      ID de Auditoría
                    </p>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">
                      {data.id ? data.id.substring(0, 13) + "..." : "—"}
                    </h2>
                  </div>
                  {isScheduled ? (
                    <div className="px-6 py-3 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full font-semibold border-2 border-blue-200 dark:border-blue-700/30">
                      {scheduledStatusLabel}
                    </div>
                  ) : (
                    (() => {
                      const estado = (data.estado_reportado ??
                        "BUENO") as keyof typeof estadoColors;
                      const colors =
                        estadoColors[estado] ?? estadoColors["BUENO"];
                      const IconComponent = colors.icon;
                      return (
                        <div
                          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold border-2 ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{data.estado_reportado ?? "—"}</span>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Location Hierarchy */}
                <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Ubicación Jerárquica
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        Campus:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled
                          ? (scheduledData.campus ?? "—")
                          : data.campus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        Edificio:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled
                          ? (scheduledData.edificio ?? "—")
                          : data.edificio}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        Piso:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled ? (scheduledData.piso ?? "—") : data.piso}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        Salón/Área:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled
                          ? (scheduledData.oficinas?.nombre ??
                            scheduledData.estantes?.nombre ??
                            scheduledData.salon ??
                            "—")
                          : data.salon}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auditor Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                    {(isScheduled
                      ? scheduledAuditorName
                      : (data.auditor ?? "—")
                    )
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {isScheduled ? scheduledAuditorName : data.auditor}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isScheduled ? scheduledAuditorEmail : data.auditor_email}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Scheduled: Assets List */}
              {isScheduled &&
                (() => {
                  const logsAuditados: any[] = Array.isArray(
                    scheduledData.logs_auditoria,
                  )
                    ? scheduledData.logs_auditoria
                    : [];
                  const usingLogs = logsAuditados.length > 0;
                  const displayAssets = usingLogs
                    ? logsAuditados
                    : scheduledAssets;
                  const count = displayAssets.length;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
                    >
                      <h3 className="text-lg font-bold mb-1 dark:text-white">
                        {usingLogs
                          ? "Activos Auditados"
                          : "Activos en Ubicación"}{" "}
                        ({count})
                      </h3>
                      {usingLogs && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                          Registros reales de la auditoría
                        </p>
                      )}
                      {!usingLogs && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                          Activos actualmente en la ubicación asignada
                        </p>
                      )}
                      {isLoadingScheduledAssets && !usingLogs ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cargando activos...
                        </p>
                      ) : count === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No hay activos registrados para esta auditoría.
                        </p>
                      ) : usingLogs ? (
                        <div className="space-y-3">
                          {logsAuditados.map((log, index) => {
                            const estadoNombre: string =
                              log.estados_auditoria?.nombre ?? "—";
                            const estadoColorMap: Record<string, string> = {
                              BUENO: "text-emerald-600 dark:text-emerald-400",
                              DAÑADO: "text-amber-600 dark:text-amber-400",
                              NO_ENCONTRADO: "text-red-600 dark:text-red-400",
                            };
                            const estadoColor =
                              estadoColorMap[estadoNombre.toUpperCase()] ??
                              "text-gray-500 dark:text-gray-400";
                            return (
                              <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                      {log.activos?.codigo_etiqueta ??
                                        log.activo_id}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                      {log.activos?.nombre ?? "Sin nombre"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                      {log.activos?.categorias?.nombre ??
                                        "Sin categoría"}
                                    </p>
                                    {log.comentarios && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                        "{log.comentarios}"
                                      </p>
                                    )}
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <span
                                      className={`text-xs font-semibold ${estadoColor}`}
                                    >
                                      {estadoNombre}
                                    </span>
                                    {log.fecha_hora && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {formatDateTime(log.fecha_hora)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {scheduledAssets.map((activo, index) => (
                            <motion.div
                              key={activo.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.05 }}
                              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {activo.codigo_etiqueta ?? activo.id}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {activo.nombre ?? "Sin nombre"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {activo.categorias?.nombre ??
                                      "Sin categoría"}
                                  </p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })()}

              {/* Completed: Asset Info */}
              {!isScheduled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
                >
                  <h3 className="text-lg font-bold mb-6 dark:text-white">
                    Activo Auditado
                  </h3>
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      Código de Activo
                    </p>
                    <p className="text-2xl font-bold mb-3 dark:text-white">
                      {data.activo_codigo ?? "—"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      {data.activo_nombre ?? "—"}
                    </p>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Duración de auditoría
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.duracion_minutos != null
                          ? `${data.duracion_minutos} minutos`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Date/Time Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <h3 className="text-lg font-bold mb-6 dark:text-white">
                  {isScheduled
                    ? "Fecha y Hora Programada"
                    : "Fecha y Hora de Ejecución"}
                </h3>
                <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                      {isScheduled ? "Programada para" : "Completada el"}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {isScheduled
                        ? scheduledDateLabel
                        : (data.fecha_hora ?? "—")}
                    </p>
                    {isScheduled && isLoadingScheduledAudit && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Actualizando desde base de datos...
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Registros del sistema
                  </p>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Creada: {formatDateTime(data.created_at)}</p>
                    <p>Actualizada: {formatDateTime(data.updated_at)}</p>
                    <p>Inicio: {formatDateTime(data.fecha_inicio)}</p>
                    <p>Cierre: {formatDateTime(data.fecha_fin)}</p>
                  </div>
                </div>
              </motion.div>

              {/* GPS Validation - Only for completed */}
              {!isScheduled && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-bold dark:text-white">
                      Validación PostGIS
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        Coordenadas GPS
                      </p>
                      <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                        {data.coordenadas_gps ?? "—"}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>Lat: {data.lat ?? "—"}</span>
                        <span>Lng: {data.lng ?? "—"}</span>
                      </div>
                    </div>

                    {data.coincidencia_ubicacion ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Ubicación Validada
                          </p>
                        </div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                          Las coordenadas GPS coinciden con la ubicación
                          registrada del activo
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 dark:bg-red-500/20 rounded-2xl border-2 border-red-200 dark:border-red-700/30">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <p className="font-semibold text-red-700 dark:text-red-400">
                            Discrepancia de Ubicación
                          </p>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                          Las coordenadas GPS no coinciden con la ubicación
                          esperada
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Comments/Notes */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isScheduled ? 0.1 : 0.2 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-bold dark:text-white">
                    {isScheduled
                      ? "Notas de Programación"
                      : "Comentarios del Auditor"}
                  </h3>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl min-h-[120px]">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {isScheduled
                      ? (scheduledData.notas ?? "Sin notas de programación.")
                      : data.comentarios || "Sin comentarios adicionales."}
                  </p>
                </div>
              </motion.div>

              {/* Evidence Photo - Only for completed */}
              {!isScheduled && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Camera className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-bold dark:text-white">
                      Evidencia Fotográfica
                    </h3>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center">
                    {data.evidencia_foto_url ? (
                      <img
                        src={data.evidencia_foto_url}
                        alt="Evidencia"
                        className="w-full rounded-xl"
                      />
                    ) : (
                      <div className="py-8">
                        <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          No se adjuntó evidencia fotográfica
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
