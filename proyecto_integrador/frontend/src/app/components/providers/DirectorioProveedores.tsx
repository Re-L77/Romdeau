import { motion } from 'motion/react';
import { Mail, Phone, Building2, Shield, Plus, FileText, PhoneCall, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { AgregarProveedor, ProveedorFormData } from './AgregarProveedor';

const providers = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    razon_social: 'Apple Inc.',
    rfc_tax_id: 'APL920813-7X8',
    logo: 'AP',
    contacto_soporte: 'enterprise@apple.com',
    telefono_emergencia: '+1 (800) 692-7753',
    garantias_activas: 12,
    categoria: 'Equipos de Cómputo',
    color: 'from-gray-400 to-gray-600',
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
    razon_social: 'Dell Technologies',
    rfc_tax_id: 'DEL840625-3Y9',
    logo: 'DL',
    contacto_soporte: 'sales@dell.com',
    telefono_emergencia: '+1 (800) 289-3355',
    garantias_activas: 8,
    categoria: 'Servidores y Networking',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-234567890123',
    razon_social: 'HP Inc.',
    rfc_tax_id: 'HPI391201-5Z1',
    logo: 'HP',
    contacto_soporte: 'enterprise@hp.com',
    telefono_emergencia: '+1 (800) 752-0900',
    garantias_activas: 15,
    categoria: 'Impresoras y Periféricos',
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-345678901234',
    razon_social: 'Lenovo Group Limited',
    rfc_tax_id: 'LEN841118-2W4',
    logo: 'LN',
    contacto_soporte: 'business@lenovo.com',
    telefono_emergencia: '+1 (855) 253-6686',
    garantias_activas: 6,
    categoria: 'Equipos de Cómputo',
    color: 'from-red-400 to-red-600',
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-456789012345',
    razon_social: 'Microsoft Corporation',
    rfc_tax_id: 'MIC750418-9Q6',
    logo: 'MS',
    contacto_soporte: 'enterprise@microsoft.com',
    telefono_emergencia: '+1 (800) 642-7676',
    garantias_activas: 4,
    categoria: 'Software y Dispositivos',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'f6g7h8i9-j0k1-2345-fghi-567890123456',
    razon_social: 'Cisco Systems Inc.',
    rfc_tax_id: 'CIS841209-7V3',
    logo: 'CS',
    contacto_soporte: 'sales@cisco.com',
    telefono_emergencia: '+1 (800) 553-6387',
    garantias_activas: 9,
    categoria: 'Networking',
    color: 'from-purple-400 to-purple-600',
  },
];

interface DirectorioProveedoresProps {
  onProveedorClick: (proveedorId: string) => void;
}

export function DirectorioProveedores({ onProveedorClick }: DirectorioProveedoresProps) {
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProviders = providers.filter(p => {
    if (searchTerm && !p.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) && !p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) && !p.rfc_tax_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleOpenAddProvider = () => {
    setIsAddingProvider(true);
  };

  const handleCloseAddProvider = () => {
    setIsAddingProvider(false);
  };

  const handleSaveProvider = (data: ProveedorFormData) => {
    console.log('Nuevo proveedor registrado:', data);
    
    // Generar siglas para el logo
    const palabras = data.nombre_empresa.split(' ');
    const logo = palabras.length >= 2 
      ? palabras[0][0] + palabras[1][0] 
      : data.nombre_empresa.substring(0, 2);
    
    // Determinar color basado en la categoría
    const colorMap: Record<string, string> = {
      'TECNOLOGIA': 'from-blue-400 to-blue-600',
      'MOBILIARIO': 'from-amber-400 to-amber-600',
      'MANTENIMIENTO': 'from-orange-400 to-orange-600',
      'SOFTWARE': 'from-purple-400 to-purple-600',
      'CONSTRUCCION': 'from-gray-400 to-gray-600',
      'PAPELERIA': 'from-emerald-400 to-emerald-600',
      'LIMPIEZA': 'from-cyan-400 to-cyan-600',
      'SEGURIDAD': 'from-red-400 to-red-600',
      'OTROS': 'from-indigo-400 to-indigo-600',
    };
    
    const categoriaLabel: Record<string, string> = {
      'TECNOLOGIA': 'Tecnología y Electrónica',
      'MOBILIARIO': 'Mobiliario y Equipo de Oficina',
      'MANTENIMIENTO': 'Servicios de Mantenimiento',
      'SOFTWARE': 'Software y Licencias',
      'CONSTRUCCION': 'Construcción y Obra',
      'PAPELERIA': 'Papelería y Suministros',
      'LIMPIEZA': 'Servicios de Limpieza',
      'SEGURIDAD': 'Seguridad y Vigilancia',
      'OTROS': 'Otros Servicios',
    };
    
    alert(`✅ Proveedor registrado exitosamente\n\n🏢 Empresa: ${data.nombre_empresa}\n📋 RFC: ${data.rfc}\n📧 Email: ${data.email}\n📞 Teléfono: ${data.telefono}\n👤 Contacto: ${data.contacto_principal} (${data.puesto_contacto})\n📍 Ubicación: ${data.direccion_ciudad}, ${data.direccion_estado}\n⭐ Calificación inicial: ${data.calificacion_inicial}/10\n\nEl proveedor ha sido agregado al directorio.`);
    
    setIsAddingProvider(false);
  };

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
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
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 dark:text-white">{provider.razon_social}</h3>
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
                {providers.reduce((acc, p) => acc + p.garantias_activas, 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio por Proveedor</p>
              <p className="text-3xl font-bold dark:text-white">
                {Math.round(providers.reduce((acc, p) => acc + p.garantias_activas, 0) / providers.length)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}