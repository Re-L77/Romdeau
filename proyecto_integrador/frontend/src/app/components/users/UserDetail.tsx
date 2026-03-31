import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Shield, Calendar, Key, Clock, FileText, CheckCircle2, XCircle, Edit3, Lock, UserX, Eye, EyeOff, Camera, ChevronDown, Building2, User } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../../services/api';
import { toast } from 'sonner';

interface UserDetailProps {
  userId: string;
  onBack: () => void;
}

const getRoleDetails = (rol: string) => {
  switch (rol) {
    case 'ADMIN': return { descripcion: 'Administrador del Sistema', color: 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' };
    case 'AUDITOR': return { descripcion: 'Auditor de Campo', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30' };
    case 'EMPLEADO':
    default: return { descripcion: 'Empleado General', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30' };
  }
};

const getRolePermissions = (rol: string) => {
  switch (rol) {
    case 'ADMIN': return ['Crear y eliminar usuarios', 'Modificar roles y permisos', 'Acceso a todos los activos', 'Gestión de auditorías', 'Configuración del sistema', 'Exportar reportes'];
    case 'AUDITOR': return ['Realizar auditorías', 'Escanear códigos QR', 'Actualizar ubicación de activos', 'Ver reportes de auditoría'];
    case 'EMPLEADO': 
    default: return ['Ver sus activos asignados', 'Reportar problemas', 'Ver historial de activos'];
  }
};

const getAvatarColor = (id: string) => {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-emerald-400 to-emerald-600',
    'from-orange-400 to-orange-600',
    'from-indigo-400 to-indigo-600'
  ];
  let hash = 0;
  if (id) {
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  }
  return colors[hash % colors.length];
};

const getAvatarInitials = (user: any) => {
  const n = user.nombres ? user.nombres.charAt(0).toUpperCase() : '';
  const a = user.apellido_paterno ? user.apellido_paterno.charAt(0).toUpperCase() : '';
  return n + a || 'U';
};

const rolesOptions = [
  { value: 'ADMIN', label: 'Administrador del Sistema', description: 'Acceso total al sistema', icon: Shield },
  { value: 'AUDITOR', label: 'Auditor de Campo', description: 'Ejecuta auditorías QR', icon: Shield },
  { value: 'EMPLEADO', label: 'Empleado General', description: 'Usuario regular', icon: User }
];

const activityIcons = {
  create: CheckCircle2,
  edit: FileText,
  login: Key,
  complete: CheckCircle2,
  scan: CheckCircle2,
  report: FileText,
  view: FileText,
};

const pwdRequirements = [
  { label: "Mínimo 8 caracteres",            test: (p: string) => p.length >= 8 },
  { label: "Al menos 1 mayúscula (A-Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { label: "Al menos 1 minúscula (a-z)",      test: (p: string) => /[a-z]/.test(p) },
  { label: "Al menos 1 número (0-9)",         test: (p: string) => /\d/.test(p) },
  { label: "Al menos 1 carácter especial (!@#…)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};'":|,.<>\/?`~]/.test(p) },
];

export function UserDetail({ userId, onBack }: UserDetailProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal states
  const [editModal, setEditModal] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({ 
    nombres: '', 
    apellido_paterno: '', 
    apellido_materno: '', 
    telefono: '',
    rol: 'EMPLEADO',
    departamento_id: undefined as number | undefined
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [departamentos, setDepartamentos] = useState<{ id: number; nombre: string }[]>([]);
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient.get('/api/departamentos').then((data: any) => setDepartamentos(data)).catch(console.error);
  }, []);

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);

  const reqResults = pwdRequirements.map((r) => r.test(newPassword));
  const allReqsMet = reqResults.every(Boolean);

  const openEdit = () => {
    if (!user) return;
    setEditForm({
      nombres: user.nombres || '',
      apellido_paterno: user.apellido_paterno || '',
      apellido_materno: user.apellido_materno || '',
      telefono: user.telefono || '',
      rol: user.roles_usuario?.nombre || user.rol || 'EMPLEADO',
      departamento_id: user.departamento_id || 
                       (user.departamento ? departamentos.find(d => d.nombre === user.departamento)?.id : undefined) ||
                       (user.departamentos ? departamentos.find(d => d.nombre === user.departamentos.nombre)?.id : undefined)
    });
    setPreviewUrl(user.foto_perfil_url || null);
    setFotoPerfilFile(null);
    setCropImageSrc(null);
    setEditErrors({});
    setEditModal(true);
  };

  const handleEdit = async () => {
    const newErrors: Record<string, string> = {};
    if (!editForm.nombres.trim()) newErrors.nombres = 'El nombre es obligatorio';
    if (!editForm.apellido_paterno.trim()) newErrors.apellido_paterno = 'El apellido paterno es obligatorio';
    if (!editForm.departamento_id) newErrors.departamento_id = 'El departamento es obligatorio';
    if (!editForm.rol) newErrors.rol = 'El rol es obligatorio';

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      toast.error('Por favor, completa los campos requeridos');
      return;
    }
    setEditErrors({});

    setSaving(true);
    try {
      const rolMap: Record<string, number> = {
        'ADMIN': 1,
        'AUDITOR': 2,
        'EMPLEADO': 3,
      };

      const payload = {
        nombres: editForm.nombres,
        apellido_paterno: editForm.apellido_paterno,
        apellido_materno: editForm.apellido_materno || null,
        telefono: editForm.telefono || null,
        rol_id: rolMap[editForm.rol] || 3,
        departamento_id: editForm.departamento_id || null,
      };

      // 1. Update text fields
      let updatedUser = await apiClient.patch(`/api/usuarios/${userId}`, payload);

      // 2. Update photo if changed
      if (fotoPerfilFile && updatedUser?.id) {
        toast.loading('Subiendo fotografía de perfil...', { id: 'upload-toast' });
        const formDataUpload = new FormData();
        formDataUpload.append('file', fotoPerfilFile);
        
        const token = localStorage.getItem("accessToken");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        const fotoRes = await fetch(`${apiUrl}/api/usuarios/${updatedUser.id}/foto-perfil/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataUpload
        });

        if (!fotoRes.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const fotoData = await fotoRes.json();
        updatedUser = fotoData; // should have the new photo URL
        toast.success('Fotografía actualizada', { id: 'upload-toast' });
      }

      setUser((prev: any) => ({ ...prev, ...updatedUser }));
      setEditModal(false);
      toast.success('Usuario actualizado correctamente');
    } catch (e: any) {
      toast.dismiss('upload-toast');
      toast.error(e?.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  // --- Image Handlers ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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
    setFotoPerfilFile(newFile);
    setPreviewUrl(URL.createObjectURL(blob));
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
  };

  const handlePasswordChange = async () => {
    setPwTouched(true);
    if (!allReqsMet) {
      toast.error('La contraseña no cumple los requisitos de seguridad');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch(`/api/usuarios/${userId}/password`, { password: newPassword });
      setPwModal(false);
      setNewPassword('');
      toast.success('Contraseña cambiada correctamente');
    } catch (e: any) {
      toast.error(e?.message || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setSaving(true);
    try {
      if (user.activo) {
        await apiClient.delete(`/api/usuarios/${userId}`);
        toast.success('Usuario desactivado');
      } else {
        await apiClient.patch(`/api/usuarios/${userId}`, { activo: true });
        toast.success('Usuario activado');
      }
      setUser((prev: any) => ({ ...prev, activo: !prev.activo }));
      setDeactivateModal(false);
    } catch (e: any) {
      toast.error(e?.message || 'Error al cambiar estado del usuario');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient.get(`/api/usuarios/${userId}`);
        setUser(data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12 flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Usuarios</span>
          </motion.button>
          
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center max-w-md mx-auto">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-1">Usuario no encontrado</h2>
            <p className="text-red-600 dark:text-red-300 text-sm">El usuario no existe o la conexión falló.</p>
          </div>
        </div>
      </main>
    );
  }

  const roleInfo = getRoleDetails(user.rol);
  const rolePermissions = getRolePermissions(user.rol);
  // Default metrics as dummy since they are not modeled directly in backend relations right now
  const recentActivity = user.recent_activity?.length > 0 ? user.recent_activity : [{ action: 'Cuenta creada', date: user.created_at, type: 'create' }];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <>
    <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Usuarios</span>
          </motion.button>

          <div className="flex items-center gap-6 mb-6">
            {user.foto_perfil_url ? (
              <img 
                src={user.foto_perfil_url} 
                alt={user.nombre_completo}
                className="w-24 h-24 rounded-full object-cover shadow-xl"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}
              >
                {getAvatarInitials(user)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2 dark:text-white">{user.nombre_completo}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Información del Perfil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Rol del Sistema</p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold border ${roleInfo.color}`}
                    >
                      {user.rol}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{roleInfo.descripcion}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Estado</p>
                  {user.activo ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-700/30">
                      <CheckCircle2 className="w-4 h-4" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium border border-red-200 dark:border-red-700/30">
                      <XCircle className="w-4 h-4" />
                      Inactivo
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Departamento</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.departamento || 'General'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Teléfono</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.telefono || 'No registrado'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Fecha de Registro</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-900 dark:text-white font-medium">{formatShortDate(user.created_at)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Último Acceso</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca ha iniciado sesión'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Permissions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Permisos y Accesos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rolePermissions.map((permission, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{permission}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Actividad Reciente</h2>
              <div className="space-y-4">
                {recentActivity.map((activity: any, index: number) => {
                  const ActivityIcon = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.create;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700"
                    >
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <ActivityIcon className="w-5 h-5 text-white dark:text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Estadísticas</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Activos Asignados</p>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold dark:text-white">{user.assets_assigned || 0}</p>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Auditorías Completadas</p>
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold dark:text-white">{user.audits_completed || 0}</p>
                </div>
              </div>
            </motion.div>

            {/* Assigned Assets */}
            {user.activos && user.activos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <h2 className="text-xl font-bold mb-4 dark:text-white">Activos Asignados</h2>
                <div className="space-y-3">
                  {user.activos.map((activo: any, index: number) => (
                    <motion.div
                      key={activo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {activo.foto_principal_url ? (
                            <img src={activo.foto_principal_url} alt={activo.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {activo.nombre || activo.codigo_etiqueta || 'Sin nombre'}
                          </p>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{activo.codigo_etiqueta}</p>
                          {activo.categorias?.nombre && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{activo.categorias.nombre}</p>
                          )}
                        </div>
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                          {activo.estados_activo?.nombre || 'N/A'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Acciones</h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openEdit}
                  className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Usuario
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPwModal(true)}
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeactivateModal(true)}
                  className={`w-full px-6 py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${
                    user.activo
                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                  }`}
                >
                  {user.activo ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Desactivar Usuario
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Activar Usuario
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* User ID */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">UUID del Usuario</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                {user.id}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </main>

    {/* === MODAL: Edit User === */}
    <AnimatePresence>
      {editModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          onClick={() => setEditModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto hidden-scrollbar"
          >
            <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
              <Edit3 className="w-5 h-5" /> Editar Usuario
            </h2>
            
            <div className="space-y-6">
              {/* Avatar Picker */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div 
                    onClick={handleAvatarClick}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-white cursor-pointer overflow-hidden border-4 border-white dark:border-[#1a1a1a] shadow-lg hover:opacity-90 transition-opacity"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                     <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-3.5 h-3.5 text-white dark:text-black" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['nombres','Nombres (Obligatorio)'],['apellido_paterno','Apellido Paterno (Oblig.)'],['apellido_materno','Apellido Materno'],['telefono','Teléfono']].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
                    <input
                      value={(editForm as any)[field] || ''}
                      onChange={e => {
                        setEditForm(prev => ({ ...prev, [field]: e.target.value }));
                        if (editErrors[field]) setEditErrors(prev => ({ ...prev, [field]: '' }));
                      }}
                      className={`w-full px-4 py-3 border ${editErrors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-black dark:focus:ring-white'} rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2`}
                    />
                    {editErrors[field] && <p className="text-red-500 text-xs mt-1">{editErrors[field]}</p>}
                  </div>
                ))}
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol de Acceso</label>
                    <div className="relative">
                      <select
                        value={editForm.rol}
                        onChange={(e) => {
                          setEditForm(prev => ({ ...prev, rol: e.target.value }));
                          if (editErrors.rol) setEditErrors(prev => ({ ...prev, rol: '' }));
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${editErrors.rol ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-black dark:focus:ring-white'} rounded-2xl text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2`}
                      >
                        {rolesOptions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {editErrors.rol && <p className="text-red-500 text-xs mt-1">{editErrors.rol}</p>}
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento</label>
                    <div className="relative">
                      <select
                        value={editForm.departamento_id || ''}
                        onChange={(e) => {
                          setEditForm(prev => ({ ...prev, departamento_id: Number(e.target.value) }));
                          if (editErrors.departamento_id) setEditErrors(prev => ({ ...prev, departamento_id: '' }));
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${editErrors.departamento_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-black dark:focus:ring-white'} rounded-2xl text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2`}
                      >
                        <option value="" disabled>Seleccione...</option>
                        {departamentos.map(d => (
                          <option key={d.id} value={d.id}>{d.nombre}</option>
                        ))}
                      </select>
                      <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {editErrors.departamento_id && <p className="text-red-500 text-xs mt-1">{editErrors.departamento_id}</p>}
                 </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setEditModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium">Cancelar</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleEdit} disabled={saving} className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* === MODAL: Change Password === */}
    <AnimatePresence>
      {pwModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          onClick={() => setPwModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 w-full max-w-md"
          >
            <h2 className="text-xl font-bold dark:text-white mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Cambiar Contraseña
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Completa los requisitos de seguridad.</p>
            <div className="relative mb-4">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPwTouched(true); }}
                placeholder="Nueva contraseña"
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              <button onClick={() => setShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {pwdRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm transition-colors duration-200">
                  {reqResults[i] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                  )}
                  <span className={reqResults[i] ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setPwModal(false); setNewPassword(''); setPwTouched(false); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium">Cancelar</motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handlePasswordChange} disabled={saving} className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium disabled:opacity-50">
                {saving ? 'Cambiando...' : 'Cambiar'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* === MODAL: Toggle Status === */}
    <AnimatePresence>
      {deactivateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          onClick={() => setDeactivateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              user.activo ? 'bg-red-100 dark:bg-red-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'
            }`}>
              {user.activo ? (
                <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-2">
              {user.activo ? '¿Desactivar usuario?' : '¿Activar usuario?'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              El usuario <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.nombre_completo}</span> {user.activo ? 'perderá' : 'recuperará'} acceso al sistema. Esta acción puede revertirse.
            </p>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setDeactivateModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium">Cancelar</motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleToggleStatus} disabled={saving} className={`flex-1 py-3 text-white rounded-full font-medium transition-colors disabled:opacity-50 ${
                user.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}>
                {saving 
                  ? (user.activo ? 'Desactivando...' : 'Activando...')
                  : 'Confirmar'
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Image Cropper */}
    <AnimatePresence>
      {cropImageSrc && (
        <CropModal
          src={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </AnimatePresence>
  </>
  );
}

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
            <XCircle className="w-5 h-5 dark:text-white" />
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