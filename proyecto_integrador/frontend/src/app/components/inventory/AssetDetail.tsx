import { motion } from "motion/react";
import {
  MapPin,
  User,
  Edit3,
  Printer,
  Calendar,
  Package,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { ConfirmationModal } from "../shared/ConfirmationModal";
import { QrPrintModal } from "./QrPrintModal";
import { LocationTransferModal } from "./LocationTransferModal";
import { activosApi, usuariosApi, departamentosApi } from "../../../services/api";
import { toast } from "sonner";


interface AssetDetailProps {
  assetId: string;
  onBack: () => void;
  onEdit: (assetId?: string) => void;
  refreshKey: number;
  onUpdate: () => void;
}

export function AssetDetail({ assetId, onBack, onEdit, refreshKey, onUpdate }: AssetDetailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<any | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "delete" | "transfer" | "changeCustodian" | null;
  }>({ isOpen: false, action: null });
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<number | "">("");
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [isChangingCustodian, setIsChangingCustodian] = useState(false);
  const [selectedCustodioId, setSelectedCustodioId] = useState<string>("");
  const [updatingCustodian, setUpdatingCustodian] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);


  const assetName =
    asset?.nombre ||
    asset?.especificaciones?.modelo ||
    asset?.codigo_etiqueta ||
    "Activo sin nombre";

  const assetLabel = asset?.codigo_etiqueta || asset?.id || assetId;

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        id: asset?.id || assetId,
        codigo_etiqueta: asset?.codigo_etiqueta || null,
        nombre: assetName,
      }),
    [asset?.id, asset?.codigo_etiqueta, assetId, assetName],
  );

  const qrDataUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrPayload)}`,
    [qrPayload],
  );

  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await activosApi.getById(assetId);

        if (!data) {
          setError("No se encontro el activo solicitado");
          setAsset(null);
          return;
        }

        setAsset(data);

        // Cargar trazabilidad real
        try {
          setLoadingHistory(true);
          const historyData = await activosApi.getTrazabilidad(assetId);
          setHistory(historyData);
        } catch (hErr) {
          console.error("Error al cargar trazabilidad:", hErr);
        } finally {
          setLoadingHistory(false);
        }
      } catch (err: any) {
        setError(err?.message || "No se pudo cargar el detalle del activo");
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [assetId, refreshKey]);

  useEffect(() => {
    const loadDepartamentos = async () => {
      try {
        const data = await departamentosApi.getAll();
        setDepartamentos(data);
      } catch (err) {
        console.error("Error al cargar departamentos:", err);
      }
    };
    loadDepartamentos();
  }, []);

  useEffect(() => {
    const loadUsuariosFiltered = async () => {
      if (selectedDepartamentoId === "") {
        setUsuarios([]);
        return;
      }
      try {
        setLoadingUsuarios(true);
        const data = await usuariosApi.getAll("asc", Number(selectedDepartamentoId), true);
        const filtered = data.filter((u) => u.id !== asset?.custodio_actual_id);
        setUsuarios(filtered);
      } catch (err) {
        console.error("Error al cargar usuarios filtrados:", err);
      } finally {
        setLoadingUsuarios(false);
      }
    };
    if (isChangingCustodian) {
      loadUsuariosFiltered();
    }
  }, [selectedDepartamentoId, isChangingCustodian, asset?.custodio_actual_id]);




  const handleConfirmAction = () => {
    if (confirmModal.action === "delete") {
      toast.success("Activo eliminado exitosamente");
      onUpdate();
      onBack();
      return;
    }

    if (confirmModal.action === "transfer") {
      setIsTransferModalOpen(true);
      setConfirmModal({ isOpen: false, action: null });
      return;
    }

    if (confirmModal.action === "changeCustodian") {
      setIsChangingCustodian(true);
      setSelectedDepartamentoId("");
      setSelectedCustodioId("");
      setConfirmModal({ isOpen: false, action: null });
      return;
    }
  };

  const handleUpdateCustodian = async () => {
    if (!selectedCustodioId) return;

    try {
      setUpdatingCustodian(true);
      await activosApi.update(assetId, {
        custodio_actual_id: selectedCustodioId
      });

      // Recargar activo
      const updatedAsset = await activosApi.getById(assetId);
      setAsset(updatedAsset);

      // Recargar trazabilidad
      const historyData = await activosApi.getTrazabilidad(assetId);
      setHistory(historyData);

      setIsChangingCustodian(false);
      setSelectedDepartamentoId("");
      setSelectedCustodioId("");
      onUpdate();
      toast.success("Custodio actualizado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar custodio");
    } finally {
      setUpdatingCustodian(false);
    }
  };


  const getModalContent = () => {
    switch (confirmModal.action) {
      case "delete":
        return {
          title: "Eliminar Activo",
          message: `Estas seguro de eliminar permanentemente el activo "${assetName}"? Esta accion no se puede deshacer.`,
          confirmText: "Eliminar",
          icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
        };
      case "transfer":
        return {
          title: "Transferir Activo",
          message: `Desea transferir el activo "${assetName}" a otra ubicacion?`,
          confirmText: "Transferir",
          icon: (
            <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ),
        };
      case "changeCustodian":
        return {
          title: "Cambiar Custodio",
          message: `Desea cambiar el custodio responsable del activo "${assetName}"?`,
          confirmText: "Cambiar Custodio",
          icon: <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
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

  const assetSpecs = [
    { key: "Categoria", value: asset?.categorias?.nombre ?? "N/A" },
    { key: "Estado", value: asset?.estados_activo?.nombre ?? "N/A" },
    { key: "Codigo Etiqueta", value: asset?.codigo_etiqueta ?? "N/A" },
    {
      key: "Costo de Adquisicion",
      value:
        asset?.datos_financieros?.costo_adquisicion != null
          ? `$${Number(asset.datos_financieros.costo_adquisicion).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
          : "N/A",
    },
    {
      key: "Valor en Libros",
      value:
        asset?.datos_financieros?.valor_libro_actual != null
          ? `$${Number(asset.datos_financieros.valor_libro_actual).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
          : "N/A",
    },
    {
      key: "Fecha de Compra",
      value: asset?.datos_financieros?.fecha_compra
        ? new Date(asset.datos_financieros.fecha_compra).toLocaleDateString(
          "es-MX",
        )
        : "N/A",
    },
  ];

  const custodioNombre = asset?.usuarios?.nombre_completo ?? "Sin asignar";
  const custodioIniciales = custodioNombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk: string) => chunk[0])
    .join("")
    .toUpperCase();

  const ubicacionTexto = [asset?.oficinas?.nombre, asset?.estantes?.nombre]
    .filter(Boolean)
    .join(" - ");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            <p className="text-gray-600 dark:text-gray-400">
              Cargando detalle del activo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-full shadow-sm hover:shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </motion.button>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-700/30 rounded-2xl p-6">
            <p className="text-red-700 dark:text-red-400">
              {error ?? "Activo no encontrado"}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            Detalle del Activo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion completa y trazabilidad del activo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                    Asset ID
                  </p>
                  <h2 className="text-3xl font-bold mb-4 dark:text-white break-all leading-tight">
                    {asset.id || assetId}
                  </h2>
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 break-words">
                    {assetName}
                  </h3>
                </div>
                <div className="px-6 py-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold border-2 border-emerald-200 dark:border-emerald-700/30">
                  {asset?.estados_activo?.nombre ?? "Activo"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEdit(assetId)}
                  className="px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Activo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setConfirmModal({ isOpen: true, action: "transfer" })
                  }
                  className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Transferir
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setConfirmModal({ isOpen: true, action: "delete" })
                }
                className="w-full mt-3 px-6 py-4 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full font-medium hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 border-2 border-red-200 dark:border-red-700/30"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Activo
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">
                Codigo QR del Activo
              </h3>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 flex items-center justify-center mb-6">
                <div className="w-56 h-56 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR ${assetLabel}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-gray-500">
                      No se pudo generar QR
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center break-all">
                {assetLabel}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsQrModalOpen(true)}
                className="w-full px-6 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-full font-medium hover:bg-black dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Etiqueta
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">
                Custodio Actual
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
                  {custodioIniciales || "--"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg dark:text-white break-words">
                    {custodioNombre}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {asset?.usuarios?.departamento ?? "Sin departamento"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Ubicacion Actual
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ubicacionTexto || "Sin ubicacion registrada"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Asignado desde
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {asset?.created_at
                        ? new Date(asset.created_at).toLocaleDateString("es-MX")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>


              {isChangingCustodian ? (
                <div className="mt-6 space-y-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border-2 border-amber-200 dark:border-amber-800/30">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">
                    Seleccionar Nuevo Custodio
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={selectedDepartamentoId}
                      onChange={(e) => {
                        setSelectedDepartamentoId(e.target.value === "" ? "" : Number(e.target.value));
                        setSelectedCustodioId("");
                      }}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800/30 rounded-xl text-sm focus:outline-none focus:border-amber-500 dark:text-white transition-all"
                    >
                      <option value="">Seleccione un departamento...</option>
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCustodioId}
                      onChange={(e) => setSelectedCustodioId(e.target.value)}
                      disabled={selectedDepartamentoId === "" || loadingUsuarios}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800/30 rounded-xl text-sm focus:outline-none focus:border-amber-500 dark:text-white transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {selectedDepartamentoId === ""
                          ? "Primero seleccione un departamento"
                          : loadingUsuarios
                            ? "Cargando custodios..."
                            : usuarios.length === 0
                              ? "No hay custodios en este departamento"
                              : "Seleccione un custodio..."}
                      </option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDepartamentoId !== "" && !loadingUsuarios && usuarios.length === 0 && (
                    <p className="text-red-500 text-xs font-medium">No hay custodios disponibles en este departamento.</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpdateCustodian}
                      disabled={!selectedCustodioId || updatingCustodian}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {updatingCustodian ? "Actualizando..." : "Confirmar Cambio"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsChangingCustodian(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setConfirmModal({ isOpen: true, action: "changeCustodian" })
                  }
                  className="w-full mt-6 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Cambiar Custodio
                </motion.button>
              )}
            </motion.div>

          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold dark:text-white">
                  Especificaciones Tecnicas
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetSpecs.map((spec, index) => (
                  <motion.div
                    key={spec.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="p-4 rounded-2xl border-2 transition-all bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1.5 uppercase tracking-wide">
                      {spec.key}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {spec.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">
                Trazabilidad
              </h3>

              <div className="relative">
                {history.length > 0 && (
                  <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-200 via-blue-200 to-gray-200 dark:from-emerald-800 dark:via-blue-800 dark:to-gray-800" />
                )}

                <div className="space-y-6">
                  {loadingHistory ? (
                    <p className="text-sm text-gray-500 text-center animate-pulse">
                      Consultando registros de trazabilidad...
                    </p>
                  ) : history.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        Este activo no cuenta con registros de trazabilidad aún.
                      </p>
                    </div>
                  ) : (
                    history.map((event, index) => {
                      const isAudit = event.tipo === "AUDITORIA";
                      const dateObj = new Date(event.fecha);
                      const fechaStr = dateObj.toLocaleDateString("es-MX");
                      const horaStr = dateObj.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      let title = "";
                      let description = "";
                      let iconBg = "bg-blue-500";
                      let responsable = "";

                      if (isAudit) {
                        title = "Auditoría Física";
                        description = event.comentarios || "Sin comentarios";
                        iconBg = "bg-emerald-500";
                        responsable = event.usuario?.nombre_completo || "Sist.";
                      } else {
                        const d = event.detalles;
                        responsable = d.custodio_nuevo?.nombre_completo || "Sist.";

                        if (d.custodio_anterior?.id !== d.custodio_nuevo?.id) {
                          title = "Reasignación de Custodio";
                          description = `Custodio pasó de ${d.custodio_anterior?.nombre_completo || "N/A"} a ${d.custodio_nuevo?.nombre_completo || "N/A"}`;
                          iconBg = "bg-purple-500";
                        } else if (d.oficina_anterior?.id !== d.oficina_nueva?.id) {
                          title = "Traslado de Ubicación";
                          description = `Se movió de ${d.oficina_anterior?.nombre || "N/A"} a ${d.oficina_nueva?.nombre || "N/A"}`;
                          iconBg = "bg-blue-500";
                        } else if (d.estado_anterior?.id !== d.estado_nuevo?.id) {
                          title = "Cambio de Estado";
                          description = `Estado cambió de ${d.estado_anterior?.nombre || "N/A"} a ${d.estado_nuevo?.nombre || "N/A"}`;
                          iconBg = "bg-amber-500";
                        } else {
                          title = "Movimiento de Activo";
                          description = "Actualización de datos generales";
                        }
                      }

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.2 + index * 0.05,
                          }}
                          className="relative pl-10"
                        >
                          <div
                            className={`absolute left-0 top-1 w-6 h-6 rounded-full ${iconBg} shadow-lg ring-4 ring-white dark:ring-[#1a1a1a] flex items-center justify-center`}
                          >
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-500 whitespace-nowrap">
                                <span>{fechaStr}</span>
                                <span>.</span>
                                <span>{horaStr}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {responsable}
                                </span>
                              </div>

                              {event.coordenadas && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 rounded-md">
                                  <MapPin className="w-3 h-3 text-blue-500" />
                                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                                    {event.coordenadas.lat.toFixed(6)},{" "}
                                    {event.coordenadas.lng.toFixed(6)}
                                  </span>
                                </div>
                              )}

                              {event.estado?.nombre && (
                                <div className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md">
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                                    Auditoría: {event.estado.nombre}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={handleConfirmAction}
        title={getModalContent().title}
        message={getModalContent().message}
        confirmText={getModalContent().confirmText}
        icon={getModalContent().icon}
      />
      <QrPrintModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrDataUrl={qrDataUrl}
        assetLabel={assetLabel}
        assetName={assetName}
      />

      <LocationTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        assetId={assetId}
        currentOficinaId={asset.oficina_id}
        currentEstanteId={asset.estante_id}
        onSuccess={async () => {
          // Recargar activo y trazabilidad
          const updatedAsset = await activosApi.getById(assetId);
          setAsset(updatedAsset);
          const historyData = await activosApi.getTrazabilidad(assetId);
          setHistory(historyData);
          onUpdate();
          toast.success("Transferencia realizada exitosamente");
        }}
      />
    </div>
  );
}
