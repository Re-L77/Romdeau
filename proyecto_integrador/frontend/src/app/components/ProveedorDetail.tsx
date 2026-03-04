import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, Building2, Shield, FileText, PhoneCall, MapPin, Calendar, Package, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ProveedorDetailProps {
  proveedorId: string;
  onBack: () => void;
}

const proveedorData = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    razon_social: 'Apple Inc.',
    rfc_tax_id: 'APL920813-7X8',
    logo: 'AP',
    contacto_soporte: 'enterprise@apple.com',
    telefono_emergencia: '+1 (800) 692-7753',
    telefono_ventas: '+1 (800) 275-2273',
    garantias_activas: 12,
    garantias_vencidas: 3,
    garantias_por_vencer: 2,
    categoria: 'Equipos de Cómputo',
    color: 'from-gray-400 to-gray-600',
    direccion: 'One Apple Park Way, Cupertino, CA 95014, USA',
    sitio_web: 'www.apple.com/business',
    horario_soporte: '24/7',
    created_at: '2023-01-15T10:00:00Z',
    productos: ['MacBook Pro', 'iMac', 'Mac Mini', 'iPad Pro'],
    activos_asociados: 12,
    contacto_comercial: 'Juan Rodríguez',
    email_comercial: 'juan.rodriguez@apple.com',
    telefono_comercial: '+52 55 1234 5678',
    notas: 'Proveedor premium con soporte prioritario. Contrato de servicio extendido hasta 2027.',
    sla_respuesta: '4 horas',
    ultimo_servicio: '2026-02-15T10:00:00Z',
    contratos_activos: 2,
  },
  'b2c3d4e5-f6g7-8901-bcde-f12345678901': {
    id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
    razon_social: 'Dell Technologies',
    rfc_tax_id: 'DEL840625-3Y9',
    logo: 'DL',
    contacto_soporte: 'sales@dell.com',
    telefono_emergencia: '+1 (800) 289-3355',
    telefono_ventas: '+1 (877) 395-1355',
    garantias_activas: 8,
    garantias_vencidas: 2,
    garantias_por_vencer: 1,
    categoria: 'Servidores y Networking',
    color: 'from-blue-400 to-blue-600',
    direccion: 'One Dell Way, Round Rock, TX 78682, USA',
    sitio_web: 'www.dell.com/business',
    horario_soporte: 'Lunes a Viernes 8:00-18:00 CST',
    created_at: '2023-03-20T14:30:00Z',
    productos: ['PowerEdge Servers', 'Latitude Laptops', 'OptiPlex Desktops', 'Precision Workstations'],
    activos_asociados: 8,
    contacto_comercial: 'María González',
    email_comercial: 'maria.gonzalez@dell.com',
    telefono_comercial: '+52 55 2345 6789',
    notas: 'Proveedor de servidores y equipos empresariales. Renovación de contrato en junio 2026.',
    sla_respuesta: '8 horas',
    ultimo_servicio: '2026-02-10T14:00:00Z',
    contratos_activos: 1,
  },
  'c3d4e5f6-g7h8-9012-cdef-234567890123': {
    id: 'c3d4e5f6-g7h8-9012-cdef-234567890123',
    razon_social: 'HP Inc.',
    rfc_tax_id: 'HPI391201-5Z1',
    logo: 'HP',
    contacto_soporte: 'enterprise@hp.com',
    telefono_emergencia: '+1 (800) 752-0900',
    telefono_ventas: '+1 (888) 999-4747',
    garantias_activas: 15,
    garantias_vencidas: 1,
    garantias_por_vencer: 3,
    categoria: 'Impresoras y Periféricos',
    color: 'from-cyan-400 to-cyan-600',
    direccion: '1501 Page Mill Road, Palo Alto, CA 94304, USA',
    sitio_web: 'www.hp.com/enterprise',
    horario_soporte: '24/7',
    created_at: '2023-02-10T09:15:00Z',
    productos: ['LaserJet Enterprise', 'PageWide Pro', 'OfficeJet Pro', 'Scanners'],
    activos_asociados: 15,
    contacto_comercial: 'Pedro Martínez',
    email_comercial: 'pedro.martinez@hp.com',
    telefono_comercial: '+52 55 3456 7890',
    notas: 'Proveedor principal de impresoras. Contrato de mantenimiento preventivo mensual.',
    sla_respuesta: '6 horas',
    ultimo_servicio: '2026-02-20T11:00:00Z',
    contratos_activos: 3,
  },
  'd4e5f6g7-h8i9-0123-defg-345678901234': {
    id: 'd4e5f6g7-h8i9-0123-defg-345678901234',
    razon_social: 'Lenovo Group Limited',
    rfc_tax_id: 'LEN841118-2W4',
    logo: 'LN',
    contacto_soporte: 'business@lenovo.com',
    telefono_emergencia: '+1 (855) 253-6686',
    telefono_ventas: '+1 (866) 968-4465',
    garantias_activas: 6,
    garantias_vencidas: 4,
    garantias_por_vencer: 1,
    categoria: 'Equipos de Cómputo',
    color: 'from-red-400 to-red-600',
    direccion: 'No. 6 Chuang Ye Road, Beijing 100085, China',
    sitio_web: 'www.lenovo.com/business',
    horario_soporte: 'Lunes a Sábado 7:00-20:00 CST',
    created_at: '2023-05-12T16:20:00Z',
    productos: ['ThinkPad', 'ThinkCentre', 'ThinkStation', 'Tablets'],
    activos_asociados: 6,
    contacto_comercial: 'Ana López',
    email_comercial: 'ana.lopez@lenovo.com',
    telefono_comercial: '+52 55 4567 8901',
    notas: 'Proveedor secundario de laptops empresariales. Evaluar renovación de garantías.',
    sla_respuesta: '12 horas',
    ultimo_servicio: '2026-01-28T09:30:00Z',
    contratos_activos: 1,
  },
  'e5f6g7h8-i9j0-1234-efgh-456789012345': {
    id: 'e5f6g7h8-i9j0-1234-efgh-456789012345',
    razon_social: 'Microsoft Corporation',
    rfc_tax_id: 'MIC750418-9Q6',
    logo: 'MS',
    contacto_soporte: 'enterprise@microsoft.com',
    telefono_emergencia: '+1 (800) 642-7676',
    telefono_ventas: '+1 (877) 696-7786',
    garantias_activas: 4,
    garantias_vencidas: 0,
    garantias_por_vencer: 0,
    categoria: 'Software y Dispositivos',
    color: 'from-emerald-400 to-emerald-600',
    direccion: 'One Microsoft Way, Redmond, WA 98052, USA',
    sitio_web: 'www.microsoft.com/business',
    horario_soporte: '24/7',
    created_at: '2023-01-05T08:00:00Z',
    productos: ['Surface Pro', 'Surface Laptop', 'Surface Studio', 'Licencias Microsoft 365'],
    activos_asociados: 4,
    contacto_comercial: 'Carlos Sánchez',
    email_comercial: 'carlos.sanchez@microsoft.com',
    telefono_comercial: '+52 55 5678 9012',
    notas: 'Proveedor de dispositivos Surface y licencias de software. Relación comercial excelente.',
    sla_respuesta: '2 horas',
    ultimo_servicio: '2026-02-18T15:00:00Z',
    contratos_activos: 2,
  },
  'f6g7h8i9-j0k1-2345-fghi-567890123456': {
    id: 'f6g7h8i9-j0k1-2345-fghi-567890123456',
    razon_social: 'Cisco Systems Inc.',
    rfc_tax_id: 'CIS841209-7V3',
    logo: 'CS',
    contacto_soporte: 'sales@cisco.com',
    telefono_emergencia: '+1 (800) 553-6387',
    telefono_ventas: '+1 (866) 606-1866',
    garantias_activas: 9,
    garantias_vencidas: 2,
    garantias_por_vencer: 2,
    categoria: 'Networking',
    color: 'from-purple-400 to-purple-600',
    direccion: '170 West Tasman Drive, San Jose, CA 95134, USA',
    sitio_web: 'www.cisco.com/business',
    horario_soporte: '24/7',
    created_at: '2023-04-08T13:45:00Z',
    productos: ['Catalyst Switches', 'ASA Firewalls', 'Routers', 'Access Points'],
    activos_asociados: 9,
    contacto_comercial: 'Roberto Díaz',
    email_comercial: 'roberto.diaz@cisco.com',
    telefono_comercial: '+52 55 6789 0123',
    notas: 'Proveedor de infraestructura de red. Soporte crítico para operaciones 24/7.',
    sla_respuesta: '1 hora',
    ultimo_servicio: '2026-02-22T08:00:00Z',
    contratos_activos: 2,
  },
};

