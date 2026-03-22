import { motion } from 'motion/react';
import { MapPin, User, Edit3, Printer, Calendar, Package, ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { mockDB } from '../../data/mockData';
import { EstadoActivo, EstadoAuditoria } from '../../data/types';

const assetSpecs = [
  { key: 'Processor', value: 'Apple M3 Max', editable: false },
  { key: 'RAM', value: '32GB Unified Memory', editable: true },
  { key: 'Storage', value: '1TB SSD', editable: true },
  { key: 'Serial Number', value: 'C02ZK3YJMD6R', editable: false },
  { key: 'Purchase Date', value: '2024-01-15', editable: true },
  { key: 'Purchase Price', value: '$3,499.00', editable: true },
  { key: 'Warranty Expiration', value: '2027-01-15', editable: true },
  { key: 'Supplier', value: 'Apple Inc.', editable: true },
  { key: 'Category', value: 'Computing', editable: true },
  { key: 'Condition', value: 'Excellent', editable: true },
];

const historyEvents = [
  {
    id: 1,
    type: 'audit',
    title: 'Auditoría Física Completada',
    description: 'GPS Validado: Oficina Central - Piso 3',
    date: '2026-02-23',
    time: '14:30',
    user: 'Carlos Mendoza',
    status: 'success',
  },
  {
    id: 2,
    type: 'location',
    title: 'Cambio de Ubicación',
    description: 'De: Piso 2 → A: Piso 3',
    date: '2026-02-10',
    time: '09:15',
    user: 'IT Admin',
    status: 'info',
  },
  {
    id: 3,
    type: 'audit',
    title: 'Mantenimiento Preventivo',
    description: 'Limpieza y actualización de sistema',
    date: '2026-01-20',
    time: '11:00',
    user: 'Soporte Técnico',
    status: 'success',
  },
  {
    id: 4,
    type: 'assignment',
    title: 'Asignado a Custodio',
    description: 'Carlos Mendoza',
    date: '2024-01-15',
    time: '16:00',
    user: 'Recursos Humanos',
    status: 'info',
  },
  {
    id: 5,
    type: 'purchase',
    title: 'Activo Adquirido',
    description: 'Compra inicial del equipo',
    date: '2024-01-15',
    time: '10:00',
    user: 'Departamento de Compras',
    status: 'success',
  },
];

const statusConfig = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
};

interface AssetDetailProps {
  assetId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function AssetDetail({ assetId, onBack, onEdit }: AssetDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'delete' | 'transfer' | 'changeCustodian' | 'printLabel' | null;
  }>({ isOpen: false, action: null });

  const handleConfirmAction = () => {
    if (confirmModal.action === 'delete') {
      alert('Activo eliminado exitosamente');
      onBack();
    } else if (confirmModal.action === 'transfer') {
      console.log('Transferir activo:', assetId);
    } else if (confirmModal.action === 'changeCustodian') {
      console.log('Cambiar custodio:', assetId);
    } else if (confirmModal.action === 'printLabel') {
      console.log('Imprimir etiqueta:', assetId);
    }
  };

