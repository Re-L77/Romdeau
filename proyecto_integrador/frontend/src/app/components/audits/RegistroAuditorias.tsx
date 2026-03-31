import { motion } from "motion/react";
import {
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
  Filter,
  Search,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../../../services/api";
import { ExportarReporte, ExportFormData } from "../reports/ExportarReporte";

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

interface RegistroAuditoriasProps {
  onAuditClick: (auditId: string) => void;
}

// Helper function to extract location information from nested data
function getLocationInfo(activo: any, auditoriaProgramada: any) {
  // Priorizar ubicación de la auditoría programada (donde se realizó)
  if (auditoriaProgramada) {
    // Si la auditoría programada fue en una oficina
    if (auditoriaProgramada.oficinas?.pisos?.edificios?.sedes) {
      return {
        type: "oficina",
        sede: auditoriaProgramada.oficinas.pisos.edificios.sedes.nombre || "",
        nivel2: auditoriaProgramada.oficinas.pisos.edificios.nombre || "",
        nivel3: auditoriaProgramada.oficinas.pisos.nombre || "",
        nivel4: auditoriaProgramada.oficinas.nombre || "",
        label2: "Edificio",
        label3: "Piso",
        label4: "Salón",
      };
    }

    // Si la auditoría programada fue en un estante
    if (auditoriaProgramada.estantes?.pasillos?.almacenes?.sedes) {
      return {
        type: "estante",
        sede:
          auditoriaProgramada.estantes.pasillos.almacenes.sedes.nombre || "",
        nivel2: auditoriaProgramada.estantes.pasillos.almacenes.nombre || "",
        nivel3: auditoriaProgramada.estantes.pasillos.nombre || "",
        nivel4: auditoriaProgramada.estantes.nombre || "",
        label2: "Almacén",
        label3: "Pasillo",
        label4: "Estante",
      };
    }
  }

  // Fallback a la ubicación actual del activo
  if (!activo)
    return {
      type: "desconocido",
      sede: "",
      nivel2: "",
      nivel3: "",
      nivel4: "",
      label2: "",
      label3: "",
      label4: "",
    };

  // If it's an oficina (has pisos/edificios/sedes hierarchy)
  if (activo.oficinas?.pisos?.edificios?.sedes) {
    return {
      type: "oficina",
      sede: activo.oficinas.pisos.edificios.sedes.nombre || "",
      nivel2: activo.oficinas.pisos.edificios.nombre || "",
      nivel3: activo.oficinas.pisos.nombre || "",
      nivel4: activo.oficinas.nombre || "",
      label2: "Edificio",
      label3: "Piso",
      label4: "Salón",
    };
  }

  // If it's an estante (has pasillos/almacenes/sedes hierarchy)
  if (activo.estantes?.pasillos?.almacenes?.sedes) {
    return {
      type: "estante",
      sede: activo.estantes.pasillos.almacenes.sedes.nombre || "",
      nivel2: activo.estantes.pasillos.almacenes.nombre || "",
      nivel3: activo.estantes.pasillos.nombre || "",
      nivel4: activo.estantes.nombre || "",
      label2: "Almacén",
      label3: "Pasillo",
      label4: "Estante",
    };
  }

  return {
    type: "desconocido",
    sede: "",
    nivel2: "",
    nivel3: "",
    nivel4: "",
    label2: "",
    label3: "",
    label4: "",
  };
}

// Helper function to transform API response into display format
function formatAuditLog(log: any) {
  const location = getLocationInfo(log.activos, log.auditorias_programadas);

  return {
    ...log,
    activo_codigo: log.activos?.codigo_etiqueta || "",
    activo_nombre: log.activos?.nombre || "",
    locationType: location.type,
    campus: location.sede,
    nivel2: location.nivel2,
    nivel3: location.nivel3,
    nivel4: location.nivel4,
    label2: location.label2,
    label3: location.label3,
    label4: location.label4,
    auditor: log.usuarios?.nombre_completo || "",
    estado_reportado: log.estados_auditoria?.nombre || "",
  };
}

export function RegistroAuditorias({ onAuditClick }: RegistroAuditoriasProps) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sedeFilter, setSedeFilter] = useState<string>("all");
  const [auditorFilter, setAuditorFilter] = useState<string>("all");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Cargar datos desde la API
  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setIsLoading(true);
        const rawData = await apiClient.get("/api/auditorias");
        const formattedData = Array.isArray(rawData)
          ? rawData.map((log) => formatAuditLog(log))
          : [];
        setAuditLogs(formattedData);
      } catch (error) {
        console.error("Error al cargar auditorías:", error);
        setAuditLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
  };

  const handleExport = (exportData: ExportFormData) => {
    console.log("Exportando reporte con configuración:", exportData);

    // Simular descarga
    const fileName = `Reporte_Auditorias_${new Date().toISOString().split("T")[0]}.${exportData.formato.toLowerCase()}`;

    alert(
      `✅ Reporte generado exitosamente\n\n📄 Formato: ${exportData.formato}\n📅 Período: ${exportData.periodo}\n📊 Agrupado por: ${exportData.agrupar_por}\n🔍 Filtro: ${exportData.filtro_estado}\n📸 Incluye fotos: ${exportData.incluir_fotos ? "Sí" : "No"}\n📍 Incluye GPS: ${exportData.incluir_coordenadas ? "Sí" : "No"}\n💬 Incluye comentarios: ${exportData.incluir_comentarios ? "Sí" : "No"}\n\n📥 Archivo: ${fileName}`,
    );

    setIsExportModalOpen(false);
  };

  // Extract unique values
  const statuses = [
    "all",
    ...new Set(auditLogs.map((a) => a.estado_reportado)),
  ];
  const sedes = ["all", ...new Set(auditLogs.map((a) => a.campus))];
  const auditors = ["all", ...new Set(auditLogs.map((a) => a.auditor))];

  // Filter logic
  const filteredLogs = auditLogs.filter((log) => {
    if (
      searchTerm &&
      !log.activo_codigo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.activo_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && log.estado_reportado !== statusFilter)
      return false;
    if (sedeFilter !== "all" && log.campus !== sedeFilter) return false;
    if (auditorFilter !== "all" && log.auditor !== auditorFilter) return false;
    return true;
  });

  // Stats
  const stats = {
    total: auditLogs.length,
    bueno: auditLogs.filter((l) => l.estado_reportado === "BUENO").length,
    danado: auditLogs.filter((l) => l.estado_reportado === "DANADO").length,
    no_encontrado: auditLogs.filter(
      (l) => l.estado_reportado === "NO_ENCONTRADO",
    ).length,
    gps_validados: auditLogs.filter((l) => l.coincidencia_ubicacion).length,
  };

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Registro de Auditorías (logs_auditoria)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historial completo de auditorías realizadas -{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {filteredLogs.length} de {auditLogs.length} registros
            </span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              Total Auditorías
            </p>
            <p className="text-3xl font-bold dark:text-white">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              Estado: BUENO
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.bueno}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              Estado: DAÑADO
            </p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats.danado}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              NO ENCONTRADO
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.no_encontrado}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              GPS Validados
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.gps_validados}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold dark:text-white">
                Filtros y Búsqueda
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
              onClick={handleOpenExportModal}
            >
              <Download className="w-4 h-4" />
              Exportar Reporte
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar activo..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "Todos los estados" : status}
                </option>
              ))}
            </select>

            {/* Sede Filter */}
            <select
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {sedes.map((sede) => (
                <option key={sede} value={sede}>
                  {sede === "all" ? "Todas las sedes" : sede}
                </option>
              ))}
            </select>

            {/* Auditor Filter */}
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {auditors.map((auditor) => (
                <option key={auditor} value={auditor}>
                  {auditor === "all" ? "Todos los auditores" : auditor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Cargando auditorías...
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No hay auditorías que coincidan con los filtros
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => {
              const estadoConfig =
                estadoColors[log.estado_reportado as keyof typeof estadoColors];
              const IconComponent = estadoConfig.icon;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onAuditClick(log.id)}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Activo
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {log.activo_codigo}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {log.activo_nombre}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Ubicación Jerárquica
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Sede: {log.campus}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {log.label2}: {log.nivel2}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {log.label3}: {log.nivel3}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                          {log.label4}: {log.nivel4}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Auditor
                        </p>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {log.auditor}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Fecha y Hora
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {log.fecha_hora}
                          </p>
                        </div>
                        {log.coincidencia_ubicacion && (
                          <div className="flex items-center gap-1 mt-1">
                            <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              GPS Validado
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        <div
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border}`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span>{log.estado_reportado.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {log.comentarios && (
                    <div
                      className={`mt-4 p-4 rounded-2xl border-2 ${estadoConfig.bg} ${estadoConfig.border}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 ${estadoConfig.text}`}
                        />
                        <p className={`text-sm ${estadoConfig.text}`}>
                          {log.comentarios}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Exportar Reporte */}
      {isExportModalOpen && (
        <ExportarReporte
          onClose={handleCloseExportModal}
          onExport={handleExport}
        />
      )}
    </main>
  );
}
