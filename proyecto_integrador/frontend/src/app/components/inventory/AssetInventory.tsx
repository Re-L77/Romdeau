import { motion } from "motion/react";
import {
  QrCode,
  MapPin,
  User,
  ChevronDown,
  Navigation,
  Clock,
  Plus,
  Trash2,
  Laptop,
  Server,
  Package2,
  Smartphone,
  Monitor,
  Filter,
  Building2,
  Edit,
  ArrowRightLeft,
  FileText,
  UserCog,
  Settings,
  Search,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ConfirmationModal } from "../shared/ConfirmationModal";
import { activosApi } from "../../../services/api";
import { EstadoActivo } from "../../data/types";

const statusColors = {
  emerald:
    "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30",
  blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30",
  red: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700/30",
};

const categoryIcons = {
  Laptop: Laptop,
  Server: Server,
  Package2: Package2,
  Smartphone: Smartphone,
  Monitor: Monitor,
};

interface AssetInventoryProps {
  onAssetClick: (assetId: string) => void;
  onCreateAsset: () => void;
}

export function AssetInventory({
  onAssetClick,
  onCreateAsset,
}: AssetInventoryProps) {
  const [activosEnriquecidos, setActivosEnriquecidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [oficinaFilter, setOficinaFilter] = useState<string>("all");
  const [estanteFilter, setEstanteFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [sinCustodio, setSinCustodio] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action:
      | "create"
      | "edit"
      | "transfer"
      | "delete"
      | "editSpecs"
      | "printLabel"
      | "changeCustodian"
      | null;
    assetId?: string;
    assetName?: string;
  }>({ isOpen: false, action: null });

  const enrichActivos = (activos: any[]) => {
    return activos.map((activo: any) => {
      const categoria = activo.categorias;
      const custodio = activo.usuarios;
      const datosFinancieros = activo.datos_financieros;

      let ubicacion = "";
      if (activo.oficinas) {
        ubicacion = activo.oficinas.nombre;
        if (activo.estantes) {
          ubicacion += ` - ${activo.estantes.nombre}`;
        }
      }

      let categoriaIcon = "Package2";
      if (categoria?.nombre.toLowerCase().includes("cómputo"))
        categoriaIcon = "Laptop";
      else if (categoria?.nombre.toLowerCase().includes("servidor"))
        categoriaIcon = "Server";
      else if (categoria?.nombre.toLowerCase().includes("móvil"))
        categoriaIcon = "Smartphone";

      let estadoColor = "emerald";
      if (activo.estado_operativo_id === EstadoActivo.MALO)
        estadoColor = "blue";
      else if (activo.estado_operativo_id === EstadoActivo.BAJA)
        estadoColor = "red";

      const estadosNombres = {
        [EstadoActivo.NUEVO]: "Nuevo",
        [EstadoActivo.BUENO]: "Bueno",
        [EstadoActivo.MALO]: "Malo",
        [EstadoActivo.BAJA]: "Baja",
      };

      return {
        ...activo,
        categoria,
        custodio_actual: custodio,
        datos_financieros: datosFinancieros,
        ubicacion_texto: ubicacion,
        dias_hasta_vencimiento_garantia: 0,
        categoria_icon: categoriaIcon,
        estado_color: estadoColor,
        estado_nombre: estadosNombres[activo.estado_operativo_id],
      };
    });
  };

  const loadActivos = async (page: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await activosApi.getList({
        page,
        limit: 20,
        q: searchText.trim() || undefined,
        categoriaNombre: categoryFilter !== "all" ? categoryFilter : undefined,
        estadoOperativoId: statusFilter !== "all" ? statusFilter : undefined,
        oficinaId: oficinaFilter !== "all" ? oficinaFilter : undefined,
        estanteId: estanteFilter !== "all" ? estanteFilter : undefined,
        sinCustodio: sinCustodio || undefined,
      });

      const enriquecidos = enrichActivos(result.data);
      setActivosEnriquecidos((prev) =>
        append ? [...prev, ...enriquecidos] : enriquecidos,
      );
      setPagination(result.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar activos");
      if (!append) {
        setActivosEnriquecidos([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadActivos(1);
  }, [
    categoryFilter,
    statusFilter,
    oficinaFilter,
    estanteFilter,
    searchText,
    sinCustodio,
  ]);

  // Extract unique values for filters
  const categories = [
    "all",
    ...new Set(
      activosEnriquecidos.map((a) => a.categoria?.nombre).filter(Boolean),
    ),
  ];
  const statuses = [
    { id: "all", nombre: "Todos los estados" },
    { id: EstadoActivo.NUEVO, nombre: "Nuevo" },
    { id: EstadoActivo.BUENO, nombre: "Bueno" },
    { id: EstadoActivo.MALO, nombre: "Malo" },
    { id: EstadoActivo.BAJA, nombre: "Baja" },
  ];

  const oficinas = [
    { id: "all", nombre: "Todas las oficinas" },
    ...Array.from(
      new Map(
        activosEnriquecidos
          .filter((a) => a.oficinas?.id)
          .map((a) => [
            a.oficinas.id,
            { id: a.oficinas.id, nombre: a.oficinas.nombre },
          ]),
      ).values(),
    ),
  ];

  const estantes = [
    { id: "all", nombre: "Todos los estantes" },
    ...Array.from(
      new Map(
        activosEnriquecidos
          .filter((a) => a.estantes?.id)
          .filter(
            (a) => oficinaFilter === "all" || a.oficinas?.id === oficinaFilter,
          )
          .map((a) => [
            a.estantes.id,
            { id: a.estantes.id, nombre: a.estantes.nombre },
          ]),
      ).values(),
    ),
  ];

  useEffect(() => {
    if (estanteFilter === "all") {
      return;
    }

    const estanteExiste = estantes.some(
      (estante) => estante.id === estanteFilter,
    );
    if (!estanteExiste) {
      setEstanteFilter("all");
    }
  }, [oficinaFilter, estanteFilter, estantes]);

  const filteredAssets = activosEnriquecidos;

  const handleConfirmAction = () => {
    if (confirmModal.action === "create") {
      onCreateAsset();
    } else if (confirmModal.action === "edit") {
      console.log("Editar activo:", confirmModal.assetId);
    } else if (confirmModal.action === "transfer") {
      console.log("Transferir activo:", confirmModal.assetId);
    } else if (confirmModal.action === "delete") {
      console.log("Eliminar activo:", confirmModal.assetId);
    } else if (confirmModal.action === "editSpecs") {
      console.log("Editar especificaciones:", confirmModal.assetId);
    } else if (confirmModal.action === "printLabel") {
      console.log("Imprimir etiqueta:", confirmModal.assetId);
    } else if (confirmModal.action === "changeCustodian") {
      console.log("Cambiar custodio:", confirmModal.assetId);
    }
  };

  const getModalContent = () => {
    switch (confirmModal.action) {
      case "create":
        return {
          title: "Crear Nuevo Activo",
          message: "¿Desea crear un nuevo activo en el sistema de inventario?",
          confirmText: "Crear Activo",
          icon: <Plus className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        };
      case "edit":
        return {
          title: "Editar Activo",
          message: `¿Desea editar la información del activo "${confirmModal.assetName}"?`,
          confirmText: "Editar",
          icon: <Edit className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        };
      case "transfer":
        return {
          title: "Transferir Activo",
          message: `¿Desea transferir el activo "${confirmModal.assetName}" a otra ubicación?`,
          confirmText: "Transferir",
          icon: (
            <ArrowRightLeft className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ),
        };
      case "delete":
        return {
          title: "Eliminar Activo",
          message: `⚠️ ¿Está seguro de eliminar permanentemente el activo "${confirmModal.assetName}"? Esta acción no se puede deshacer.`,
          confirmText: "Eliminar",
          icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
        };
      case "editSpecs":
        return {
          title: "Editar Especificaciones",
          message: `¿Desea editar las especificaciones técnicas del activo "${confirmModal.assetName}"?`,
          confirmText: "Editar Specs",
          icon: (
            <Settings className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ),
        };
      case "printLabel":
        return {
          title: "Imprimir Etiqueta QR",
          message: `¿Desea generar e imprimir la etiqueta QR del activo "${confirmModal.assetName}"?`,
          confirmText: "Imprimir",
          icon: (
            <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ),
        };
      case "changeCustodian":
        return {
          title: "Cambiar Custodio",
          message: `¿Desea cambiar el custodio responsable del activo "${confirmModal.assetName}"?`,
          confirmText: "Cambiar Custodio",
          icon: (
            <UserCog className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ),
        };
      default:
        return {
          title: "",
          message: "",
          confirmText: "Confirmar",
          icon: undefined,
        };
    }
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600 dark:text-gray-400">
            Cargando activos...
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-1 dark:text-white">
              Inventario de Activos Fijos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trazabilidad con PostGIS -{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {filteredAssets.length} de {pagination.total} activos
              </span>
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold dark:text-white">
                  Filtros Jerárquicos
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setConfirmModal({ isOpen: true, action: "create" })
                }
                className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Activo
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="md:col-span-2 lg:col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">
                  Buscar por nombre o etiqueta
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Ej. laptop, ROM-001..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">
                  Oficina
                </label>
                <select
                  value={oficinaFilter}
                  onChange={(e) => setOficinaFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  {oficinas.map((oficina) => (
                    <option key={oficina.id} value={oficina.id}>
                      {oficina.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">
                  Estante
                </label>
                <select
                  value={estanteFilter}
                  onChange={(e) => setEstanteFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  {estantes.map((estante) => (
                    <option key={estante.id} value={estante.id}>
                      {estante.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">
                  Categoría
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "Todas las categorías" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">
                  Estado Operativo
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value === "all" ? "all" : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setSinCustodio((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  <span
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                      sinCustodio
                        ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                        : "bg-transparent border-gray-300 dark:border-gray-600 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  Solo sin custodio
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAssets.map((asset, index) => {
              const isExpanded = expandedRow === asset.id;
              const CategoryIcon =
                categoryIcons[
                  asset.categoria_icon as keyof typeof categoryIcons
                ] || Package2;

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{
                    scale: 1.01,
                    y: -4,
                    transition: { duration: 0.15 },
                  }}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden transition-all cursor-pointer hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)]"
                >
                  <div className="p-6">
                    <div
                      className="flex items-center gap-4"
                      onClick={() => onAssetClick(asset.id)}
                    >
                      {/* Category Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                          <CategoryIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            Código Etiqueta
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {asset.codigo_etiqueta}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {asset.nombre ||
                              asset.especificaciones?.modelo ||
                              "Sin nombre"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                            {asset.categoria?.nombre}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            Ubicación (Jerarquía Institucional)
                          </p>
                          <div className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
                            <Building2 className="w-3.5 h-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <p className="text-xs font-medium">
                              {asset.ubicacion_texto}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            Custodio Actual
                          </p>
                          <div className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
                            <User className="w-3.5 h-3.5 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">
                                {asset.custodio_actual?.nombre_completo ||
                                  "Sin asignar"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {asset.custodio_actual?.departamento}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            Estado
                          </p>
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
                              statusColors[
                                asset.estado_color as keyof typeof statusColors
                              ]
                            }`}
                          >
                            {asset.estado_nombre}
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onAssetClick(asset.id)}
                          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                        >
                          <QrCode className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                          onClick={() =>
                            setExpandedRow(isExpanded ? null : asset.id)
                          }
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 dark:text-gray-300" />
                          </motion.div>
                        </motion.button>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6"
                      >
                        {asset.especificaciones &&
                        Object.keys(asset.especificaciones).length > 0 ? (
                          <>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                              Especificaciones Técnicas (JSONB Dinámico)
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {Object.entries(asset.especificaciones).map(
                                ([key, value]) => (
                                  <motion.div
                                    key={key}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700"
                                  >
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                      {key}:
                                    </span>{" "}
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {value as string}
                                    </span>
                                  </motion.div>
                                ),
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                Código QR
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white font-mono font-bold">
                                {asset.codigo_etiqueta}
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                Categoría
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                {asset.categoria?.nombre}
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                Estado Operativo
                              </p>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[asset.estado_color as keyof typeof statusColors]}`}
                              >
                                {asset.estado_nombre}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Datos Financieros */}
                        {asset.datos_financieros && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-700/30">
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                                Valor de Adquisición
                              </p>
                              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                $
                                {asset.datos_financieros.costo_adquisicion.toLocaleString(
                                  "es-MX",
                                  { minimumFractionDigits: 2 },
                                )}
                              </p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-700/30">
                              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                Valor en Libros
                              </p>
                              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                $
                                {asset.datos_financieros.valor_libro_actual.toLocaleString(
                                  "es-MX",
                                  { minimumFractionDigits: 2 },
                                )}
                              </p>
                            </div>
                            <div
                              className={`p-4 rounded-2xl border ${
                                asset.dias_hasta_vencimiento_garantia &&
                                asset.dias_hasta_vencimiento_garantia < 30
                                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-700/30"
                                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              <p
                                className={`text-xs mb-1 ${
                                  asset.dias_hasta_vencimiento_garantia &&
                                  asset.dias_hasta_vencimiento_garantia < 30
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-500 dark:text-gray-500"
                                }`}
                              >
                                Vencimiento Garantía
                              </p>
                              <p
                                className={`text-lg font-bold ${
                                  asset.dias_hasta_vencimiento_garantia &&
                                  asset.dias_hasta_vencimiento_garantia < 30
                                    ? "text-red-700 dark:text-red-400"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {asset.dias_hasta_vencimiento_garantia
                                  ? asset.dias_hasta_vencimiento_garantia > 0
                                    ? `${asset.dias_hasta_vencimiento_garantia} días`
                                    : "Vencida"
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                            Acciones Disponibles
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  action: "edit",
                                  assetId: asset.id,
                                  assetName: asset.nombre,
                                })
                              }
                              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors flex flex-col items-center gap-2"
                            >
                              <Edit className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                Editar Activo
                              </span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  action: "transfer",
                                  assetId: asset.id,
                                  assetName: asset.nombre,
                                })
                              }
                              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors flex flex-col items-center gap-2"
                            >
                              <ArrowRightLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                Transferir
                              </span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  action: "changeCustodian",
                                  assetId: asset.id,
                                  assetName: asset.nombre,
                                })
                              }
                              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors flex flex-col items-center gap-2"
                            >
                              <UserCog className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                Cambiar Custodio
                              </span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  action: "editSpecs",
                                  assetId: asset.id,
                                  assetName: asset.nombre,
                                })
                              }
                              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors flex flex-col items-center gap-2"
                            >
                              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                Editar Specs
                              </span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  action: "printLabel",
                                  assetId: asset.id,
                                  assetName: asset.nombre,
                                })
                              }
                              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors flex flex-col items-center gap-2"
                            >
                              <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                Imprimir Etiqueta
                              </span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  action: "delete",
                                  assetId: asset.id,
                                  assetName: asset.nombre,
                                })
                              }
                              className="px-4 py-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-700/30 hover:border-red-600 dark:hover:border-red-500 transition-colors flex flex-col items-center gap-2"
                            >
                              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <span className="text-xs font-medium text-red-900 dark:text-red-400">
                                Eliminar
                              </span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {!loading && !error && pagination.hasNextPage && (
            <div className="flex justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadActivos(pagination.page + 1, true)}
                disabled={loadingMore}
                className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                {loadingMore ? "Cargando..." : "Cargar más"}
              </motion.button>
            </div>
          )}

          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, action: null })}
            onConfirm={handleConfirmAction}
            title={getModalContent().title}
            message={getModalContent().message}
            confirmText={getModalContent().confirmText}
            icon={getModalContent().icon}
          />
        </>
      )}
    </div>
  );
}