  const getModalContent = () => {
    switch (confirmModal.action) {
      case 'delete':
        return {
          title: 'Eliminar Activo',
          message: `⚠️ ¿Está seguro de eliminar permanentemente el activo "MacBook Pro 16\" M3"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar',
          icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
        };
      case 'transfer':
        return {
          title: 'Transferir Activo',
          message: `¿Desea transferir el activo "MacBook Pro 16\" M3" a otra ubicación?`,
          confirmText: 'Transferir',
          icon: <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        };
      case 'changeCustodian':
        return {
          title: 'Cambiar Custodio',
          message: `¿Desea cambiar el custodio responsable del activo "MacBook Pro 16\" M3"?`,
          confirmText: 'Cambiar Custodio',
          icon: <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        };
      case 'printLabel':
        return {
          title: 'Imprimir Etiqueta QR',
          message: `¿Desea generar e imprimir la etiqueta QR del activo "MacBook Pro 16\" M3"?`,
          confirmText: 'Imprimir',
          icon: <Printer className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
        };
      default:
        return {
          title: '',
          message: '',
          confirmText: 'Confirmar',
          icon: undefined,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 lg:pl-80 pt-24 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-full shadow-sm hover:shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </motion.button>
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Detalle del Activo</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión completa y trazabilidad del activo</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Asset Identity */}
          <div className="space-y-6">
            {/* Main Asset Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Asset ID</p>
                  <h2 className="text-4xl font-bold mb-4 dark:text-white">{assetId}</h2>
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    MacBook Pro 16" M3
                  </h3>
                </div>
                <div className="px-6 py-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold border-2 border-emerald-200 dark:border-emerald-700/30">
                  Verificado
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEdit}
                  className="px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Activo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmModal({ isOpen: true, action: 'transfer' })}
                  className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Transferir
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmModal({ isOpen: true, action: 'delete' })}
                className="w-full mt-3 px-6 py-4 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full font-medium hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 border-2 border-red-200 dark:border-red-700/30"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Activo
              </motion.button>
            </motion.div>

            {/* QR Code Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">Código QR del Activo</h3>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 flex items-center justify-center mb-6">
                <div className="w-48 h-48 bg-white dark:bg-white p-4 rounded-2xl shadow-sm">
                  {/* QR Code SVG */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* QR Code pattern - simplified representation */}
                    <rect width="200" height="200" fill="white"/>
                    <g fill="black">
                      {/* Corner markers */}
                      <rect x="10" y="10" width="50" height="50"/>
                      <rect x="20" y="20" width="30" height="30" fill="white"/>
                      <rect x="25" y="25" width="20" height="20"/>
                      
                      <rect x="140" y="10" width="50" height="50"/>
                      <rect x="150" y="20" width="30" height="30" fill="white"/>
                      <rect x="155" y="25" width="20" height="20"/>
                      
                      <rect x="10" y="140" width="50" height="50"/>
                      <rect x="20" y="150" width="30" height="30" fill="white"/>
                      <rect x="25" y="155" width="20" height="20"/>
                      
                      {/* Data pattern */}
                      <rect x="70" y="10" width="10" height="10"/>
                      <rect x="90" y="10" width="10" height="10"/>
                      <rect x="110" y="10" width="10" height="10"/>
                      <rect x="80" y="30" width="10" height="10"/>
                      <rect x="100" y="30" width="10" height="10"/>
                      <rect x="70" y="50" width="10" height="10"/>
                      <rect x="110" y="50" width="10" height="10"/>
                    </g>
                  </svg>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmModal({ isOpen: true, action: 'printLabel' })}
                className="w-full px-6 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-full font-medium hover:bg-black dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Etiqueta
              </motion.button>
            </motion.div>

            {/* Custodian Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">Custodio Actual</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
                  CM
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg dark:text-white">Carlos Mendoza</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Desarrollador Senior</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Ubicación Actual</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Oficina Central - Piso 3</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Desk 3B-14</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Asignado desde</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">15 de Enero, 2024</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmModal({ isOpen: true, action: 'changeCustodian' })}
                className="w-full mt-6 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Cambiar Custodio
              </motion.button>
            </motion.div>
          </div>

          {/* Right Column - Specs & Timeline */}
          <div className="space-y-6">
            {/* Technical Specs Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold dark:text-white">Especificaciones Técnicas</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    isEditing
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'Guardar' : 'Editar Specs'}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetSpecs.map((spec, index) => (
                  <motion.div
                    key={spec.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isEditing && spec.editable
                        ? 'bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white cursor-text'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1.5 uppercase tracking-wide">
                      {spec.key}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{spec.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Timeline Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">Trazabilidad</h3>

              <div className="relative">
                {/* Curved connecting line */}
                <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-200 via-blue-200 to-gray-200 dark:from-emerald-800 dark:via-blue-800 dark:to-gray-800" />

                <div className="space-y-6">
                  {historyEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                      className="relative pl-10"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full ${
                          statusConfig[event.status as keyof typeof statusConfig]
                        } shadow-lg ring-4 ring-white dark:ring-[#1a1a1a]`}
                      />

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                            <span>{event.date}</span>
                            <span>·</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Por: {event.user}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={handleConfirmAction}
        title={getModalContent().title}
        message={getModalContent().message}
        confirmText={getModalContent().confirmText}
        icon={getModalContent().icon}
      />
    </div>
  );
}