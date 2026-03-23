import { motion } from 'motion/react';
import { Mail, UserPlus, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CrearUsuario, UsuarioFormData } from './CrearUsuario';
import { apiClient } from '../../../services/api';
import { toast } from 'sonner';

// No mocks, users fetched from DB.

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

  const getRoleDetails = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return { descripcion: 'Administrador del Sistema', color: 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' };
      case 'AUDITOR': return { descripcion: 'Auditor de Campo', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30' };
      case 'EMPLEADO':
      default: return { descripcion: 'Empleado General', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30' };
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

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const data = await apiClient.get('/api/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const roleStats = {
    admin: usuarios.filter(u => u.rol === 'ADMIN').length,
    auditor: usuarios.filter(u => u.rol === 'AUDITOR').length,
    empleado: usuarios.filter(u => u.rol === 'EMPLEADO').length,
  };

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleOpenCreateUser = () => {
    setIsCreatingUser(true);
  };

  const handleCloseCreateUser = () => {
    setIsCreatingUser(false);
  };

  const handleSaveUser = async (userData: UsuarioFormData) => {
    let loadingToast: string | number = '';
    try {
      loadingToast = toast.loading('Creando usuario en Supabase...');
      
      const rolMap: Record<string, number> = {
        'ADMIN': 1,
        'AUDITOR': 2,
        'EMPLEADO': 3,
      };

      const payload = {
        nombres: userData.nombres,
        apellido_paterno: userData.apellido_paterno,
        apellido_materno: userData.apellido_materno || null,
        email: userData.email,
        password: userData.password_temporal || undefined,
        rol_id: rolMap[userData.rol] || 3,
        activo: userData.activo
      };

      const newUser: any = await apiClient.post('/api/usuarios', payload);
      
      if (userData.foto_perfil && newUser?.id) {
        toast.loading('Subiendo fotografía de perfil...', { id: loadingToast });
        const formDataUpload = new FormData();
        formDataUpload.append('file', userData.foto_perfil);
        
        const token = localStorage.getItem("accessToken");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        const fotoRes = await fetch(`${apiUrl}/api/usuarios/${newUser.id}/foto-perfil/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });

        if (!fotoRes.ok) {
          console.warn('Error al subir fotografía, pero el usuario fue creado');
        }
      }
      
      toast.success(`Usuario ${userData.email} creado exitosamente`, { id: loadingToast });
      setIsCreatingUser(false);
      
      // Volver a cargar la lista de usuarios invocando a la API
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el usuario. Verifica los datos.', { id: loadingToast });
      console.error(error);
    }
  };

  return (
    <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Gestión de Usuarios</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Control de acceso basado en roles (RBAC) - <span className="font-semibold text-emerald-600 dark:text-emerald-400">{usuarios.filter(u => u.activo).length} usuarios activos</span>
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : usuarios.map((user, index) => {
            const roleInfo = getRoleDetails(user.rol);
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => onUserClick(user.id)}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-all cursor-pointer hover:scale-[1.01]"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {user.foto_perfil_url ? (
                    <img 
                      src={user.foto_perfil_url} 
                      alt={user.nombre_completo} 
                      className="w-16 h-16 rounded-full object-cover shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-white text-lg font-semibold shadow-lg flex-shrink-0`}
                    >
                      {getAvatarInitials(user)}
                    </div>
                  )}

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
                            className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${roleInfo.color}`}
                          >
                            {user.rol}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{roleInfo.descripcion}</p>
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
            );
          })}
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