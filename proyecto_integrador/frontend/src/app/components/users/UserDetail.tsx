import { motion } from 'motion/react';
import { ArrowLeft, Mail, Shield, Calendar, Key, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/api';

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

const activityIcons = {
  create: CheckCircle2,
  edit: FileText,
  login: Key,
  complete: CheckCircle2,
  scan: CheckCircle2,
  report: FileText,
  view: FileText,
};

export function UserDetail({ userId, onBack }: UserDetailProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

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
      <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12 flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
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
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
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
                    <p className="text-gray-900 dark:text-white font-medium">No disponible</p>
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
                  className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                >
                  Editar Usuario
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cambiar Contraseña
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full font-medium hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                >
                  Desactivar Usuario
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
  );
}