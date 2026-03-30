import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  MapPin,
  User,
  Clock,
  Package,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { activosApi } from "../../../services/api";

interface AuditorCatalogItem {
  id: string;
  nombre_completo: string;
  email?: string;
}

interface OficinaCatalogItem {
  id: string;
  nombre: string;
}

interface PisoCatalogItem {
  id: string;
  nombre: string;
  oficinas: OficinaCatalogItem[];
}

interface EdificioCatalogItem {
  id: string;
  nombre: string;
  pisos: PisoCatalogItem[];
}

interface EstanteCatalogItem {
  id: string;
  nombre: string;
}

interface PasilloCatalogItem {
  id: string;
  nombre: string;
  estantes: EstanteCatalogItem[];
}

interface AlmacenCatalogItem {
  id: string;
  nombre: string;
  pasillos: PasilloCatalogItem[];
}

interface SedeCatalogItem {
  id: string;
  nombre: string;
  edificios: EdificioCatalogItem[];
  almacenes: AlmacenCatalogItem[];
}

interface ActivoCatalogItem {
  id: string;
  codigo_etiqueta?: string;
  nombre?: string;
}

export interface AuditoriaFormCatalogs {
  auditores: AuditorCatalogItem[];
  sedes: SedeCatalogItem[];
}

interface CrearAuditoriaProps {
  onClose: () => void;
  onSave: (auditData: AuditFormData) => void;
  catalogs: AuditoriaFormCatalogs;
}

export interface AuditFormData {
  titulo: string;
  descripcion?: string;
  sede_id: string;
  edificio_id?: string;
  piso_id?: string;
  oficina_id?: string;
  almacen_id?: string;
  pasillo_id?: string;
  estante_id?: string;
  auditor_id: string;
  fecha_programada?: string;
  hora: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_ubicacion: "oficina" | "estante";
  activos_programados: string[];
}

