import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Shield, CheckCircle, AlertCircle, Camera, Building2, Phone } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../../services/api';

interface CrearUsuarioProps {
  onClose: () => void;
  onSave: (usuarioData: UsuarioFormData) => void;
}

export interface UsuarioFormData {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono?: string;
  departamento_id?: number;
  rol: 'ADMIN' | 'AUDITOR' | 'EMPLEADO';
  activo: boolean;
  generar_password_temporal: boolean;
  password_temporal?: string;
  foto_perfil?: File | null;
}

const rolesOptions = [
  { 
    value: 'ADMIN', 
    label: 'Administrador del Sistema',
    color: 'from-purple-400 to-purple-600',
    description: 'Acceso total al sistema',
    permisos: [
      'Crear y eliminar usuarios',
      'Modificar roles y permisos',
      'Acceso a todos los activos',
      'Gestión de auditorías',
      'Configuración del sistema',
      'Exportar reportes',
      'Gestión de proveedores',
      'Acceso a análisis financiero'
    ]
  },
  { 
    value: 'AUDITOR', 
    label: 'Auditor de Campo',
    color: 'from-blue-400 to-blue-600',
    description: 'Ejecuta auditorías QR',
    permisos: [
      'Escanear códigos QR',
      'Reportar estado de activos',
      'Tomar fotografías',
      'Registrar ubicación GPS',
      'Agregar comentarios',
      'Ver activos asignados'
    ]
  },
  { 
    value: 'EMPLEADO', 
    label: 'Empleado General',
    color: 'from-blue-400 to-blue-600',
    description: 'Usuario regular',
    permisos: [
      'Ver activos asignados a su persona'
    ]
  }
];

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

