import { motion } from 'motion/react';
import { MapPin, User, Calendar, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Navigation, Camera, FileText, Clock, Building2 } from 'lucide-react';

interface AuditDetailProps {
  auditId: string;
  auditType: 'scheduled' | 'completed';
  onBack: () => void;
}

// Mock data - en producción vendría de la BD
const scheduledAuditData = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  campus: 'Campus Central',
  edificio: 'Edificio Administrativo A',
  piso: 'Piso 4',
  salon: 'Oficinas Generales',
  auditor_id: 'u2b3c4d5-e6f7-8901-bcde-f12345678901',
  auditor: 'Ana Gutiérrez',
  auditor_email: 'ana.gutierrez@romdeau.com',
  fecha: '2026-02-25',
  hora: '10:00',
  status: 'pending',
  activos_programados: [
    { id: '1', codigo: 'AST-2024-001', nombre: 'MacBook Pro 16"', categoria: 'Equipos de Cómputo' },
    { id: '2', codigo: 'AST-2024-045', nombre: 'iPhone 15 Pro', categoria: 'Dispositivos Móviles' },
    { id: '3', codigo: 'AST-2023-156', nombre: 'Monitor LG 34"', categoria: 'Monitores' },
  ],
  notas: 'Revisar especialmente el estado de los dispositivos móviles. Verificar garantías.',
};

const completedAuditData = {
  id: 'c3d4e5f6-g7h8-9012-cdef-234567890123',
  activo_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  activo_codigo: 'AST-2024-001',
  activo_nombre: 'MacBook Pro 16" M3',
  campus: 'Campus Central',
  edificio: 'Edificio Administrativo A',
  piso: 'Piso 3',
  salon: 'Oficina 3B-14',
  auditor_id: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
  auditor: 'Carlos Mendoza',
  auditor_email: 'carlos.mendoza@romdeau.com',
  fecha_hora: '2026-02-23 14:30',
  coordenadas_gps: 'POINT(-99.1332 19.4326)',
  lat: 19.4326,
  lng: -99.1332,
  coincidencia_ubicacion: true,
  estado_reportado: 'BUENO',
  estado_reportado_id: 1,
  comentarios: 'Activo encontrado en excelente estado. Todas las especificaciones verificadas y coinciden con el registro. Sin daños físicos aparentes.',
  evidencia_foto_url: null,
  duracion_minutos: 8,
};

const estadoColors = {
  BUENO: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700/30', icon: CheckCircle2 },
  DANADO: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700/30', icon: AlertTriangle },
  NO_ENCONTRADO: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-700/30', icon: XCircle },
};

export function AuditDetail({ auditId, auditType, onBack }: AuditDetailProps) {
  const isScheduled = auditType === 'scheduled';
  const data = isScheduled ? scheduledAuditData : completedAuditData;

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 pr-6 lg:pr-12 transition-colors duration-300">
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
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            {isScheduled ? 'Auditoría Programada' : 'Registro de Auditoría Completada'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isScheduled ? 'Detalles de la auditoría pendiente' : 'Detalles del registro de auditoría'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">ID de Auditoría</p>
                  <h2 className="text-2xl font-bold mb-4 dark:text-white">{data.id.substring(0, 13)}...</h2>
                </div>
                {isScheduled ? (
                  <div className="px-6 py-3 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full font-semibold border-2 border-blue-200 dark:border-blue-700/30">
                    Pendiente
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold border-2 ${estadoColors[completedAuditData.estado_reportado as keyof typeof estadoColors].bg} ${estadoColors[completedAuditData.estado_reportado as keyof typeof estadoColors].text} ${estadoColors[completedAuditData.estado_reportado as keyof typeof estadoColors].border}`}>
                    {(() => {
                      const IconComponent = estadoColors[completedAuditData.estado_reportado as keyof typeof estadoColors].icon;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                    <span>{completedAuditData.estado_reportado}</span>
                  </div>
                )}
              </div>

              {/* Location Hierarchy */}
              <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Ubicación Jerárquica</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">Campus:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{data.campus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">Edificio:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{data.edificio}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">Piso:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{data.piso}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 w-24">Salón/Área:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{data.salon}</span>
                  </div>
                </div>
              </div>

              {/* Auditor Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                  {data.auditor.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <p className="font-semibold text-gray-900 dark:text-white">{data.auditor}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{data.auditor_email}</p>
                </div>
              </div>
            </motion.div>

            {/* Scheduled: Assets List */}
            {isScheduled && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <h3 className="text-lg font-bold mb-6 dark:text-white">
                  Activos Programados ({scheduledAuditData.activos_programados.length})
                </h3>
                <div className="space-y-3">
                  {scheduledAuditData.activos_programados.map((activo, index) => (
                    <motion.div
                      key={activo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{activo.codigo}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activo.nombre}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activo.categoria}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Completed: Asset Info */}
            {!isScheduled && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <h3 className="text-lg font-bold mb-6 dark:text-white">Activo Auditado</h3>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Código de Activo</p>
                  <p className="text-2xl font-bold mb-3 dark:text-white">{completedAuditData.activo_codigo}</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{completedAuditData.activo_nombre}</p>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duración de auditoría</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{completedAuditData.duracion_minutos} minutos</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Date/Time Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h3 className="text-lg font-bold mb-6 dark:text-white">
                {isScheduled ? 'Fecha y Hora Programada' : 'Fecha y Hora de Ejecución'}
              </h3>
              <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                    {isScheduled ? 'Programada para' : 'Completada el'}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {isScheduled ? `${data.fecha} a las ${scheduledAuditData.hora}` : completedAuditData.fecha_hora}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* GPS Validation - Only for completed */}
            {!isScheduled && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-bold dark:text-white">Validación PostGIS</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Coordenadas GPS</p>
                    <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{completedAuditData.coordenadas_gps}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                      <span>Lat: {completedAuditData.lat}</span>
                      <span>Lng: {completedAuditData.lng}</span>
                    </div>
                  </div>

                  {completedAuditData.coincidencia_ubicacion ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Ubicación Validada</p>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                        Las coordenadas GPS coinciden con la ubicación registrada del activo
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-500/20 rounded-2xl border-2 border-red-200 dark:border-red-700/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <p className="font-semibold text-red-700 dark:text-red-400">Discrepancia de Ubicación</p>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                        Las coordenadas GPS no coinciden con la ubicación esperada
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Comments/Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isScheduled ? 0.1 : 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-bold dark:text-white">
                  {isScheduled ? 'Notas de Programación' : 'Comentarios del Auditor'}
                </h3>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl min-h-[120px]">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {isScheduled ? scheduledAuditData.notas : (completedAuditData.comentarios || 'Sin comentarios adicionales.')}
                </p>
              </div>
            </motion.div>

            {/* Evidence Photo - Only for completed */}
            {!isScheduled && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Camera className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-bold dark:text-white">Evidencia Fotográfica</h3>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center">
                  {completedAuditData.evidencia_foto_url ? (
                    <img 
                      src={completedAuditData.evidencia_foto_url} 
                      alt="Evidencia" 
                      className="w-full rounded-xl"
                    />
                  ) : (
                    <div className="py-8">
                      <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-500">No se adjuntó evidencia fotográfica</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}