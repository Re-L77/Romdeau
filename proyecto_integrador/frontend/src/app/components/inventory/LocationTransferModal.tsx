import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Building2, Layout, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { ubicacionesApi, activosApi } from "../../../services/api";

interface LocationTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  currentOficinaId?: string | null;
  currentEstanteId?: string | null;
  onSuccess: () => void;
}

export const LocationTransferModal: React.FC<LocationTransferModalProps> = ({
  isOpen,
  onClose,
  assetId,
  currentOficinaId,
  currentEstanteId,
  onSuccess,
}) => {
  const [targetType, setTargetType] = useState<"oficina" | "estante">("oficina");
  const [oficinas, setOficinas] = useState<any[]>([]);
  const [estantes, setEstantes] = useState<any[]>([]);
  const [selectedOficinaId, setSelectedOficinaId] = useState<string>("");
  const [selectedEstanteId, setSelectedEstanteId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadOficinas();
      loadEstantes();
      // Reset state
      setTargetType("oficina");
      setSelectedOficinaId("");
      setSelectedEstanteId("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const loadOficinas = async () => {
    try {
      setLoading(true);
      const data = await ubicacionesApi.getOficinas();
      setOficinas(data);
    } catch (err) {
      setError("Error al cargar oficinas");
    } finally {
      setLoading(false);
    }
  };

  const loadEstantes = async (oficinaId?: string) => {
    try {
      setLoading(true);
      const oficina = oficinaId
        ? oficinas.find((o) => String(o.id) === String(oficinaId))
        : null;
      const sedeId = oficina
        ? oficina?.pisos?.edificios?.sede_id ??
          oficina?.pisos?.edificios?.sedes?.id
        : undefined;
      const data = await ubicacionesApi.getEstantes(sedeId);

      if (!oficinaId) {
        setEstantes(data);
        return;
      }

      const filtered = data.filter((estante) => {
        const estanteOficinaId =
          estante?.oficina_id ??
          estante?.oficinas?.id ??
          estante?.pasillos?.almacenes?.oficina_id ??
          estante?.pasillos?.almacenes?.oficinas?.id;
        return String(estanteOficinaId) === String(oficinaId);
      });

      setEstantes(filtered.length > 0 ? filtered : data);
    } catch (err) {
      setError("Error al cargar estantes");
    } finally {
      setLoading(false);
    }
  };

  const handleOficinaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedOficinaId(id);
  };

  const handleTransfer = async () => {
    // Validaciones
    if (targetType === "oficina" && !selectedOficinaId) {
      setError("Debe seleccionar una oficina");
      return;
    }
    if (targetType === "estante" && !selectedEstanteId) {
      setError("Debe seleccionar un estante");
      return;
    }

    // Validar que no sea el mismo lugar
    if (targetType === "oficina" && selectedOficinaId === currentOficinaId && !currentEstanteId) {
      setError("El activo ya se encuentra en esta oficina");
      return;
    }
    if (targetType === "estante" && selectedEstanteId === currentEstanteId) {
      setError("El activo ya se encuentra en este estante");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const selectedEstante = estantes.find(
        (estante) => String(estante.id) === String(selectedEstanteId),
      );
      const estanteOficinaId =
        selectedEstante?.oficina_id ??
        selectedEstante?.oficinas?.id ??
        selectedEstante?.pasillos?.almacenes?.oficina_id ??
        selectedEstante?.pasillos?.almacenes?.oficinas?.id;

      if (targetType === "estante" && !estanteOficinaId) {
        setError("No se pudo determinar la oficina del estante seleccionado");
        setSubmitting(false);
        return;
      }
      
      const updateData: any = {
        oficina_id: targetType === "oficina" ? selectedOficinaId : estanteOficinaId,
      };
      
      if (targetType === "estante") {
        updateData.estante_id = selectedEstanteId;
      } else {
        updateData.estante_id = null; // Quitar estante si se mueve a oficina general
      }

      await activosApi.update(assetId, updateData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al realizar la transferencia");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#171717] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a]"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-200 dark:border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-gray-50 to-amber-50/60 dark:from-[#1f1f1f] dark:to-[#222017]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                <ArrowRight className="w-6 h-6" />
              </div>
              Transferir Activo
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Seleccione la nueva ubicación del activo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#242424] rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Paso 1: Tipo de Ubicación */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
              1. Seleccione tipo de ubicación
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setTargetType("oficina");
                  setSelectedEstanteId("");
                }}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  targetType === "oficina"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-sm"
                    : "border-gray-200 dark:border-[#2c2c2c] bg-gray-50 dark:bg-[#202020] text-gray-500 dark:text-gray-400 hover:border-amber-500/60"
                }`}
              >
                <Building2 className="w-8 h-8" />
                <span className="font-bold">Oficina</span>
              </button>
              <button
                onClick={() => setTargetType("estante")}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  targetType === "estante"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-sm"
                    : "border-gray-200 dark:border-[#2c2c2c] bg-gray-50 dark:bg-[#202020] text-gray-500 dark:text-gray-400 hover:border-amber-500/60"
                }`}
              >
                <Layout className="w-8 h-8" />
                <span className="font-bold">Estante</span>
              </button>
            </div>
          </div>

          {/* Paso 2: Selección Dinámica */}
          <div className="space-y-6">
            {targetType === "oficina" ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  2. Seleccione Oficina
                </label>
                <div className="relative">
                  <select
                    value={selectedOficinaId}
                    onChange={handleOficinaChange}
                    disabled={loading}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-[#222222] border-2 border-transparent focus:border-amber-500 rounded-2xl text-gray-900 dark:text-gray-100 outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">Seleccione una oficina...</option>
                    {oficinas.map((of) => (
                      <option key={of.id} value={of.id}>
                        {of.nombre} ({of.pisos?.edificios?.sedes?.nombre})
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-900 dark:text-white" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  2. Seleccione Estante
                </label>
                <div className="relative">
                  <select
                    value={selectedEstanteId}
                    onChange={(e) => setSelectedEstanteId(e.target.value)}
                    disabled={loading}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-[#222222] border-2 border-transparent focus:border-amber-500 rounded-2xl text-gray-900 dark:text-gray-100 outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">Seleccione un estante...</option>
                    {estantes.map((es) => (
                      <option key={es.id} value={es.id}>
                        {es.nombre} ({es.pasillos?.almacenes?.nombre || "Sin almacén"})
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-900 dark:text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 dark:bg-[#1f1f1f] flex gap-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors border border-gray-200 dark:border-[#343434]"
          >
            Cancelar
          </button>
          <button
            onClick={handleTransfer}
            disabled={submitting || (targetType === "oficina" ? !selectedOficinaId : !selectedEstanteId)}
            className="flex-1 px-6 py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Confirmar Transferencia"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