export function ProveedorDetail({ proveedorId, onBack }: ProveedorDetailProps) {
  const proveedor = proveedorData[proveedorId as keyof typeof proveedorData];

  if (!proveedor) {
    return (
      <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-gray-600 dark:text-gray-400">Proveedor no encontrado</p>
        </div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const totalGarantias = proveedor.garantias_activas + proveedor.garantias_vencidas + proveedor.garantias_por_vencer;

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
            <span className="font-medium">Volver a Proveedores</span>
          </motion.button>

          <div className="flex items-center gap-6 mb-6">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${proveedor.color} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}
            >
              {proveedor.logo}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 dark:text-white">{proveedor.razon_social}</h1>
              <p className="text-gray-600 dark:text-gray-400">{proveedor.categoria}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 font-mono">RFC: {proveedor.rfc_tax_id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Información de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Soporte Técnico</p>
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{proveedor.contacto_soporte}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Emergencias</p>
                  <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-700/30">
                    <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-900 dark:text-red-300 font-bold">{proveedor.telefono_emergencia}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Ventas</p>
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{proveedor.telefono_ventas}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Horario de Soporte</p>
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-700/30">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-emerald-900 dark:text-emerald-300 font-bold">{proveedor.horario_soporte}</p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Dirección</p>
                  <div className="flex items-start gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-900 dark:text-white">{proveedor.direccion}</p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Sitio Web</p>
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a href={`https://${proveedor.sitio_web}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                      {proveedor.sitio_web}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Commercial Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Contacto Comercial</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Nombre</p>
                  <p className="text-gray-900 dark:text-white font-bold">{proveedor.contacto_comercial}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">{proveedor.email_comercial}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Teléfono</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{proveedor.telefono_comercial}</p>
                </div>
              </div>
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Productos y Servicios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proveedor.productos.map((producto, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <Package className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{producto}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-4 dark:text-white">Notas y Observaciones</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{proveedor.notas}</p>
            </motion.div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Warranties Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Estado de Garantías</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Activas</p>
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{proveedor.garantias_activas}</p>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Por Vencer</p>
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{proveedor.garantias_por_vencer}</p>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">Vencidas</p>
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">{proveedor.garantias_vencidas}</p>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Total de Garantías</p>
                  <p className="text-2xl font-bold dark:text-white">{totalGarantias}</p>
                </div>
              </div>
            </motion.div>

            {/* Service Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Métricas de Servicio</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">SLA de Respuesta</p>
                  <p className="text-2xl font-bold dark:text-white">{proveedor.sla_respuesta}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Contratos Activos</p>
                  <p className="text-2xl font-bold dark:text-white">{proveedor.contratos_activos}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Activos Asociados</p>
                  <p className="text-2xl font-bold dark:text-white">{proveedor.activos_asociados}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Último Servicio</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{formatDate(proveedor.ultimo_servicio)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Acciones</h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                >
                  Editar Proveedor
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-medium hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                >
                  Ver Garantías
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver Activos
                </motion.button>
              </div>
            </motion.div>

            {/* Registration Date */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Fecha de Registro</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{formatDate(proveedor.created_at)}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">UUID del Proveedor</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  {proveedor.id}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
