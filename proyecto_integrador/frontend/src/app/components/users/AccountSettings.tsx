import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Shield, Save, Upload, Loader2, Lock, X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";
import { apiClient } from "../../../services/api";

// ────────────────────────────────────────────────────────────────────────────
// Image Crop Modal (canvas-based, no deps)
// ────────────────────────────────────────────────────────────────────────────
function CropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const SIZE = 280;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = Math.max(SIZE / img.width, SIZE / img.height);
      setScale(s);
      setOffset({ x: (SIZE - img.width * s) / 2, y: (SIZE - img.height * s) / 2 });
    };
    img.src = src;
  }, [src]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Draw the image
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);
    // Draw dark overlay with a hole punched through for the circle (evenodd rule)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, SIZE, SIZE);                              // outer rect
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2, true); // circle hole (CCW)
    ctx.fill("evenodd");
    // Draw circle border
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [offset, scale]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + e.clientX - dragStart.current.x,
      y: dragStart.current.oy + e.clientY - dragStart.current.y,
    });
  };
  const handleMouseUp = () => setDragging(false);

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const out = document.createElement("canvas");
    out.width = SIZE;
    out.height = SIZE;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);
    out.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg dark:text-white">Ajustar Foto</h3>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Arrastra la imagen para encuadrarla</p>
        <div className="flex justify-center mb-6">
          <div className="rounded-full overflow-hidden" style={{ width: SIZE, height: SIZE }}>
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Zoom</label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1 accent-black dark:accent-white"
          />
        </div>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm}
            className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors">
            Aplicar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Change Password Modal
// ────────────────────────────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword) { toast.error("Ingresa tu contraseña actual"); return; }
    if (newPassword.length < 8) { toast.error("La nueva contraseña debe tener al menos 8 caracteres"); return; }
    if (newPassword !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al cambiar contraseña");
      }
      toast.success("Contraseña actualizada exitosamente");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all pr-12";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg dark:text-white">Cambiar Contraseña</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña Actual</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass}
                placeholder="Tu contraseña actual" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} className={inputClass}
                placeholder="Mínimo 8 caracteres" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className={inputClass}
                placeholder="Repite la contraseña" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Guardando..." : "Actualizar"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────
export function AccountSettings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    nombres: user?.nombres || "",
    apellido_paterno: user?.apellido_paterno || "",
    apellido_materno: user?.apellido_materno || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(user?.foto_perfil_url || "");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        nombres: user.nombres || "",
        apellido_paterno: user.apellido_paterno || "",
        apellido_materno: user.apellido_materno || "",
      });
      setPhotoPreviewUrl(user.foto_perfil_url || "");
    }
  }, [user]);

  const handlePhotoUploadClick = () => { fileInputRef.current?.click(); };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten archivos de imagen"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede exceder 5 MB"); return; }
    setCropSrc(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleCropConfirm = (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setCropSrc(null);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!settings.nombres.trim()) { toast.error("Nombres es requerido"); return; }
    if (!settings.apellido_paterno.trim()) { toast.error("Apellido Paterno es requerido"); return; }

    setIsSaving(true);
    try {
      if (selectedPhotoFile) {
        const formData = new FormData();
        formData.append("file", selectedPhotoFile);
        const accessToken = localStorage.getItem("accessToken");
        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/usuarios/${user.id}/foto-perfil/upload`,
          {
            method: "POST",
            headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
            body: formData,
          },
        );
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.message || "Error al subir la foto");
        }
        const uploaded = await uploadRes.json();
        updateUser({ foto_perfil_url: uploaded.foto_perfil_url });
        setSelectedPhotoFile(null);
      }

      await apiClient.patch(`/api/usuarios/${user.id}`, settings);
      updateUser({ ...settings });

      toast.success("Configuración guardada exitosamente");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {cropSrc && (
          <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />
        )}
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>

      <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Configuración de Cuenta</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona tu perfil y preferencias del sistema</p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Información Personal</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actualiza tu información de perfil</p>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-8 mb-8">
                <div className="relative w-24 h-24 shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-3xl font-bold shadow-lg overflow-hidden">
                    {photoPreviewUrl ? (
                      <img src={photoPreviewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="opacity-80">{user?.nombres ? user.nombres.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  {selectedPhotoFile && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a1a]">
                      <Upload className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoFileChange} className="hidden" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handlePhotoUploadClick} disabled={isSaving}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {selectedPhotoFile ? "Cambiar selección" : "Cambiar Foto"}
                  </motion.button>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {selectedPhotoFile
                      ? `Listo: ${selectedPhotoFile.name} • Se subirá al guardar`
                      : "JPG, PNG, WEBP o GIF (máx. 5 MB)"}
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={100} value={settings.nombres}
                      onChange={(e) => setSettings({ ...settings, nombres: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido Paterno <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={100} value={settings.apellido_paterno}
                      onChange={(e) => setSettings({ ...settings, apellido_paterno: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido Materno</label>
                    <input type="text" maxLength={100} value={settings.apellido_materno}
                      onChange={(e) => setSettings({ ...settings, apellido_materno: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input type="email" readOnly value={user?.email || ""}
                        className="w-full pl-14 pr-5 py-3 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-full text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol del Sistema</label>
                  <div className="px-5 py-3 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center gap-3 opacity-80 cursor-not-allowed">
                    <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-600 dark:text-gray-300">{user?.rol || "Usuario"}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Seguridad</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona tu contraseña</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-black dark:hover:border-white transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cambiar Contraseña</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza tu contraseña regularmente</p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </motion.button>
            </motion.div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg ${
                isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-900 dark:hover:bg-gray-100"
              }`}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </motion.button>
          </div>
        </div>
      </main>
    </>
  );
}
