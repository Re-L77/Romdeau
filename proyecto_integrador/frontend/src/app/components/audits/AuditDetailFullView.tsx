import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
  Camera,
  FileText,
  Clock,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { auditoriasApi } from "../../../services/api";
import { Skeleton } from "../ui/skeleton";

interface AuditDetailFullViewProps {
  auditId: string;
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

export function AuditDetailFullView({ auditId, onBack }: AuditDetailFullViewProps) {
  const [auditData, setAuditData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAudit = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await auditoriasApi.getById(auditId);
        if (result) {
          setAuditData(result);
        } else {
          setError("No se encontró la información detallada de la auditoría.");
        }
      } catch (err) {
        setError("Error al cargar los detalles desde el servidor.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAudit();
    window.scrollTo(0, 0);
  }, [auditId]);

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return value;
    }
  };

  const data = auditData ? {
    ...auditData,
    titulo: auditData.auditorias_programadas?.titulo ?? "Registro de Auditoría Completada",
    activo_codigo: auditData.activos?.codigo_etiqueta,
    activo_nombre: auditData.activos?.nombre,
    activo_categoria: auditData.activos?.categorias?.nombre,
    estado_reportado: auditData.estados_auditoria?.nombre,
    auditor: auditData.usuarios?.nombre_completo,
    auditor_email: auditData.usuarios?.email,
    campus: auditData.activos?.oficinas?.pisos?.edificios?.sedes?.nombre ??
            auditData.activos?.estantes?.pasillos?.almacenes?.sedes?.nombre ?? "—",
    edificio: auditData.activos?.oficinas?.pisos?.edificios?.nombre ??
              auditData.activos?.estantes?.pasillos?.almacenes?.nombre ?? "—",
    piso: auditData.activos?.oficinas?.pisos?.nombre ??
          auditData.activos?.estantes?.pasillos?.nombre ?? "—",
    salon: auditData.activos?.oficinas?.nombre ??
           auditData.activos?.estantes?.nombre ?? "—",
    created_at: auditData.fecha_hora,
    lat: auditData.lat,
    lng: auditData.lng,
    coincidencia_ubicacion: auditData.coincidencia_ubicacion ?? true,
    comentarios: auditData.comentarios,
    evidencia_foto_url: auditData.evidencia_foto_url,
    duracion_minutos: auditData.duracion_minutos,
  } : null;

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto py-20 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-xl font-bold dark:text-white mb-6 text-balance">{error}</p>
        <button onClick={onBack} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold transition-transform hover:scale-105 active:scale-95">
          Volver al Historial
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-full shadow-sm hover:shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all mb-4 border border-gray-100 dark:border-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </motion.button>
        <h1 className="text-3xl font-bold mb-2 dark:text-white leading-tight">
          Registro de Auditoría Completada
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detalles del registro de auditoría técnica recolectada en campo
        </p>
      </motion.div>

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
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-3xl font-bold mb-2 dark:text-white truncate">
                  {data.activo_nombre || "—"}
                </h2>
                <div className="flex flex-wrap gap-2">
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                     ID: {data.id?.split('-')[0].toUpperCase()}
                   </span>
                </div>
              </div>
              {(() => {
                const estado = (data.estado_reportado ?? "BUENO") as keyof typeof estadoColors;
                const colors = estadoColors[estado] ?? estadoColors.BUENO;
                const IconComponent = colors.icon;
                return (
                  <div
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold border-2 shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{data.estado_reportado || "—"}</span>
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
                {[
                  { label: "Sede:", value: data.campus },
                  { label: "Edificio:", value: data.edificio },
                  { label: "Piso:", value: data.piso },
                  { label: "Salón/Área:", value: data.salon },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-lg shrink-0">
                {data.auditor?.split(" ").map((n: string) => n[0]).join("") || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {data.auditor}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {data.auditor_email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Activo Box */}
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
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-bold uppercase tracking-widest">
                Código de Activo
              </p>
              <p className="text-2xl font-bold mb-3 dark:text-white">
                {data.activo_codigo || "—"}
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 truncate">
                {data.activo_nombre || "—"}
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Execution Time */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <h3 className="text-lg font-bold mb-6 dark:text-white">
              Fecha y Hora de Ejecución
            </h3>
            <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                  Completada el
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatDateTime(data.fecha_hora)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
               <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                 <FileText className="w-4 h-4 text-emerald-500" /> Registros del sistema
               </p>
               <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Iniciado:</span>
                    <span>{formatDateTime(data.fecha_inicio)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Cerrado:</span>
                    <span>{formatDateTime(data.fecha_fin)}</span>
                  </p>
               </div>
            </div>
          </motion.div>

          {/* GPS Validation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold dark:text-white">
                Validación Geo-Referencial
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-bold uppercase tracking-widest">
                  Coordenadas GPS
                </p>
                <p className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                   {data.lat && data.lng ? `${data.lat}, ${data.lng}` : "—"}
                </p>
              </div>

              {data.coincidencia_ubicacion ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700/30">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-bold">Ubicación Validada</p>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                    Las coordenadas coinciden con la ubicación registrada del activo.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-500/20 rounded-2xl border-2 border-red-200 dark:border-red-700/30">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-bold">Discrepancia de Ubicación</p>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                    Las coordenadas no coinciden con la ubicación esperada.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Comments/Notes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-bold dark:text-white">
                Comentarios del Auditor
              </h3>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl min-h-[100px]">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "{data.comentarios || "Sin comentarios adicionales registrados."}"
              </p>
            </div>
          </motion.div>

          {/* Evidence Photo */}
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
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
              {data.evidencia_foto_url ? (
                <div className="group relative">
                  <img
                    src={data.evidencia_foto_url}
                    alt="Evidencia"
                    className="w-full h-auto object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/30">Ampliar</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    No se adjuntó evidencia fotográfica en este registro.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