export function CrearAuditoria({
  onClose,
  onSave,
  catalogs,
}: CrearAuditoriaProps) {
  const [formData, setFormData] = useState<AuditFormData>({
    titulo: "",
    descripcion: "",
    sede_id: "",
    auditor_id: "",
    hora: "",
    fecha_inicio: "",
    fecha_fin: "",
    tipo_ubicacion: "oficina",
    activos_programados: [],
  });

  const [selectedSede, setSelectedSede] = useState("");
  const [selectedEdificio, setSelectedEdificio] = useState("");
  const [selectedPiso, setSelectedPiso] = useState("");
  const [selectedAlmacen, setSelectedAlmacen] = useState("");
  const [selectedPasillo, setSelectedPasillo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activosDisponibles, setActivosDisponibles] = useState<
    ActivoCatalogItem[]
  >([]);
  const [step, setStep] = useState<"form" | "summary">("form");
  const [loadingActivos, setLoadingActivos] = useState(false);

  const sedeSeleccionada =
    catalogs.sedes.find((sede) => sede.id === selectedSede) || null;
  const edificiosFiltrados = sedeSeleccionada?.edificios || [];
  const edificioSeleccionado =
    edificiosFiltrados.find((edificio) => edificio.id === selectedEdificio) ||
    null;
  const pisosFiltrados = edificioSeleccionado?.pisos || [];
  const pisoSeleccionado =
    pisosFiltrados.find((piso) => piso.id === selectedPiso) || null;
  const oficinasFiltradas = pisoSeleccionado?.oficinas || [];

  const almacenesFiltrados = sedeSeleccionada?.almacenes || [];
  const almacenSeleccionado =
    almacenesFiltrados.find((almacen) => almacen.id === selectedAlmacen) ||
    null;
  const pasillosFiltrados = almacenSeleccionado?.pasillos || [];
  const pasilloSeleccionado =
    pasillosFiltrados.find((pasillo) => pasillo.id === selectedPasillo) || null;
  const estantesFiltrados = pasilloSeleccionado?.estantes || [];

  const auditores = catalogs.auditores || [];

  const TITULO_MAX = 100;
  const DESCRIPCION_MAX = 300;

  // Actualizar formData cuando cambian las selecciones
  useEffect(() => {
    setFormData((prev) => ({ ...prev, sede_id: selectedSede }));
  }, [selectedSede]);

  useEffect(() => {
    if (formData.tipo_ubicacion === "oficina") {
      setFormData((prev) => ({
        ...prev,
        edificio_id: selectedEdificio,
        almacen_id: undefined,
        pasillo_id: undefined,
        estante_id: undefined,
      }));
    }
  }, [selectedEdificio, formData.tipo_ubicacion]);

  useEffect(() => {
    if (formData.tipo_ubicacion === "oficina") {
      setFormData((prev) => ({
        ...prev,
        piso_id: selectedPiso,
      }));
    }
  }, [selectedPiso, formData.tipo_ubicacion]);

  useEffect(() => {
    if (formData.tipo_ubicacion === "estante") {
      setFormData((prev) => ({
        ...prev,
        almacen_id: selectedAlmacen,
        edificio_id: undefined,
        piso_id: undefined,
        oficina_id: undefined,
      }));
    }
  }, [selectedAlmacen, formData.tipo_ubicacion]);

  useEffect(() => {
    if (formData.tipo_ubicacion === "estante") {
      setFormData((prev) => ({
        ...prev,
        pasillo_id: selectedPasillo,
      }));
    }
  }, [selectedPasillo, formData.tipo_ubicacion]);

  useEffect(() => {
    const loadActivos = async () => {
      setLoadingActivos(true);
      try {
        if (formData.tipo_ubicacion === "oficina" && formData.oficina_id) {
          const response = await activosApi.getList({
            oficinaId: formData.oficina_id,
            page: 1,
            limit: 500,
          });
          setActivosDisponibles(response.data || []);
          return;
        }

        if (formData.tipo_ubicacion === "estante" && formData.estante_id) {
          const response = await activosApi.getList({
            estanteId: formData.estante_id,
            page: 1,
            limit: 500,
          });
          setActivosDisponibles(response.data || []);
          return;
        }

        setActivosDisponibles([]);
      } catch {
        setActivosDisponibles([]);
      } finally {
        setLoadingActivos(false);
      }
    };

    loadActivos();
  }, [formData.tipo_ubicacion, formData.oficina_id, formData.estante_id]);

  const handleTipoUbicacionChange = (tipo: "oficina" | "estante") => {
    setFormData({
      ...formData,
      tipo_ubicacion: tipo,
      edificio_id: undefined,
      piso_id: undefined,
      oficina_id: undefined,
      almacen_id: undefined,
      pasillo_id: undefined,
      estante_id: undefined,
      activos_programados: [],
    });
    setSelectedEdificio("");
    setSelectedPiso("");
    setSelectedAlmacen("");
    setSelectedPasillo("");
  };

  const handleToggleActivo = (activoId: string) => {
    setFormData((prev) => ({
      ...prev,
      activos_programados: prev.activos_programados.includes(activoId)
        ? prev.activos_programados.filter((id) => id !== activoId)
        : [...prev.activos_programados, activoId],
    }));
  };

  const handleSelectAllActivos = () => {
    const todosLosIds = activosDisponibles.map((a) => a.id);
    setFormData((prev) => ({
      ...prev,
      activos_programados: todosLosIds,
    }));
  };

  const handleDeselectAllActivos = () => {
    setFormData((prev) => ({
      ...prev,
      activos_programados: [],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    } else if (formData.titulo.trim().length > TITULO_MAX) {
      newErrors.titulo = `El título no puede superar ${TITULO_MAX} caracteres`;
    }

    if (formData.descripcion && formData.descripcion.length > DESCRIPCION_MAX) {
      newErrors.descripcion = `La descripción no puede superar ${DESCRIPCION_MAX} caracteres`;
    }

    if (!formData.sede_id) newErrors.sede = "Selecciona una sede";
    if (!formData.auditor_id) newErrors.auditor = "Selecciona un auditor";
    if (!formData.hora) newErrors.hora = "Selecciona una hora";

    if (
      formData.fecha_fin &&
      formData.fecha_inicio &&
      new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)
    ) {
      newErrors.fecha_fin =
        "La fecha de fin no puede ser anterior a la fecha de inicio";
    }

    if (formData.tipo_ubicacion === "oficina") {
      if (!formData.oficina_id) newErrors.ubicacion = "Selecciona una oficina";
    } else {
      if (!formData.estante_id) newErrors.ubicacion = "Selecciona un estante";
    }

    const locationSelected =
      formData.tipo_ubicacion === "oficina"
        ? !!formData.oficina_id
        : !!formData.estante_id;

    if (loadingActivos) {
      newErrors.activos = "Espera a que carguen los activos";
    } else if (locationSelected && activosDisponibles.length === 0) {
      newErrors.activos =
        "Esta ubicación no tiene activos. Selecciona otra ubicación.";
    } else if (formData.activos_programados.length === 0) {
      newErrors.activos = "Selecciona al menos un activo para auditar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep("summary");
    }
  };

  const handleConfirm = () => {
    onSave({
      ...formData,
      fecha_programada: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  // Valores para el resumen
  const sedeNombre =
    catalogs.sedes.find((s) => s.id === formData.sede_id)?.nombre || "";
  const auditorNombre =
    auditores.find((a) => a.id === formData.auditor_id)?.nombre_completo || "";
  const activosSeleccionados = activosDisponibles.filter((a) =>
    formData.activos_programados.includes(a.id),
  );
  const ubicacionPartes =
    formData.tipo_ubicacion === "oficina"
      ? [
          sedeNombre,
          edificiosFiltrados.find((e) => e.id === formData.edificio_id)?.nombre,
          pisosFiltrados.find((p) => p.id === formData.piso_id)?.nombre,
          oficinasFiltradas.find((o) => o.id === formData.oficina_id)?.nombre,
        ]
          .filter(Boolean)
          .join(" → ")
      : [
          sedeNombre,
          almacenesFiltrados.find((a) => a.id === formData.almacen_id)?.nombre,
          pasillosFiltrados.find((p) => p.id === formData.pasillo_id)?.nombre,
          estantesFiltrados.find((e) => e.id === formData.estante_id)?.nombre,
        ]
          .filter(Boolean)
          .join(" → ");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">
                {step === "form"
                  ? "Programar Nueva Auditoría"
                  : "Resumen de auditoría"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step === "form"
                  ? "Selecciona ubicación, auditor y activos a verificar"
                  : "Revisa los detalles antes de confirmar"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto max-h-[calc(90vh-140px)]"
          >
            {step === "form" ? (
              <div className="p-6 space-y-6">
                {/* Título y Descripción */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Auditoría Q1 — Piso 3"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    <div className="flex justify-between mt-1">
                      {errors.titulo ? (
                        <p className="text-red-500 text-xs">{errors.titulo}</p>
                      ) : (
                        <span />
                      )}
                      <p
                        className={`text-xs ${
                          formData.titulo.length > TITULO_MAX
                            ? "text-red-500"
                            : formData.titulo.length > TITULO_MAX * 0.85
                              ? "text-amber-500"
                              : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {formData.titulo.length}/{TITULO_MAX}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      placeholder="Descripción opcional"
                      value={formData.descripcion || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcion: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    <div className="flex justify-between mt-1">
                      {errors.descripcion ? (
                        <p className="text-red-500 text-xs">
                          {errors.descripcion}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p
                        className={`text-xs ${
                          (formData.descripcion?.length || 0) > DESCRIPCION_MAX
                            ? "text-red-500"
                            : (formData.descripcion?.length || 0) >
                                DESCRIPCION_MAX * 0.85
                              ? "text-amber-500"
                              : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {formData.descripcion?.length || 0}/{DESCRIPCION_MAX}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tipo de Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de Ubicación
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleTipoUbicacionChange("oficina")}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.tipo_ubicacion === "oficina"
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Oficina
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipoUbicacionChange("estante")}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.tipo_ubicacion === "estante"
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Almacén / Estante
                    </button>
                  </div>
                </div>

                {/* Sede */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Sede *
                  </label>
                  <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="">Selecciona una sede</option>
                    {catalogs.sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.sede && (
                    <p className="text-red-500 text-xs mt-1">{errors.sede}</p>
                  )}
                </div>

                {/* Jerarquía Administrativa (Oficinas) */}
                {formData.tipo_ubicacion === "oficina" && selectedSede && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Edificio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Edificio *
                        </label>
                        <select
                          value={selectedEdificio}
                          onChange={(e) => setSelectedEdificio(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        >
                          <option value="">Selecciona edificio</option>
                          {edificiosFiltrados.map((edificio) => (
                            <option key={edificio.id} value={edificio.id}>
                              {edificio.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Piso */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Piso *
                        </label>
                        <select
                          value={selectedPiso}
                          onChange={(e) => setSelectedPiso(e.target.value)}
                          disabled={!selectedEdificio}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">Selecciona piso</option>
                          {pisosFiltrados.map((piso) => (
                            <option key={piso.id} value={piso.id}>
                              {piso.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Oficina */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Oficina *
                        </label>
                        <select
                          value={formData.oficina_id || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              oficina_id: e.target.value,
                            })
                          }
                          disabled={!selectedPiso}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">Selecciona oficina</option>
                          {oficinasFiltradas.map((oficina) => (
                            <option key={oficina.id} value={oficina.id}>
                              {oficina.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Jerarquía de Almacenamiento (Estantes) */}
                {formData.tipo_ubicacion === "estante" && selectedSede && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Almacén */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Almacén *
                        </label>
                        <select
                          value={selectedAlmacen}
                          onChange={(e) => setSelectedAlmacen(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        >
                          <option value="">Selecciona almacén</option>
                          {almacenesFiltrados.map((almacen) => (
                            <option key={almacen.id} value={almacen.id}>
                              {almacen.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pasillo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Pasillo *
                        </label>
                        <select
                          value={selectedPasillo}
                          onChange={(e) => setSelectedPasillo(e.target.value)}
                          disabled={!selectedAlmacen}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">Selecciona pasillo</option>
                          {pasillosFiltrados.map((pasillo) => (
                            <option key={pasillo.id} value={pasillo.id}>
                              {pasillo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Estante */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estante *
                        </label>
                        <select
                          value={formData.estante_id || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estante_id: e.target.value,
                            })
                          }
                          disabled={!selectedPasillo}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">Selecciona estante</option>
                          {estantesFiltrados.map((estante) => (
                            <option key={estante.id} value={estante.id}>
                              {estante.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {errors.ubicacion && (
                  <p className="text-red-500 text-xs">{errors.ubicacion}</p>
                )}

                {/* Auditor y Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Auditor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Auditor Asignado *
                    </label>
                    <select
                      value={formData.auditor_id}
                      onChange={(e) =>
                        setFormData({ ...formData, auditor_id: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    >
                      <option value="">Selecciona auditor</option>
                      {auditores.map((auditor) => (
                        <option key={auditor.id} value={auditor.id}>
                          {auditor.nombre_completo}
                        </option>
                      ))}
                    </select>
                    {errors.auditor && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.auditor}
                      </p>
                    )}
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Hora *
                    </label>
                    <input
                      type="time"
                      value={formData.hora}
                      onChange={(e) =>
                        setFormData({ ...formData, hora: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    {errors.hora && (
                      <p className="text-red-500 text-xs mt-1">{errors.hora}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={formData.fecha_inicio || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fecha_inicio: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    {errors.fecha_inicio && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fecha_inicio}
                      </p>
                    )}
                  </div>

                  {/* Fecha de fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Fecha de fin
                    </label>
                    <input
                      type="date"
                      min={formData.fecha_inicio || today}
                      value={formData.fecha_fin || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_fin: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    {errors.fecha_fin && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fecha_fin}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selección de Activos */}
                {activosDisponibles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Package className="w-4 h-4 inline mr-1" />
                        Activos en esta ubicación ({activosDisponibles.length})
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllActivos}
                          className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                        >
                          Seleccionar todos
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAllActivos}
                          className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Deseleccionar todos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                      {activosDisponibles.map((activo) => {
                        const isSelected =
                          formData.activos_programados.includes(activo.id);
                        return (
                          <button
                            key={activo.id}
                            type="button"
                            onClick={() => handleToggleActivo(activo.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                  {activo.codigo_etiqueta}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                  {activo.nombre || "Activo sin nombre"}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 ml-2 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.activos && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.activos}
                      </p>
                    )}
                  </div>
                )}

                {activosDisponibles.length === 0 &&
                  !loadingActivos &&
                  (formData.oficina_id || formData.estante_id) && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-center">
                      <Package className="w-10 h-10 text-red-400 dark:text-red-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        No hay activos en esta ubicación
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
                        No es posible crear una auditoría sin activos.
                        Selecciona otra ubicación.
                      </p>
                    </div>
                  )}
                {errors.activos && activosDisponibles.length === 0 && (
                  <p className="text-red-500 text-xs">{errors.activos}</p>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Título */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {formData.titulo}
                  </h3>
                  {formData.descripcion && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formData.descripcion}
                    </p>
                  )}
                </div>

                {/* Ubicación y Auditor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Ubicación
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {ubicacionPartes}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      <User className="w-3 h-3 inline mr-1" />
                      Auditor
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {auditorNombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formData.hora}
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                {(formData.fecha_inicio || formData.fecha_fin) && (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Fechas
                    </p>
                    <div className="flex gap-6">
                      {formData.fecha_inicio && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Inicio
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.fecha_inicio}
                          </p>
                        </div>
                      )}
                      {formData.fecha_fin && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Fin
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.fecha_fin}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activos */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    <Package className="w-3 h-3 inline mr-1" />
                    Activos a auditar ({activosSeleccionados.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {activosSeleccionados.map((activo) => (
                      <div
                        key={activo.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {activo.codigo_etiqueta}
                          </p>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            {activo.nombre || "Sin nombre"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              {step === "form" ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.activos_programados.length} activos seleccionados
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Programar Auditoría
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar y programar
                  </button>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
