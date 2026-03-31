import { motion } from 'motion/react';
import { Mail, Building2, Shield, Plus, FileText, PhoneCall, Filter, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AgregarProveedor, ProveedorFormData } from './AgregarProveedor';
import { apiClient } from '../../../services/api';
import { toast } from 'sonner';

interface DirectorioProveedoresProps {
  onProveedorClick: (proveedorId: string) => void;
}

interface Proveedor {
  id: string;
  razon_social: string;
  rfc_tax_id?: string | null;
  contacto_soporte?: string | null;
  sitio_web?: string | null;
  is_active?: boolean | null;
  nombre_comercial?: string | null;
  telefono?: string | null;
  contacto_nombre?: string | null;
  categoria?: string | null;
  datos_financieros?: Array<{ fin_garantia: string | null }>;
  logo?: string;
  color?: string;
  garantias_activas?: number;
  telefono_emergencia?: string;
}

const colorMapProveedores: Record<string, string> = {
  'Apple': 'from-gray-400 to-gray-600',
  'Dell': 'from-blue-400 to-blue-600',
  'HP': 'from-cyan-400 to-cyan-600',
  'Lenovo': 'from-red-400 to-red-600',
  'Microsoft': 'from-emerald-400 to-emerald-600',
  'Cisco': 'from-purple-400 to-purple-600',
};

export function DirectorioProveedores({ onProveedorClick }: DirectorioProveedoresProps) {
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores desde el backend
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: Proveedor[] = await apiClient.get('/api/proveedores');
        
        // Mapear datos del backend a formato compatible con la UI
        const mappedData = data.map(p => ({
          ...p,
          logo: (p.nombre_comercial || p.razon_social)?.substring(0, 2).toUpperCase() || 'PR',
          color: colorMapProveedores[(p.nombre_comercial || p.razon_social)?.split(' ')[0] || ''] || 'from-gray-400 to-gray-600',
          garantias_activas: (p.datos_financieros || []).filter(df => df.fin_garantia && new Date(df.fin_garantia) > new Date()).length,
          telefono_emergencia: p.telefono || p.contacto_soporte || '',
        }));
        
        setProviders(mappedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar proveedores');
        console.error('Error fetching proveedores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, []);

  const filteredProviders = providers.filter(p => {
    if (searchTerm && !p.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) && !p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) && !p.rfc_tax_id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleOpenAddProvider = () => {
    setIsAddingProvider(true);
  };

  const handleCloseAddProvider = () => {
    setIsAddingProvider(false);
  };

  const handleSaveProvider = async (data: ProveedorFormData) => {
    try {
      const direccion =
        data.direccion_fiscal ||
        [data.direccion_calle, data.direccion_colonia, data.direccion_ciudad, data.direccion_estado, data.direccion_cp]
          .filter(Boolean)
          .join(', ') ||
        undefined;

      await apiClient.post('/api/proveedores', {
        razon_social: data.razon_social || data.nombre_empresa,
        rfc_tax_id: data.rfc || undefined,
        contacto_soporte: data.email || undefined,
        sitio_web: data.sitio_web || undefined,
        direccion_fiscal: direccion,
        nombre_comercial: data.nombre_empresa || undefined,
        telefono: data.telefono || undefined,
        telefono_alternativo: data.telefono_alternativo || undefined,
        contacto_nombre: data.contacto_principal || undefined,
        contacto_puesto: data.puesto_contacto || undefined,
        categoria: data.categoria || undefined,
        descripcion_servicios: data.tipo_productos_servicios || undefined,
        calificacion: data.calificacion_inicial ? String(data.calificacion_inicial) : undefined,
        notas: data.notas || undefined,
      });

      // Recargar lista de proveedores
      const updated: Proveedor[] = await apiClient.get('/api/proveedores');
      const mappedUpdated = updated.map(p => ({
        ...p,
        logo: (p.nombre_comercial || p.razon_social)?.substring(0, 2).toUpperCase() || 'PR',
        color: colorMapProveedores[(p.nombre_comercial || p.razon_social)?.split(' ')[0] || ''] || 'from-gray-400 to-gray-600',
        garantias_activas: (p.datos_financieros || []).filter((df: { fin_garantia: string | null }) => df.fin_garantia && new Date(df.fin_garantia) > new Date()).length,
        telefono_emergencia: p.telefono || p.contacto_soporte || '',
      }));
      setProviders(mappedUpdated);
      setIsAddingProvider(false);
      toast.success('Proveedor registrado correctamente');
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      toast.error('Error al guardar el proveedor. Verifica los datos e intenta de nuevo.');
    }
  };

  return (
    <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Directorio de Proveedores</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión de garantías y contactos de emergencia - <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filteredProviders.length} proveedores registrados</span>
          </p>
        </div>

        {/* Filtros y Acción Principal */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold dark:text-white">Búsqueda de Proveedores</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
              onClick={handleOpenAddProvider}
            >
              <Plus className="w-4 h-4" />
              Agregar Proveedor
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por empresa, categoría o RFC..."
                className="w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {isAddingProvider && (
          <AgregarProveedor
            onClose={handleCloseAddProvider}
            onSave={handleSaveProvider}
          />
        )}

        {/* Estado de Carga */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando proveedores...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl">
            <p className="text-red-700 dark:text-red-400 text-sm">Error: {error}</p>
          </div>
        )}

        {/* Grid de Proveedores */}
        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)] transition-all cursor-pointer"
              onClick={() => onProveedorClick(provider.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                >
                  {provider.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-lg dark:text-white leading-tight">{provider.razon_social}</h3>
                    {provider.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-500/30 flex-shrink-0">
                        <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></span>
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full border border-red-200 dark:border-red-500/30 flex-shrink-0">
                        <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full"></span>
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{provider.categoria}</p>
                </div>
              </div>

              {/* RFC/Tax ID Card */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">RFC / Tax ID</span>
                </div>
                <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{provider.rfc_tax_id}</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="truncate">{provider.contacto_soporte}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <PhoneCall className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Teléfono de Emergencia</p>
                    <p className="font-medium">{provider.telefono_emergencia}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Garantías Activas</span>
                  </div>
                  <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-700/30">
                    <span className="text-xl font-bold">{provider.garantias_activas}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Mensaje sin resultados */}
        {!loading && filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No se encontraron proveedores</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Estadísticas de Proveedores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white dark:text-black" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Proveedores</p>
              <p className="text-3xl font-bold dark:text-white">{providers.length}</p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Garantías Activas Totales</p>
              <p className="text-3xl font-bold dark:text-white">
                {providers.reduce((acc, p) => acc + (p.garantias_activas ?? 0), 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proveedores Activos</p>
              <p className="text-3xl font-bold dark:text-white">
                {providers.filter(p => p.is_active !== false).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}