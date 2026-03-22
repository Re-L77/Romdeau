import { motion } from 'motion/react';
import { Mail, UserPlus, Shield } from 'lucide-react';
import { useState } from 'react';
import { CrearUsuario, UsuarioFormData } from './CrearUsuario';

const mockUsuarios = [
  {
    id: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
    nombre_completo: 'Carlos Mendoza',
    email: 'carlos.mendoza@romdeau.com',
    rol_id: 1,
    rol: 'ADMIN',
    rol_descripcion: 'Administrador del Sistema',
    roleColor: 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white',
    avatar: 'CM',
    avatarColor: 'from-blue-400 to-blue-600',
    activo: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'u2b3c4d5-e6f7-8901-bcde-f12345678901',
    nombre_completo: 'Ana Gutiérrez',
    email: 'ana.gutierrez@romdeau.com',
    rol_id: 2,
    rol: 'AUDITOR',
    rol_descripcion: 'Auditor de Campo',
    roleColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30',
    avatar: 'AG',
    avatarColor: 'from-purple-400 to-purple-600',
    activo: true,
    created_at: '2024-02-10T11:15:00Z',
  },
  {
    id: 'u3c4d5e6-f7g8-9012-cdef-234567890123',
    nombre_completo: 'Jorge Pérez',
    email: 'jorge.perez@romdeau.com',
    rol_id: 2,
    rol: 'AUDITOR',
    rol_descripcion: 'Auditor de Campo',
    roleColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30',
    avatar: 'JP',
    avatarColor: 'from-pink-400 to-pink-600',
    activo: true,
    created_at: '2024-02-15T16:45:00Z',
  },
  {
    id: 'u4d5e6f7-g8h9-0123-defg-345678901234',
    nombre_completo: 'María Rodríguez',
    email: 'maria.rodriguez@romdeau.com',
    rol_id: 2,
    rol: 'AUDITOR',
    rol_descripcion: 'Auditor de Campo',
    roleColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30',
    avatar: 'MR',
    avatarColor: 'from-emerald-400 to-emerald-600',
    activo: true,
    created_at: '2024-02-20T09:30:00Z',
  },
  {
    id: 'u5e6f7g8-h9i0-1234-efgh-456789012345',
    nombre_completo: 'Luis Hernández',
    email: 'luis.hernandez@romdeau.com',
    rol_id: 3,
    rol: 'EMPLEADO',
    rol_descripcion: 'Empleado General',
    roleColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30',
    avatar: 'LH',
    avatarColor: 'from-orange-400 to-orange-600',
    activo: true,
    created_at: '2024-03-01T15:20:00Z',
  },
  {
    id: 'u6f7g8h9-i0j1-2345-fghi-567890123456',
    nombre_completo: 'Patricia Silva',
    email: 'patricia.silva@romdeau.com',
    rol_id: 3,
    rol: 'EMPLEADO',
    rol_descripcion: 'Empleado General',
    roleColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30',
    avatar: 'PS',
    avatarColor: 'from-indigo-400 to-indigo-600',
    activo: true,
    created_at: '2024-03-05T10:45:00Z',
  },
];

interface GestionUsuariosProps {
  onUserClick: (userId: string) => void;
}

export function GestionUsuarios({ onUserClick }: GestionUsuariosProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const roleStats = {
    admin: mockUsuarios.filter(u => u.rol_id === 1).length,
    auditor: mockUsuarios.filter(u => u.rol_id === 2).length,
    empleado: mockUsuarios.filter(u => u.rol_id === 3).length,
  };

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleOpenCreateUser = () => {
    setIsCreatingUser(true);
  };

  const handleCloseCreateUser = () => {
    setIsCreatingUser(false);
  };

  const handleSaveUser = (userData: UsuarioFormData) => {
    console.log('Nuevo usuario creado:', userData);
    
    // Generar siglas para el avatar
    const palabras = userData.nombre_completo.split(' ');
    const avatar = palabras.length >= 2 
      ? palabras[0][0] + palabras[1][0] 
      : userData.nombre_completo.substring(0, 2);
    
    // Mapear rol a descripción y color
    const roleMap = {
      'ADMIN': {
        descripcion: 'Administrador del Sistema',
        color: 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white',
        avatarColor: 'from-purple-400 to-purple-600'
      },
      'AUDITOR': {
        descripcion: 'Auditor de Campo',
        color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30',
        avatarColor: 'from-blue-400 to-blue-600'
      },
      'GESTOR_ACTIVOS': {
        descripcion: 'Gestor de Activos',
        color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/30',
        avatarColor: 'from-emerald-400 to-emerald-600'
      },
      'CONSULTOR': {
        descripcion: 'Consultor',
        color: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700/30',
        avatarColor: 'from-gray-400 to-gray-600'
      }
    };
    
    const rolInfo = roleMap[userData.rol];
    
    const password = userData.password_temporal || '(generada automáticamente)';
    
    alert(`✅ Usuario creado exitosamente\n\n👤 Nombre: ${userData.nombre_completo}\n📧 Email: ${userData.email}\n📞 Teléfono: ${userData.telefono}\n🏢 Departamento: ${userData.departamento}\n💼 Puesto: ${userData.puesto}\n🛡️ Rol: ${rolInfo.descripcion}\n📍 Campus: ${userData.campus || 'No asignado'}\n🏗️ Edificio: ${userData.edificio || 'No asignado'}\n🔑 Contraseña temporal: ${password}\n📧 Email de bienvenida: ${userData.enviar_email_bienvenida ? 'Sí' : 'No'}\n✅ Permisos: ${userData.permisos.length} permisos asignados\n\nEl usuario ha sido agregado al sistema.`);
    
    setIsCreatingUser(false);
  };

  return (
    <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Gestión de Usuarios</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Control de acceso basado en roles (RBAC) - <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mockUsuarios.filter(u => u.activo).length} usuarios activos</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
            onClick={handleOpenCreateUser}
          >
            <UserPlus className="w-4 h-4" />
            Invitar Nuevo Usuario
          </motion.button>
        </div>

        <div className="space-y-3">
          {mockUsuarios.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => onUserClick(user.id)}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-all cursor-pointer hover:scale-[1.01]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-lg font-semibold shadow-lg flex-shrink-0`}
                >
                  {user.avatar}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1 dark:text-white">{user.nombre_completo}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {user.activo ? (
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-700/30">
                          Activo
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-700/30">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Rol del Sistema (RBAC)</p>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1" />
                      <div>
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${user.roleColor}`}
                        >
                          {user.rol}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{user.rol_descripcion}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Fecha de Registro</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{formatDate(user.created_at)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">UUID: {user.id.substring(0, 8)}...</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => onUserClick(user.id)}
                >
                  Editar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Estadísticas por Rol</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white dark:text-black" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ADMIN</p>
              <p className="text-3xl font-bold dark:text-white mb-2">{roleStats.admin}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Administrador del Sistema</p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AUDITOR</p>
              <p className="text-3xl font-bold dark:text-white mb-2">{roleStats.auditor}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Auditor de Campo</p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">EMPLEADO</p>
              <p className="text-3xl font-bold dark:text-white mb-2">{roleStats.empleado}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Empleado General</p>
            </div>
          </div>
        </div>
      </div>

      {isCreatingUser && (
        <CrearUsuario
          onClose={handleCloseCreateUser}
          onSave={handleSaveUser}
        />
      )}
    </main>
  );
}