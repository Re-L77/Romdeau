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
      // Reset state
      setTargetType("oficina");
      setSelectedOficinaId("");
      setSelectedEstanteId("");
      setError(null);
    }
  }, [isOpen]);

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

  const loadEstantes = async (oficinaId: string) => {
    if (!oficinaId) return;
    try {
      setLoading(true);
      const oficina = oficinas.find((o) => o.id === oficinaId);
      const sedeId = oficina?.pisos?.edificios?.sede_id;
      const data = await ubicacionesApi.getEstantes(sedeId);
      setEstantes(data);
    } catch (err) {
      setError("Error al cargar estantes");
    } finally {
      setLoading(false);
    }
  };

  const handleOficinaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedOficinaId(id);
    setSelectedEstanteId("");
    if (targetType === "estante") {
      loadEstantes(id);
    }
  };

  const handleTransfer = async () => {
    // Validaciones
    if (targetType === "oficina" && !selectedOficinaId) {
      setError("Debe seleccionar una oficina");
      return;
    }
    if (targetType === "estante" && (!selectedOficinaId || !selectedEstanteId)) {
      setError("Debe seleccionar una oficina y un estante");
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
      
      const updateData: any = {
        oficina_id: selectedOficinaId,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-900/10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
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
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
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
                    ? "border-black dark:border-white bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Building2 className="w-8 h-8" />
                <span className="font-bold">Oficina</span>
              </button>
              <button
                onClick={() => setTargetType("estante")}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  targetType === "estante"
                    ? "border-black dark:border-white bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Layout className="w-8 h-8" />
                <span className="font-bold">Estante</span>
              </button>
            </div>
          </div>

          {/* Paso 2: Selección Dinámica */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                2. Seleccione Oficina
              </label>
              <div className="relative">
                <select
                  value={selectedOficinaId}
                  onChange={handleOficinaChange}
                  disabled={loading}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-2xl text-gray-900 dark:text-white outline-none transition-all appearance-none disabled:opacity-50"
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

            {targetType === "estante" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  3. Seleccione Estante
                </label>
                <div className="relative">
                  <select
                    value={selectedEstanteId}
                    onChange={(e) => setSelectedEstanteId(e.target.value)}
                    disabled={loading || !selectedOficinaId}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-black dark:focus:border-white rounded-2xl text-gray-900 dark:text-white outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">
                      {selectedOficinaId ? "Seleccione un estante..." : "Primero seleccione oficina"}
                    </option>
                    {estantes.map((es) => (
                      <option key={es.id} value={es.id}>
                        {es.nombre} ({es.pasillos?.almacenes?.nombre})
                      </option>
                    ))}
                  </select>
                  {loading && selectedOficinaId && (
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
        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleTransfer}
            disabled={submitting || (targetType === "oficina" ? !selectedOficinaId : !selectedEstanteId)}
            className="flex-1 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:bg-gray-900 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/5 dark:shadow-white/5 disabled:opacity-50 disabled:shadow-none"
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
