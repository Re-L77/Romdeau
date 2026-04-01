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
  Check,
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
  onSave: (auditData: CreateAuditoriaProgramadaDto) => void;
  catalogs: AuditoriaFormCatalogs;
  existingAudits?: Array<{ titulo: string }>;
  editData?: any;
}

export interface CreateAuditoriaProgramadaDto {
  titulo: string;
  descripcion?: string;
  fecha_programada: Date;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  auditor_id: string;
  oficina_id?: string;
  estante_id?: string;
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
  existingAudits = [],
  editData,
}: CrearAuditoriaProps) {
  const isEditing = !!editData;

  // Derive initial location selections from editData
  const getInitialSelections = () => {
    if (!editData)
      return { sede: "", edificio: "", piso: "", almacen: "", pasillo: "" };

    if (editData.oficinas?.pisos?.edificios?.sedes) {
      return {
        sede: editData.oficinas.pisos.edificios.sedes.id ?? "",
        edificio: editData.oficinas.pisos.edificios.id ?? "",
        piso: editData.oficinas.pisos.id ?? "",
        almacen: "",
        pasillo: "",
      };
    }
    if (editData.estantes?.pasillos?.almacenes?.sedes) {
      return {
        sede: editData.estantes.pasillos.almacenes.sedes.id ?? "",
        edificio: "",
        piso: "",
        almacen: editData.estantes.pasillos.almacenes.id ?? "",
        pasillo: editData.estantes.pasillos.id ?? "",
      };
    }
    return { sede: "", edificio: "", piso: "", almacen: "", pasillo: "" };
  };

  const initSel = getInitialSelections();

  const formatDateForInput = (d: string | undefined) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  const formatTimeForInput = (d: string | undefined) => {
    if (!d) return "";
    const date = new Date(d);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const [step, setStep] = useState<"form" | "summary">("form");
  const [formData, setFormData] = useState<AuditFormData>({
    titulo: editData?.titulo ?? "",
    descripcion: editData?.descripcion ?? "",
    sede_id: initSel.sede,
    auditor_id: editData?.auditor_id ?? "",
    hora: editData?.fecha_programada
      ? formatTimeForInput(editData.fecha_programada)
      : "",
    fecha_inicio: formatDateForInput(editData?.fecha_inicio),
    fecha_fin: formatDateForInput(editData?.fecha_fin),
    tipo_ubicacion: editData?.estante_id ? "estante" : "oficina",
    oficina_id: editData?.oficina_id ?? undefined,
    estante_id: editData?.estante_id ?? undefined,
    activos_programados: [],
  });

  const [selectedSede, setSelectedSede] = useState(initSel.sede);
  const [selectedEdificio, setSelectedEdificio] = useState(initSel.edificio);
  const [selectedPiso, setSelectedPiso] = useState(initSel.piso);
  const [selectedAlmacen, setSelectedAlmacen] = useState(initSel.almacen);
  const [selectedPasillo, setSelectedPasillo] = useState(initSel.pasillo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activosDisponibles, setActivosDisponibles] = useState<
    ActivoCatalogItem[]
  >([]);
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
    } else if (
      existingAudits.some(
        (audit) =>
          audit.titulo.toLowerCase() === formData.titulo.toLowerCase() &&
          (!isEditing ||
            audit.titulo.toLowerCase() !== editData?.titulo?.toLowerCase()),
      )
    ) {
      newErrors.titulo = "Ya existe una auditoría con este título";
    }

    if (formData.descripcion && formData.descripcion.length > DESCRIPCION_MAX) {
      newErrors.descripcion = `La descripción no puede superar ${DESCRIPCION_MAX} caracteres`;
    }

    if (!formData.sede_id) newErrors.sede = "Selecciona una sede";
    if (!formData.auditor_id) newErrors.auditor = "Selecciona un auditor";
    if (!formData.hora) newErrors.hora = "Selecciona una hora";

    // Validacion: minimo 1 dia de plazo desde hoy
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (formData.fecha_inicio && formData.fecha_inicio < tomorrowStr) {
      newErrors.fecha_inicio =
        "La auditoria debe tener al menos 1 dia de plazo. Selecciona una fecha a partir de manana.";
    }

    if (formData.fecha_fin && formData.fecha_fin < tomorrowStr) {
      newErrors.fecha_fin =
        "La auditoria debe tener al menos 1 dia de plazo. Selecciona una fecha a partir de manana.";
    }

    if (
      formData.fecha_fin &&
      formData.fecha_inicio &&
      new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)
    ) {
      newErrors.fecha_fin =
        "La fecha de fin no puede ser anterior a la fecha de inicio";
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      const diferenciaDias = Math.ceil(
        (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diferenciaDias < 1) {
        newErrors.fecha_fin =
          "Debe haber al menos 1 día de diferencia entre la fecha de inicio y fin";
      }
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

  const handleConfirmSubmit = async () => {
    try {
      // Transformar datos al formato del DTO
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || undefined,
        ...(isEditing ? {} : { fecha_programada: new Date() }),
        fecha_inicio: formData.fecha_inicio
          ? new Date(formData.fecha_inicio)
          : undefined,
        fecha_fin: formData.fecha_fin
          ? new Date(formData.fecha_fin)
          : undefined,
        auditor_id: formData.auditor_id,
        ...(formData.tipo_ubicacion === "oficina"
          ? { oficina_id: formData.oficina_id }
          : { estante_id: formData.estante_id }),
      };

      onSave(dataToSend);
    } catch (error) {
      console.error("Error al procesar auditoría:", error);
    }
  };

  // Obtener fecha mínima (mañana, para el plazo de 1 día)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Helper para obtener nombre de sede
  const getSedeNombre = (sedeId: string) => {
    return catalogs.sedes.find((s) => s.id === sedeId)?.nombre || sedeId;
  };

  // Helper para obtener nombre de auditor
  const getAuditorNombre = (auditorId: string) => {
    return (
      catalogs.auditores.find((a) => a.id === auditorId)?.nombre_completo ||
      auditorId
    );
  };

  // Helper para obtener nombre de ubicación
  const getUbicacionNombre = () => {
    if (formData.tipo_ubicacion === "oficina") {
      const sede = catalogs.sedes.find((s) => s.id === formData.sede_id);
      const edificio = sede?.edificios.find(
        (e) => e.id === formData.edificio_id,
      );
      const piso = edificio?.pisos.find((p) => p.id === formData.piso_id);
      const oficina = piso?.oficinas.find(
        (o) => o.id === formData.oficina_id,
      )?.nombre;
      return `${sede?.nombre} - ${edificio?.nombre} - ${piso?.nombre} - ${oficina}`;
    } else {
      const sede = catalogs.sedes.find((s) => s.id === formData.sede_id);
      const almacen = sede?.almacenes.find((a) => a.id === formData.almacen_id);
      const pasillo = almacen?.pasillos.find(
        (p) => p.id === formData.pasillo_id,
      );
      const estante = pasillo?.estantes.find(
        (e) => e.id === formData.estante_id,
      )?.nombre;
      return `${sede?.nombre} - ${almacen?.nombre} - ${pasillo?.nombre} - ${estante}`;
    }
  };

  // Helper para obtener nombre de activo
  const getActivoNombre = (activoId: string) => {
    return (
      activosDisponibles.find((a) => a.id === activoId)?.nombre || activoId
    );
  };

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
                  ? isEditing
                    ? "Editar Auditoría"
                    : "Programar Nueva Auditoría"
                  : "Revisar Auditoría"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step === "form"
                  ? isEditing
                    ? "Modifica los detalles de la auditoría programada"
                    : "Selecciona ubicación, auditor y activos a verificar"
                  : "Verifica los detalles antes de confirmar"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {/* Contenido - Formulario */}
          {step === "form" && (
            <>
              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto max-h-[calc(90vh-140px)]"
              >
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
                          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                            {errors.titulo}
                          </p>
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
                          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                            {errors.descripcion}
                          </p>
                        ) : (
                          <span />
                        )}
                        <p
                          className={`text-xs ${
                            (formData.descripcion?.length || 0) >
                            DESCRIPCION_MAX
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
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-1">
                        {errors.sede}
                      </p>
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
                            onChange={(e) =>
                              setSelectedEdificio(e.target.value)
                            }
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
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {errors.ubicacion}
                    </p>
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
                          setFormData({
                            ...formData,
                            auditor_id: e.target.value,
                          })
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
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-1">
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
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-1">
                          {errors.hora}
                        </p>
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
                        min={minDate}
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
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-1">
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
                        min={formData.fecha_inicio || minDate}
                        value={formData.fecha_fin || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fecha_fin: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                      {errors.fecha_fin && (
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-1">
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
                          Activos en esta ubicación ({activosDisponibles.length}
                          )
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
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-2">
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
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {errors.activos}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
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
                      Revisar
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* Contenido - Resumen */}
          {step === "summary" && (
            <>
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-5">
                {/* Título y Descripción */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Información General
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          TÍTULO
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                          {formData.titulo}
                        </p>
                      </div>
                      {formData.descripcion && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            DESCRIPCIÓN
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
                            {formData.descripcion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Ubicación
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          TIPO
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formData.tipo_ubicacion === "oficina"
                            ? "Oficina"
                            : "Almacén / Estante"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          UBICACIÓN COMPLETA
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                          {getUbicacionNombre()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auditor y Fechas */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Detalles de la Auditoría
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          AUDITOR
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white leading-tight">
                          {getAuditorNombre(formData.auditor_id)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          HORA
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formData.hora}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          INICIO
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formData.fecha_inicio || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          FIN
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formData.fecha_fin || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activos a Auditar */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    <Package className="w-4 h-4 inline mr-2" />
                    Activos a Auditar ({formData.activos_programados.length})
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {formData.activos_programados.map((activoId) => {
                        const activo = activosDisponibles.find(
                          (a) => a.id === activoId,
                        );
                        return (
                          <div
                            key={activoId}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
                                {activo?.codigo_etiqueta}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {activo?.nombre || "Activo sin nombre"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del Resumen */}
              <div className="flex items-center gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isEditing ? "Guardar Cambios" : "Confirmar"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
