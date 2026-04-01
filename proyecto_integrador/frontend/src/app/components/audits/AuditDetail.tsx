import { motion, AnimatePresence } from "motion/react";
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
  Edit3,
  Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  activosApi,
  auditoriasProgramadasApi,
  auditoriasApi,
} from "../../../services/api";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { CrearAuditoria } from "./CrearAuditoria";
import type { CreateAuditoriaProgramadaDto } from "./CrearAuditoria";

interface AuditDetailProps {
  auditId: string;
  auditType: "scheduled" | "completed";
  onBack: () => void;
  onAssetClick?: (assetId: string) => void;
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

export function AuditDetail({
  auditId,
  auditType,
  onBack,
  onAssetClick,
}: AuditDetailProps) {
  const isScheduled = auditType === "scheduled";
  const [scheduledAudit, setScheduledAudit] = useState<any | null>(null);
  const [isLoadingScheduledAudit, setIsLoadingScheduledAudit] = useState(false);
  const [scheduledAssets, setScheduledAssets] = useState<any[]>([]);
  const [isLoadingScheduledAssets, setIsLoadingScheduledAssets] =
    useState(false);

  // Cancel & Edit states
  const [cancelModal, setCancelModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [formCatalogs, setFormCatalogs] = useState<any>(null);

  const handleCancel = async () => {
    setSaving(true);
    try {
      // estado_id 4 = CANCELADA
      await auditoriasProgramadasApi.updateStatus(auditId, 4);
      setScheduledAudit((prev: any) => ({
        ...prev,
        estado_auditoria_programada_id: 4,
        estados_auditoria_programada: { id: 4, nombre: "CANCELADA" },
      }));
      setCancelModal(false);
      toast.success("Auditoría cancelada correctamente");
    } catch (e: any) {
      toast.error(e?.message || "Error al cancelar la auditoría");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = async () => {
    try {
      if (!formCatalogs) {
        const catalogs = await auditoriasProgramadasApi.getFormCatalogs();
        setFormCatalogs(catalogs);
      }
      setEditModal(true);
    } catch {
      toast.error("Error al cargar catálogos para edición");
    }
  };

  const handleSaveEdit = async (formData: CreateAuditoriaProgramadaDto) => {
    try {
      const updated = await auditoriasProgramadasApi.update(auditId, formData);
      setScheduledAudit((prev: any) => ({ ...prev, ...updated }));
      setEditModal(false);
      toast.success("Auditoría actualizada correctamente");
    } catch (e: any) {
      toast.error(e?.message || "Error al actualizar la auditoría");
    }
  };

  useEffect(() => {
    if (!auditId) return;

    let ignore = false;

    const loadAudit = async () => {
      try {
        setIsLoadingScheduledAudit(true);
        const result = isScheduled
          ? await auditoriasProgramadasApi.getById(auditId)
          : await auditoriasApi.getById(auditId);
        if (!ignore && result) {
          setScheduledAudit(result);
        }
      } finally {
        if (!ignore) {
          setIsLoadingScheduledAudit(false);
        }
      }
    };

    loadAudit();

    return () => {
      ignore = true;
    };
  }, [auditId, isScheduled]);

  const scheduledData: any = scheduledAudit ?? {};

  // Normalización de datos para modo completado (logs) vs programado
  const data: any = isScheduled
    ? scheduledData
    : {
        ...scheduledData,
        id: scheduledData?.id,
        titulo:
          scheduledData?.auditorias_programadas?.titulo ??
          "Registro de Auditoría Individual",

        // Activo
        activo_id: scheduledData?.activo_id ?? scheduledData?.activos?.id,
        activo_codigo: scheduledData?.activos?.codigo_etiqueta,
        activo_nombre: scheduledData?.activos?.nombre,

        // Estado
        estado_reportado: scheduledData?.estados_auditoria?.nombre,

        // Auditor
        auditor: scheduledData?.usuarios?.nombre_completo,
        auditor_email: scheduledData?.usuarios?.email,

        // Ubicación Jerárquica (Lógica robusta)
        campus:
          scheduledData?.activos?.oficinas?.pisos?.edificios?.sedes?.nombre ??
          scheduledData?.activos?.estantes?.pasillos?.almacenes?.sedes
            ?.nombre ??
          "—",
        edificio:
          scheduledData?.activos?.oficinas?.pisos?.edificios?.nombre ??
          scheduledData?.activos?.estantes?.pasillos?.almacenes?.nombre ??
          "—",
        piso:
          scheduledData?.activos?.oficinas?.pisos?.nombre ??
          scheduledData?.activos?.estantes?.pasillos?.nombre ??
          "—",
        salon:
          scheduledData?.activos?.oficinas?.nombre ??
          scheduledData?.activos?.estantes?.nombre ??
          "—",

        // Metadatos
        created_at: scheduledData?.fecha_hora,
        updated_at:
          scheduledData?.updated_at ??
          scheduledData?.auditorias_programadas?.updated_at,
        fecha_inicio:
          scheduledData?.fecha_inicio ??
          scheduledData?.auditorias_programadas?.fecha_inicio,
        fecha_fin:
          scheduledData?.fecha_fin ??
          scheduledData?.auditorias_programadas?.fecha_fin,

        // Posicionamiento
        lat: scheduledData?.lat,
        lng: scheduledData?.lng,
        coincidencia_ubicacion: scheduledData?.coincidencia_ubicacion ?? true,
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
  const scheduledStatusRaw =
    scheduledData.estados_auditoria_programada?.nombre ?? "PROGRAMADA";
  const scheduledStatusLabel = scheduledStatusRaw;
  const canEdit = isScheduled && scheduledStatusRaw === "PROGRAMADA";
  const canCancel =
    isScheduled &&
    (scheduledStatusRaw === "PROGRAMADA" ||
      scheduledStatusRaw === "EN PROGRESO");

  // Extraer ubicación desde oficina o estante
  const getScheduledLocation = () => {
    const location = {
      type: "unknown",
      campus: "—",
      level2: "—",
      level3: "—",
      level4: "—",
      level2Label: "Edificio",
      level3Label: "Piso",
      level4Label: "Salón/Área",
    };

    if (scheduledData.oficinas?.pisos?.edificios?.sedes) {
      location.type = "oficina";
      location.level4 = scheduledData.oficinas.nombre ?? "—";
      location.campus =
        scheduledData.oficinas.pisos.edificios.sedes.nombre ?? "—";
      location.level2 = scheduledData.oficinas.pisos.edificios.nombre ?? "—";
      location.level3 = scheduledData.oficinas.pisos.nombre ?? "—";
    } else if (scheduledData.estantes?.pasillos?.almacenes?.sedes) {
      location.type = "estante";
      location.level2Label = "Almacén";
      location.level3Label = "Pasillo";
      location.level4Label = "Estante";
      location.level4 = scheduledData.estantes.nombre ?? "—";
      location.campus =
        scheduledData.estantes.pasillos.almacenes.sedes.nombre ?? "—";
      location.level2 = scheduledData.estantes.pasillos.almacenes.nombre ?? "—";
      location.level3 = scheduledData.estantes.pasillos.nombre ?? "—";
    } else if (scheduledData.estante_id) {
      location.type = "estante";
      location.level2Label = "Almacén";
      location.level3Label = "Pasillo";
      location.level4Label = "Estante";
    } else if (scheduledData.oficina_id) {
      location.type = "oficina";
    }

    return location;
  };

  const scheduledLocation = getScheduledLocation();

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
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-max lg:auto-rows-auto">
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
                    <h2 className="text-3xl font-bold mb-2 dark:text-white">
                      {isScheduled
                        ? (scheduledData.titulo ?? "—")
                        : (data.activo_nombre ?? "—")}
                    </h2>
                    {isScheduled && scheduledData.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {scheduledData.descripcion}
                      </p>
                    )}
                    {isScheduled && (
                      <div className="flex flex-wrap gap-2">
                        {scheduledData.oficinas ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            Oficina: {scheduledData.oficinas.nombre}
                          </span>
                        ) : scheduledData.estantes ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                            Estante: {scheduledData.estantes.nombre}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {isScheduled
                    ? (() => {
                        const statusColorMap: Record<string, string> = {
                          PROGRAMADA:
                            "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30",
                          "EN PROGRESO":
                            "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/30",
                          COMPLETADA:
                            "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30",
                          CANCELADA:
                            "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700/30",
                          VENCIDA:
                            "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700/30",
                        };
                        const statusClasses =
                          statusColorMap[scheduledStatusRaw] ??
                          statusColorMap["PROGRAMADA"];
                        return (
                          <div
                            className={`px-6 py-3 rounded-full font-semibold border-2 ${statusClasses}`}
                          >
                            {scheduledStatusLabel}
                          </div>
                        );
                      })()
                    : (() => {
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
                      })()}
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
                        Sede:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled ? scheduledLocation.campus : data.campus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        {isScheduled
                          ? `${scheduledLocation.level2Label}:`
                          : "Edificio:"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled ? scheduledLocation.level2 : data.edificio}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        {isScheduled
                          ? `${scheduledLocation.level3Label}:`
                          : "Piso:"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled ? scheduledLocation.level3 : data.piso}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                        {isScheduled
                          ? `${scheduledLocation.level4Label}:`
                          : "Salón/Área:"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isScheduled
                          ? (scheduledData.oficinas?.nombre ??
                            scheduledData.estantes?.nombre ??
                            scheduledLocation.level4 ??
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
                                onClick={() => {
                                  const id = log.activos?.id ?? log.activo_id;
                                  if (id && onAssetClick) onAssetClick(id);
                                }}
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
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
                              onClick={() => onAssetClick?.(activo.id)}
                              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
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
                  <div
                    className={`p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl ${data.activo_id ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" : ""}`}
                    onClick={() => {
                      if (data.activo_id && onAssetClick)
                        onAssetClick(data.activo_id);
                    }}
                  >
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

              {/* Actions - Only for scheduled */}
              {isScheduled && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
                >
                  <h2 className="text-xl font-bold mb-6 dark:text-white">
                    Acciones
                  </h2>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenEdit}
                      disabled={!canEdit}
                      className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar Auditoría
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCancelModal(true)}
                      disabled={!canCancel}
                      className="w-full px-6 py-4 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full font-medium hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Ban className="w-4 h-4" />
                      Cancelar Auditoría
                    </motion.button>
                    {!canCancel && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
                        Solo se pueden modificar auditorías con estado
                        PROGRAMADA o EN PROGRESO.
                      </p>
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

      {/* === MODAL: Cancel Confirmation === */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={() => setCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold dark:text-white mb-2">
                ¿Cancelar auditoría?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                La auditoría{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {scheduledData.titulo}
                </span>{" "}
                será cancelada. Esta acción no puede revertirse.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCancelModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium"
                >
                  Volver
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Cancelando..." : "Confirmar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === MODAL: Edit Audit === */}
      {editModal && formCatalogs && (
        <CrearAuditoria
          onClose={() => setEditModal(false)}
          onSave={handleSaveEdit}
          catalogs={formCatalogs}
          editData={scheduledData}
        />
      )}
    </div>
  );
}
