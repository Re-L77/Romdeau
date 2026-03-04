import { motion } from 'motion/react';
import { ArrowLeft, Mail, Shield, Calendar, Key, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface UserDetailProps {
  userId: string;
  onBack: () => void;
}

const userData = {
  'u1a2b3c4-d5e6-7890-abcd-ef1234567890': {
    id: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
    nombre_completo: 'Carlos Mendoza',
    email: 'carlos.mendoza@romdeau.com',
    rol_id: 1,
    rol: 'ADMIN',
    rol_descripcion: 'Administrador del Sistema',
    avatar: 'CM',
    avatarColor: 'from-blue-400 to-blue-600',
    activo: true,
    created_at: '2024-01-15T10:00:00Z',
    last_login: '2026-02-25T08:30:00Z',
    phone: '+52 55 1234 5678',
    department: 'Tecnología',
    permissions: [
      'Crear y eliminar usuarios',
      'Modificar roles y permisos',
      'Acceso a todos los activos',
      'Gestión de auditorías',
      'Configuración del sistema',
      'Exportar reportes',
    ],
    recent_activity: [
      { action: 'Creó auditoría AUD-2026-042', date: '2026-02-24T16:20:00Z', type: 'create' },
      { action: 'Modificó activo AST-2024-001', date: '2026-02-24T14:15:00Z', type: 'edit' },
      { action: 'Inició sesión', date: '2026-02-24T08:30:00Z', type: 'login' },
    ],
    assets_assigned: 3,
    audits_completed: 45,
  },
  'u2b3c4d5-e6f7-8901-bcde-f12345678901': {
    id: 'u2b3c4d5-e6f7-8901-bcde-f12345678901',
    nombre_completo: 'Ana Gutiérrez',
    email: 'ana.gutierrez@romdeau.com',
    rol_id: 2,
    rol: 'AUDITOR',
    rol_descripcion: 'Auditor de Campo',
    avatar: 'AG',
    avatarColor: 'from-purple-400 to-purple-600',
    activo: true,
    created_at: '2024-02-10T11:15:00Z',
    last_login: '2026-02-25T09:15:00Z',
    phone: '+52 55 2345 6789',
    department: 'Auditoría',
    permissions: [
      'Realizar auditorías',
      'Escanear códigos QR',
      'Actualizar ubicación de activos',
      'Ver reportes de auditoría',
    ],
    recent_activity: [
      { action: 'Completó auditoría AUD-2026-041', date: '2026-02-24T18:45:00Z', type: 'complete' },
      { action: 'Escaneó 15 activos', date: '2026-02-24T17:30:00Z', type: 'scan' },
      { action: 'Inició sesión', date: '2026-02-24T09:00:00Z', type: 'login' },
    ],
    assets_assigned: 0,
    audits_completed: 128,
  },
  'u3c4d5e6-f7g8-9012-cdef-234567890123': {
    id: 'u3c4d5e6-f7g8-9012-cdef-234567890123',
    nombre_completo: 'Jorge Pérez',
    email: 'jorge.perez@romdeau.com',
    rol_id: 2,
    rol: 'AUDITOR',
    rol_descripcion: 'Auditor de Campo',
    avatar: 'JP',
    avatarColor: 'from-pink-400 to-pink-600',
    activo: true,
    created_at: '2024-02-15T16:45:00Z',
    last_login: '2026-02-24T16:20:00Z',
    phone: '+52 55 3456 7890',
    department: 'Auditoría',
    permissions: [
      'Realizar auditorías',
      'Escanear códigos QR',
      'Actualizar ubicación de activos',
      'Ver reportes de auditoría',
    ],
    recent_activity: [
      { action: 'Completó auditoría AUD-2026-040', date: '2026-02-23T15:20:00Z', type: 'complete' },
      { action: 'Escaneó 22 activos', date: '2026-02-23T14:00:00Z', type: 'scan' },
      { action: 'Inició sesión', date: '2026-02-23T08:45:00Z', type: 'login' },
    ],
    assets_assigned: 1,
    audits_completed: 97,
  },
  'u4d5e6f7-g8h9-0123-defg-345678901234': {
    id: 'u4d5e6f7-g8h9-0123-defg-345678901234',
    nombre_completo: 'María Rodríguez',
    email: 'maria.rodriguez@romdeau.com',
    rol_id: 2,
    rol: 'AUDITOR',
    rol_descripcion: 'Auditor de Campo',
    avatar: 'MR',
    avatarColor: 'from-emerald-400 to-emerald-600',
    activo: true,
    created_at: '2024-02-20T09:30:00Z',
    last_login: '2026-02-25T07:45:00Z',
    phone: '+52 55 4567 8901',
    department: 'Auditoría',
    permissions: [
      'Realizar auditorías',
      'Escanear códigos QR',
      'Actualizar ubicación de activos',
      'Ver reportes de auditoría',
    ],
    recent_activity: [
      { action: 'Escaneó 18 activos', date: '2026-02-24T16:30:00Z', type: 'scan' },
      { action: 'Completó auditoría AUD-2026-039', date: '2026-02-24T15:45:00Z', type: 'complete' },
      { action: 'Inició sesión', date: '2026-02-24T07:30:00Z', type: 'login' },
    ],
    assets_assigned: 2,
    audits_completed: 112,
  },
  'u5e6f7g8-h9i0-1234-efgh-456789012345': {
    id: 'u5e6f7g8-h9i0-1234-efgh-456789012345',
    nombre_completo: 'Luis Hernández',
    email: 'luis.hernandez@romdeau.com',
    rol_id: 3,
    rol: 'EMPLEADO',
    rol_descripcion: 'Empleado General',
    avatar: 'LH',
    avatarColor: 'from-orange-400 to-orange-600',
    activo: true,
    created_at: '2024-03-01T15:20:00Z',
    last_login: '2026-02-24T10:00:00Z',
    phone: '+52 55 5678 9012',
    department: 'Operaciones',
    permissions: [
      'Ver sus activos asignados',
      'Reportar problemas',
      'Ver historial de activos',
    ],
    recent_activity: [
      { action: 'Reportó problema en AST-2024-078', date: '2026-02-23T11:30:00Z', type: 'report' },
      { action: 'Inició sesión', date: '2026-02-23T10:00:00Z', type: 'login' },
    ],
    assets_assigned: 5,
    audits_completed: 0,
  },
  'u6f7g8h9-i0j1-2345-fghi-567890123456': {
    id: 'u6f7g8h9-i0j1-2345-fghi-567890123456',
    nombre_completo: 'Patricia Silva',
    email: 'patricia.silva@romdeau.com',
    rol_id: 3,
    rol: 'EMPLEADO',
    rol_descripcion: 'Empleado General',
    avatar: 'PS',
    avatarColor: 'from-indigo-400 to-indigo-600',
    activo: true,
    created_at: '2024-03-05T10:45:00Z',
    last_login: '2026-02-24T13:20:00Z',
    phone: '+52 55 6789 0123',
    department: 'Recursos Humanos',
    permissions: [
      'Ver sus activos asignados',
      'Reportar problemas',
      'Ver historial de activos',
    ],
    recent_activity: [
      { action: 'Visualizó activo AST-2024-092', date: '2026-02-24T12:15:00Z', type: 'view' },
      { action: 'Inició sesión', date: '2026-02-24T09:00:00Z', type: 'login' },
    ],
    assets_assigned: 3,
    audits_completed: 0,
  },
};

const roleColors = {
  ADMIN: 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white',
  AUDITOR: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30',
  EMPLEADO: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30',
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
  const user = userData[userId as keyof typeof userData];

  if (!user) {
    return (
      <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-gray-600 dark:text-gray-400">Usuario no encontrado</p>
        </div>
      </main>
    );
  }

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
    <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
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
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}
            >
              {user.avatar}
            </div>
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
                      className={`px-4 py-2 rounded-full text-sm font-bold border ${roleColors[user.rol as keyof typeof roleColors]}`}
                    >
                      {user.rol}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{user.rol_descripcion}</p>
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
                  <p className="text-gray-900 dark:text-white font-medium">{user.department}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Teléfono</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.phone}</p>
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
                    <p className="text-gray-900 dark:text-white font-medium">{formatDate(user.last_login)}</p>
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
                {user.permissions.map((permission, index) => (
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
                {user.recent_activity.map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type as keyof typeof activityIcons];
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
                  <p className="text-4xl font-bold dark:text-white">{user.assets_assigned}</p>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Auditorías Completadas</p>
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold dark:text-white">{user.audits_completed}</p>
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