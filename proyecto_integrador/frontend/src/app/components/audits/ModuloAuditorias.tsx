import { motion } from "motion/react";
import { Calendar, MapPin, User, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CrearAuditoria, AuditFormData } from "./CrearAuditoria";
import { mockDB } from "../../data/mockData";
import { auditoriasProgramadasApi } from "../../../services/api";

interface ModuloAuditoriasProps {
  onScheduledAuditClick: (auditId: string) => void;
  onCompletedAuditClick: (auditId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _scheduledAuditsMock = [];

const getStateColor = (estadoNombre: string) => {
  const estado = estadoNombre?.toLowerCase().trim() ?? "";

  // Mapeo semántico de estados a colores
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
  // Color por defecto
  return {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700/30",
  };
};

export function ModuloAuditorias({
  onScheduledAuditClick,
  onCompletedAuditClick,
}: ModuloAuditoriasProps) {
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);
  const [scheduledAudits, setScheduledAudits] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(true);

  useEffect(() => {
    auditoriasProgramadasApi
      .getAll()
      .then(setScheduledAudits)
      .catch(() => setScheduledAudits([]))
      .finally(() => setLoadingScheduled(false));
  }, []);

  const handleCreateAudit = () => {
    setIsCreatingAudit(true);
  };

  const handleSaveAudit = (formData: AuditFormData) => {
    // Obtener información adicional para mostrar la confirmación
    const sede = mockDB.sedes.find((s) => s.id === formData.sede_id);
    const auditor = mockDB.usuarios.find((u) => u.id === formData.auditor_id);

    let ubicacionTexto = "";
    if (formData.tipo_ubicacion === "oficina" && formData.oficina_id) {
      const oficina = mockDB.oficinas.find((o) => o.id === formData.oficina_id);
      const piso = mockDB.pisos.find((p) => p.id === oficina?.piso_id);
      const edificio = mockDB.edificios.find((e) => e.id === piso?.edificio_id);
      ubicacionTexto = `${sede?.nombre} → ${edificio?.nombre} → ${piso?.nombre} → ${oficina?.nombre}`;
    } else if (formData.tipo_ubicacion === "estante" && formData.estante_id) {
      const estante = mockDB.estantes.find((e) => e.id === formData.estante_id);
      const pasillo = mockDB.pasillos.find((p) => p.id === estante?.pasillo_id);
      const almacen = mockDB.almacenes.find(
        (a) => a.id === pasillo?.almacen_id,
      );
      ubicacionTexto = `${sede?.nombre} → ${almacen?.nombre} → ${pasillo?.nombre} → ${estante?.nombre}`;
    }

    console.log("Nueva auditoría programada:", {
      ...formData,
      ubicacion_texto: ubicacionTexto,
      auditor_nombre: auditor?.nombre_completo,
    });

    alert(
      `✅ Auditoría programada exitosamente\n\n📍 Ubicación: ${ubicacionTexto}\n👤 Auditor: ${auditor?.nombre_completo}\n📅 Fecha: ${formData.fecha} a las ${formData.hora}\n📦 Activos: ${formData.activos_programados.length}`,
    );

    setIsCreatingAudit(false);
  };

  const handleCloseModal = () => {
    setIsCreatingAudit(false);
  };

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Módulo de Auditorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Programación y seguimiento con validación PostGIS
          </p>
        </div>

        {/* Schedule Audit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">
              Programar Nueva Auditoría
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
              onClick={handleCreateAudit}
            >
              <Plus className="w-4 h-4" />
              Crear Auditoría
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campus
              </label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                <option>Campus Central</option>
                <option>Campus Norte</option>
                <option>Campus Sur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edificio
              </label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                <option>Edificio Administrativo A</option>
                <option>Edificio Administrativo B</option>
                <option>Data Center Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auditor Asignado
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <select className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                  <option>Ana Gutiérrez</option>
                  <option>Jorge Pérez</option>
                  <option>María Rodríguez</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha y Hora
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="datetime-local"
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scheduled Audits */}
        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Auditorías Programadas
          </h2>
          {loadingScheduled ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Cargando auditorías...
            </div>
          ) : scheduledAudits.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay auditorías programadas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledAudits.map((audit, index) => {
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
                        <span>{fechaProgramada}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Crear Auditoría */}
      {isCreatingAudit && (
        <CrearAuditoria onClose={handleCloseModal} onSave={handleSaveAudit} />
      )}
    </main>
  );
}
