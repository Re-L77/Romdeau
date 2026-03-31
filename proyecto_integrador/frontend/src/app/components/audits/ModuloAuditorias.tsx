import { motion } from "motion/react";
import {
  Calendar,
  Clock3,
  MapPin,
  User,
  Plus,
  Filter,
  Search,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  CrearAuditoria,
  AuditFormData,
  AuditoriaFormCatalogs,
  CreateAuditoriaProgramadaDto,
} from "./CrearAuditoria";
import { auditoriasProgramadasApi } from "../../../services/api";
import { Skeleton } from "../ui/skeleton";

interface ModuloAuditoriasProps {
  onScheduledAuditClick: (auditId: string) => void;
  onCompletedAuditClick: (auditId: string) => void;
}

const getStateColor = (estadoNombre: string) => {
  const estado = estadoNombre?.toLowerCase().trim() ?? "";

  if (estado.includes("pendiente") || estado.includes("programada")) {
    return {
      bg: "bg-blue-100 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-700/30",
    };
  }
  if (estado.includes("progreso") || estado.includes("ejecución")) {
    return {
      bg: "bg-amber-100 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-700/30",
    };
  }
  if (estado.includes("completada") || estado.includes("finalizada")) {
    return {
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-700/30",
    };
  }
  if (estado.includes("cancelada") || estado.includes("rechazada")) {
    return {
      bg: "bg-red-100 dark:bg-red-500/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-700/30",
    };
  }

  return {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700/30",
  };
};

