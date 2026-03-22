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
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const SIZE = 280;

  // Keep offset & scale in a ref for perf-sensitive drag, and state for re-renders only when needed
  const offsetRef  = useRef({ x: 0, y: 0 });
  const scaleRef   = useRef(1);
  const minScale   = useRef(1); // minimum to fill the circle

  const [scale, setScaleState]   = useState(1);
  const [, forceUpdate]          = useState(0);
  const dragging                 = useRef(false);
  const dragStart                = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  // ── draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = offsetRef.current;
    const s = scaleRef.current;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, x, y, img.width * s, img.height * s);

    // Dark overlay with circular hole (even-odd)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, SIZE, SIZE);
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
    // Circle border
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, []);

  // ── load image ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = Math.max(SIZE / img.width, SIZE / img.height);
      minScale.current  = s;
      scaleRef.current  = s;
      offsetRef.current = { x: (SIZE - img.width * s) / 2, y: (SIZE - img.height * s) / 2 };
      setScaleState(s);
      draw();
    };
    img.src = src;
  }, [src, draw]);

  // re-draw whenever scale state triggers a re-render
  useEffect(() => { draw(); }, [scale, draw]);

  // ── clamp offset so image always covers the canvas ─────────────────────────
  const clampOffset = (ox: number, oy: number, s: number) => {
    const img = imgRef.current;
    if (!img) return { x: ox, y: oy };
    const w = img.width * s;
    const h = img.height * s;
    return {
      x: Math.min(0, Math.max(SIZE - w, ox)),
      y: Math.min(0, Math.max(SIZE - h, oy)),
    };
  };

  // ── zoom: keep center of canvas fixed ─────────────────────────────────────
  const handleZoomChange = (newScale: number) => {
    const img = imgRef.current;
    if (!img) return;
    const prevScale = scaleRef.current;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    // Point of canvas center in image-space
    const prevOx = offsetRef.current.x;
    const prevOy = offsetRef.current.y;
    // New offset that keeps the center pixel the same
    const newOx = cx - (cx - prevOx) * (newScale / prevScale);
    const newOy = cy - (cy - prevOy) * (newScale / prevScale);
    scaleRef.current  = newScale;
    offsetRef.current = clampOffset(newOx, newOy, newScale);
    setScaleState(newScale);
  };

  // ── drag (mouse) ──────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const raw = {
      x: dragStart.current.ox + e.clientX - dragStart.current.mx,
      y: dragStart.current.oy + e.clientY - dragStart.current.my,
    };
    offsetRef.current = clampOffset(raw.x, raw.y, scaleRef.current);
    draw();
  };
  const handleMouseUp = () => { dragging.current = false; forceUpdate(n => n + 1); };

  // ── drag (touch) ──────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragging.current = true;
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!dragging.current) return;
    const t = e.touches[0];
    const raw = {
      x: dragStart.current.ox + t.clientX - dragStart.current.mx,
      y: dragStart.current.oy + t.clientY - dragStart.current.my,
    };
    offsetRef.current = clampOffset(raw.x, raw.y, scaleRef.current);
    draw();
  };
  const handleTouchEnd = () => { dragging.current = false; };

  // ── confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    out.width  = SIZE;
    out.height = SIZE;
    const ctx = out.getContext("2d")!;
    const { x, y } = offsetRef.current;
    ctx.drawImage(img, x, y, img.width * scaleRef.current, img.height * scaleRef.current);
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Arrastra o pellizca para encuadrar</p>
        <div className="flex justify-center mb-6">
          <div className="rounded-full overflow-hidden" style={{ width: SIZE, height: SIZE }}>
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="cursor-grab active:cursor-grabbing select-none touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Zoom</label>
          <input
            type="range"
            min={minScale.current}
            max={minScale.current * 4}
            step={0.01}
            value={scale}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
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
// Password requirements regex & helper
// ────────────────────────────────────────────────────────────────────────────
const pwdRequirements = [
  { label: "Mínimo 8 caracteres",            test: (p: string) => p.length >= 8 },
  { label: "Al menos 1 mayúscula (A-Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { label: "Al menos 1 minúscula (a-z)",      test: (p: string) => /[a-z]/.test(p) },
  { label: "Al menos 1 número (0-9)",         test: (p: string) => /\d/.test(p) },
  { label: "Al menos 1 carácter especial (!@#…)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};'":|,.<>\/?`~]/.test(p) },
];

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
  const [touched, setTouched] = useState(false);

  const reqResults = pwdRequirements.map((r) => r.test(newPassword));
  const allReqsMet = reqResults.every(Boolean);

  const handleSubmit = async () => {
    setTouched(true);
    if (!currentPassword.trim()) { toast.error("Ingresa tu contraseña actual"); return; }
    if (!allReqsMet) { toast.error("La contraseña no cumple los requisitos de seguridad"); return; }
    if (newPassword !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (newPassword === currentPassword) { toast.error("La nueva contraseña debe ser diferente a la actual"); return; }
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
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña Actual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="Ej. MiPass@2024"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setTouched(true); }}
                className={inputClass}
                placeholder="Ej. NuevaContr@1"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Indicador de requisitos */}
            {touched && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 space-y-1 overflow-hidden"
              >
                {pwdRequirements.map((req, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs transition-colors ${
                    reqResults[i]
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${
                      reqResults[i]
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}>
                      {reqResults[i] ? "✓" : "✗"}
                    </span>
                    {req.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`${inputClass} ${
                  confirm && confirm !== newPassword
                    ? "border-red-400 dark:border-red-500"
                    : confirm && confirm === newPassword
                    ? "border-emerald-400 dark:border-emerald-500"
                    : ""
                }`}
                placeholder="Repite la contraseña"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirm && confirm !== newPassword && (
              <p className="text-xs text-red-500 mt-1 ml-2">Las contraseñas no coinciden</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Guardando..." : "Actualizar"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Confirm Save Modal
// ────────────────────────────────────────────────────────────────────────────
interface ConfirmSavePayload {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  hasPhoto: boolean;
}
function ConfirmSaveModal({
  payload,
  onConfirm,
  onCancel,
  loading,
}: {
  payload: ConfirmSavePayload;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Nombres",          value: payload.nombres },
    { label: "Apellido Paterno", value: payload.apellido_paterno },
    { label: "Apellido Materno", value: payload.apellido_materno || "—" },
    ...(payload.hasPhoto ? [{ label: "Foto de perfil", value: "Se subirá una nueva foto" }] : []),
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg dark:text-white">Confirmar cambios</h3>
          <button onClick={onCancel} disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          ¿Confirmas que quieres guardar los siguientes cambios en tu perfil?
        </p>
        <ul className="space-y-3 mb-6">
          {rows.map((r) => (
            <li key={r.label} className="flex items-start gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-36 shrink-0 pt-0.5">{r.label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white break-all">{r.value}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            Cancelar
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Guardando..." : "Confirmar"}
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
  // Modal de confirmación antes de guardar
  const [confirmPayload, setConfirmPayload] = useState<ConfirmSavePayload | null>(null);

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

  // ── Paso 1: Validar y mostrar el modal de confirmación ──
  const handleRequestSave = () => {
    if (!user?.id) return;

    // null-safe .trim()
    const nombresClean       = (settings.nombres         ?? "").trim();
    const apPaternoClean     = (settings.apellido_paterno ?? "").trim();
    const apMaternoClean     = (settings.apellido_materno ?? "").trim();

    if (!nombresClean)                { toast.error("El campo Nombres es requerido");                     return; }
    if (nombresClean.length < 2)      { toast.error("Nombres debe tener al menos 2 caracteres");           return; }
    if (nombresClean.length > 100)    { toast.error("Nombres no puede superar 100 caracteres");            return; }

    if (!apPaternoClean)              { toast.error("El Apellido Paterno es requerido");                   return; }
    if (apPaternoClean.length < 2)    { toast.error("Apellido Paterno debe tener al menos 2 caracteres"); return; }
    if (apPaternoClean.length > 100)  { toast.error("Apellido Paterno no puede superar 100 caracteres");  return; }

    if (apMaternoClean && apMaternoClean.length > 100) { toast.error("Apellido Materno no puede superar 100 caracteres"); return; }

    // Mostrar modal de confirmación con los valores limpios
    setConfirmPayload({
      nombres:          nombresClean,
      apellido_paterno: apPaternoClean,
      apellido_materno: apMaternoClean,
      hasPhoto:         !!selectedPhotoFile,
    });
  };

  // ── Paso 2: El usuario confirma → ejecutar el guardado real ──
  const handleConfirmSave = async () => {
    if (!user?.id || !confirmPayload) return;

    const { nombres, apellido_paterno, apellido_materno } = confirmPayload;

    const cleanedSettings = {
      nombres,
      apellido_paterno,
      apellido_materno: apellido_materno || null,
    };

    const nombre_completo = [nombres, apellido_paterno, apellido_materno]
      .filter(Boolean)
      .join(" ");

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

      await apiClient.patch(`/api/usuarios/${user.id}`, cleanedSettings);
      updateUser({ ...cleanedSettings, nombre_completo });
      setSettings({
        nombres,
        apellido_paterno,
        apellido_materno,
      });

      setConfirmPayload(null);
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
                      placeholder="Ej. Juan Carlos"
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido Paterno <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={100} value={settings.apellido_paterno}
                      onChange={(e) => setSettings({ ...settings, apellido_paterno: e.target.value })}
                      placeholder="Ej. García"
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido Materno</label>
                    <input type="text" maxLength={100} value={settings.apellido_materno}
                      onChange={(e) => setSettings({ ...settings, apellido_materno: e.target.value })}
                      placeholder="Ej. López"
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
              onClick={handleRequestSave}
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

      {/* Modal de confirmación de guardado */}
      <AnimatePresence>
        {confirmPayload && (
          <ConfirmSaveModal
            payload={confirmPayload}
            onConfirm={handleConfirmSave}
            onCancel={() => setConfirmPayload(null)}
            loading={isSaving}
          />
        )}
      </AnimatePresence>
    </>
  );
}