export function CrearUsuario({ onClose, onSave }: CrearUsuarioProps) {
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    departamento_id: undefined,
    rol: 'EMPLEADO',
    activo: true,
    generar_password_temporal: true,
    password_temporal: '',
    foto_perfil: null,
  });

  const [departamentos, setDepartamentos] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    apiClient.get('/api/departamentos').then((data: any) => {
      setDepartamentos(data);
    }).catch(console.error);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const step2EntryTime = useRef(0);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
      if (e.target) e.target.value = '';
    }
  };

  const handleCropConfirm = (blob: Blob) => {
    const newFile = new File([blob], 'perfil.jpg', { type: 'image/jpeg' });
    updateField('foto_perfil', newFile);
    setPreviewUrl(URL.createObjectURL(blob));
    setCropImageSrc(null);
    if (errors.foto_perfil) {
      setErrors({ ...errors, foto_perfil: '' });
    }
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim() || formData.nombres.trim().length <= 1) {
      newErrors.nombres = 'El nombre es obligatorio y debe tener más de 1 carácter';
    }

    if (!formData.apellido_paterno.trim() || formData.apellido_paterno.trim().length <= 1) {
      newErrors.apellido_paterno = 'El apellido paterno es obligatorio y debe tener más de 1 carácter';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.departamento_id) {
      newErrors.departamento_id = 'El departamento es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.rol) {
      newErrors.rol = 'Selecciona un rol';
    }

    if (!formData.generar_password_temporal && !formData.password_temporal) {
      newErrors.password_temporal = 'Ingresa una contraseña o activa generación automática';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      step2EntryTime.current = Date.now();
      setCurrentStep(2);
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir el bug de bleed-through donde un doble-clic accidental en "Siguiente" le pega a "Crear Usuario"
    if (Date.now() - step2EntryTime.current < 500) {
      return;
    }

    if (currentStep === 1) {
      if (validateStep1()) {
        step2EntryTime.current = Date.now();
        setCurrentStep(2);
      }
      return;
    }

    if (validateStep2()) {
      // Si se debe generar contraseña temporal, generarla ahora
      const finalData = { ...formData };
      if (formData.generar_password_temporal) {
        finalData.password_temporal = generatePassword();
      }
      onSave(finalData);
    }
  };

  const updateField = (field: keyof UsuarioFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleRolChange = (rol: 'ADMIN' | 'AUDITOR' | 'EMPLEADO') => {
    updateField('rol', rol);
  };

  const steps = [
    { number: 1, title: 'Datos Personales', icon: User },
    { number: 2, title: 'Rol y Estado', icon: Shield },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onMouseDown={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold dark:text-white">Invitar Nuevo Usuario</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Completa la información para crear una nueva cuenta de usuario
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 dark:text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : isActive 
                            ? 'bg-black dark:bg-white border-black dark:border-white' 
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${
                            isActive 
                              ? 'text-white dark:text-black' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        )}
                      </div>
                      <p className={`text-[10px] mt-1 font-medium ${
                        isActive 
                          ? 'text-black dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${
                        isCompleted 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-4 space-y-3">
              {/* Step 1: Datos Personales */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Avatar Placeholder */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div 
                        onClick={handleAvatarClick}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white cursor-pointer overflow-hidden border-2 border-white dark:border-gray-800 shadow-md hover:opacity-90 transition-opacity"
                      >
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Camera className="w-3 h-3 text-white dark:text-black" />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Nombres */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <User className="w-3 h-3 inline mr-1" />
                        Nombre(s) *
                      </label>
                      <input
                        type="text"
                        value={formData.nombres}
                        onChange={(e) => updateField('nombres', e.target.value)}
                        placeholder="Ej: Carlos Eduardo"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.nombres 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.nombres && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.nombres}
                        </p>
                      )}
                    </div>

                    {/* Apellido Paterno */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Apellido Paterno *
                      </label>
                      <input
                        type="text"
                        value={formData.apellido_paterno}
                        onChange={(e) => updateField('apellido_paterno', e.target.value)}
                        placeholder="Ej: Mendoza"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.apellido_paterno 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.apellido_paterno && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.apellido_paterno}
                        </p>
                      )}
                    </div>

                    {/* Apellido Materno */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Apellido Materno (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.apellido_materno}
                        onChange={(e) => updateField('apellido_materno', e.target.value)}
                        placeholder="Ej: García"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Mail className="w-3 h-3 inline mr-1" />
                        Email Corporativo *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="carlos.mendoza@empresa.com"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Teléfono (Opcional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Phone className="w-3 h-3 inline mr-1" />
                        Teléfono Móvil (Opcional)
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono || ''}
                        onChange={(e) => updateField('telefono', e.target.value)}
                        placeholder="Ej: 5544332211"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                      />
                    </div>

                    {/* Departamento (*) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Building2 className="w-3 h-3 inline mr-1" />
                        Departamento *
                      </label>
                      <select
                        value={formData.departamento_id || ''}
                        onChange={(e) => updateField('departamento_id', Number(e.target.value))}
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.departamento_id 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent appearance-none`}
                      >
                        <option value="" disabled>Selecciona un departamento</option>
                        {departamentos.map(d => (
                          <option key={d.id} value={d.id}>{d.nombre}</option>
                        ))}
                      </select>
                      {errors.departamento_id && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.departamento_id}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Rol y Permisos */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Selección de Rol */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Rol del Usuario *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {rolesOptions.map(option => {
                        const isSelected = formData.rol === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleRolChange(option.value as any)}
                            className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{option.label}</p>
                                <p className={`text-[10px] truncate ${
                                  isSelected 
                                    ? 'text-white/80 dark:text-black/80' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {option.description}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.rol && (
                      <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {errors.rol}
                      </p>
                    )}
                  </div>

                  {/* Configuración de Estado */}
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        formData.activo 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.activo && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Cuenta Activa</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          El usuario podrá iniciar sesión inmediatamente
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => updateField('activo', e.target.checked)}
                      className="sr-only"
                    />
                  </label>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Paso {currentStep} de 2
              </div>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Crear Usuario
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
      
      {/* Selector de Recorte/Zoom */}
      <AnimatePresence>
        {cropImageSrc && (
          <CropModal
            src={cropImageSrc}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}