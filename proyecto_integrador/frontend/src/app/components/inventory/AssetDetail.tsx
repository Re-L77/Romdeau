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
import { useEffect, useMemo, useState } from "react";
import { ConfirmationModal } from "../shared/ConfirmationModal";
import { activosApi } from "../../../services/api";

const statusConfig = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

const historyEvents = [
  {
    id: 1,
    title: "Auditoria Fisica Completada",
    description: "Verificacion de ubicacion registrada",
    date: "2026-02-23",
    time: "14:30",
    user: "Sistema",
    status: "success",
  },
  {
    id: 2,
    title: "Cambio de Ubicacion",
    description: "Movimiento registrado en historial",
    date: "2026-02-10",
    time: "09:15",
    user: "Sistema",
    status: "info",
  },
  {
    id: 3,
    title: "Mantenimiento Preventivo",
    description: "Evento registrado de servicio",
    date: "2026-01-20",
    time: "11:00",
    user: "Sistema",
    status: "success",
  },
];

interface AssetDetailProps {
  assetId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function AssetDetail({ assetId, onBack, onEdit }: AssetDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "delete" | "transfer" | "changeCustodian" | "printLabel" | null;
  }>({ isOpen: false, action: null });

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
      } catch (err: any) {
        setError(err?.message || "No se pudo cargar el detalle del activo");
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [assetId]);

  const handlePrintQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=560,height=760");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta ${assetLabel}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; text-align: center; }
            img { width: 280px; height: 280px; }
            .label { margin-top: 12px; font-size: 16px; font-weight: bold; }
            .name { margin-top: 6px; font-size: 14px; color: #333; }
          </style>
        </head>
        <body>
          <img src="${qrDataUrl}" alt="QR activo" />
          <div class="label">${assetLabel}</div>
          <div class="name">${assetName}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleConfirmAction = () => {
    if (confirmModal.action === "delete") {
      alert("Activo eliminado exitosamente");
      onBack();
      return;
    }

    if (confirmModal.action === "printLabel") {
      handlePrintQr();
      return;
    }

    if (confirmModal.action === "transfer") {
      console.log("Transferir activo:", assetId);
      return;
    }

    if (confirmModal.action === "changeCustodian") {
      console.log("Cambiar custodio:", assetId);
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
      case "printLabel":
        return {
          title: "Imprimir Etiqueta QR",
          message: `Desea generar e imprimir la etiqueta QR del activo "${assetName}"?`,
          confirmText: "Imprimir",
          icon: (
            <Printer className="w-6 h-6 text-amber-600 dark:text-amber-400" />
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
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
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
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
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
                  onClick={onEdit}
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
                onClick={() =>
                  setConfirmModal({ isOpen: true, action: "printLabel" })
                }
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    isEditing
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? "Guardar" : "Editar Specs"}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetSpecs.map((spec, index) => (
                  <motion.div
                    key={spec.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isEditing
                        ? "bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white"
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                    }`}
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
                <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-200 via-blue-200 to-gray-200 dark:from-emerald-800 dark:via-blue-800 dark:to-gray-800" />

                <div className="space-y-6">
                  {historyEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                      className="relative pl-10"
                    >
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full ${
                          statusConfig[
                            event.status as keyof typeof statusConfig
                          ]
                        } shadow-lg ring-4 ring-white dark:ring-[#1a1a1a]`}
                      />

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                            <span>{event.date}</span>
                            <span>.</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Por: {event.user}
                        </p>
                      </div>
                    </motion.div>
                  ))}
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
    </div>
  );
}