export function ModuloAuditorias({
  onScheduledAuditClick,
}: ModuloAuditoriasProps) {
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);
  const [scheduledAudits, setScheduledAudits] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [auditorFilter, setAuditorFilter] = useState("all");
  const [edificioFilter, setEdificioFilter] = useState("all");
  const [sedeFilter, setSedeFilter] = useState("all");

  const [auditores, setAuditores] = useState<any[]>([]);
  const [edificios, setEdificios] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [formCatalogs, setFormCatalogs] = useState<AuditoriaFormCatalogs>({
    auditores: [],
    sedes: [],
  });

  const loadData = useCallback(async () => {
    try {
      setLoadingScheduled(true);
      const [
        auditsData,
        auditoresData,
        edificiosData,
        sedesData,
        estadosData,
        formCatalogsData,
      ] = await Promise.all([
        auditoriasProgramadasApi.getAll(),
        auditoriasProgramadasApi.getAllAuditores?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getAllEdificios?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getAllSedes?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getAllStates?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getFormCatalogs?.() ||
          Promise.resolve({ auditores: [], sedes: [] }),
      ]);

      setScheduledAudits(auditsData);
      setAuditores(auditoresData);
      setEdificios(edificiosData);
      setSedes(sedesData);
      setEstados(estadosData);
      setFormCatalogs(formCatalogsData || { auditores: [], sedes: [] });
    } catch (err) {
      console.error("Error loading audits data:", err);
      setScheduledAudits([]);
    } finally {
      setLoadingScheduled(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAudit = () => setIsCreatingAudit(true);

  const handleSaveAudit = async (formData: CreateAuditoriaProgramadaDto) => {
    try {
      // Guardar en la base de datos
      await auditoriasProgramadasApi.create(formData);

      // Mostrar notificación de éxito
      toast.success(`Auditoría "${formData.titulo}" programada correctamente`);

      // Cerrar el modal
      setIsCreatingAudit(false);

      // Recargar la lista de auditorías
      loadData();
    } catch (error) {
      console.error("Error al guardar auditoría:", error);
      toast.error("Error al guardar la auditoría. Intenta de nuevo.");
    }
  };

  const handleCloseModal = () => setIsCreatingAudit(false);

  const handleResetFilters = () => {
    setSearchTerm("");
    setEstadoFilter("all");
    setAuditorFilter("all");
    setEdificioFilter("all");
    setSedeFilter("all");
  };

  const filteredAudits = scheduledAudits.filter((audit) => {
    if (
      searchTerm &&
      !audit.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !audit.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    if (estadoFilter !== "all") {
      const estadoNombre = audit.estados_auditoria_programada?.nombre ?? "";
      if (estadoNombre.toLowerCase() !== estadoFilter) return false;
    }

    if (auditorFilter !== "all") {
      const auditorNombre = audit.usuarios?.nombre_completo ?? "";
      if (auditorNombre.toLowerCase() !== auditorFilter) return false;
    }

    if (edificioFilter !== "all") {
      const ubicacion = audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "";
      if (ubicacion.toLowerCase() !== edificioFilter) return false;
    }

    if (sedeFilter !== "all") {
      const ubicacion = audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "";
      if (ubicacion.toLowerCase() !== sedeFilter) return false;
    }

    return true;
  });

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Módulo de Auditorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Programación y seguimiento con validación PostGIS
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold dark:text-white">
                Búsqueda y Filtros
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
              onClick={handleCreateAudit}
            >
              <Plus className="w-4 h-4" />
              Crear Auditoría
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Estado: todos</option>
              {estados.map((est: any) => (
                <option key={est.id} value={est.nombre.toLowerCase()}>
                  {est.nombre}
                </option>
              ))}
            </select>
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Auditor: todos</option>
              {auditores.map((auditor: any) => (
                <option
                  key={auditor.id}
                  value={auditor.nombre_completo.toLowerCase()}
                >
                  {auditor.nombre_completo}
                </option>
              ))}
            </select>
            <select
              value={edificioFilter}
              onChange={(e) => setEdificioFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Edificio: todos</option>
              {edificios.map((ed: any) => (
                <option key={ed.id} value={ed.nombre.toLowerCase()}>
                  {ed.nombre}
                </option>
              ))}
            </select>
            <select
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Sede: todas</option>
              {sedes.map((sede: any) => (
                <option key={sede.id} value={sede.nombre.toLowerCase()}>
                  {sede.nombre}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full px-4 py-2.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={handleResetFilters}
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </motion.button>
          </div>
        </motion.div>

        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Auditorías Programadas
          </h2>
          {loadingScheduled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1 mr-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full shrink-0" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay auditorías que coincidan con los filtros aplicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAudits.map((audit, index) => {
                const estadoNombre: string =
                  audit.estados_auditoria_programada?.nombre ?? "Pendiente";
                const estadoColores = getStateColor(estadoNombre);
                const auditorNombre: string =
                  audit.usuarios?.nombre_completo ?? audit.auditor_id ?? "—";
                const fechaProgramada = audit.fecha_programada
                  ? new Date(audit.fecha_programada).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaInicio = audit.fecha_inicio
                  ? new Date(audit.fecha_inicio).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaFin = audit.fecha_fin
                  ? new Date(audit.fecha_fin).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaCreacion = audit.created_at
                  ? new Date(audit.created_at).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaActualizacion = audit.updated_at
                  ? new Date(audit.updated_at).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const ubicacion =
                  audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "—";

                return (
                  <motion.div
                    key={audit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onScheduledAuditClick(audit.id)}
                    className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1 dark:text-white">
                          {audit.titulo}
                        </h3>
                        {audit.descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {audit.descripcion}
                          </p>
                        )}
                        {ubicacion !== "—" && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {ubicacion}
                          </p>
                        )}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap ${estadoColores.bg} ${estadoColores.text} ${estadoColores.border}`}
                      >
                        {estadoNombre}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <User className="w-4 h-4" />
                        <span>{auditorNombre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Programada: {fechaProgramada}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Registros
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Creada: {fechaCreacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Actualizada: {fechaActualizacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Inicio: {fechaInicio}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Cierre: {fechaFin}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isCreatingAudit && (
        <CrearAuditoria
          onClose={handleCloseModal}
          onSave={handleSaveAudit}
          catalogs={formCatalogs}
          existingAudits={scheduledAudits}
        />
      )}
    </main>
  );
}
