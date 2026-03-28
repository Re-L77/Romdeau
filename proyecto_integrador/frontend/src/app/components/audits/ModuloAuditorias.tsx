import { motion } from 'motion/react';
import { Calendar, MapPin, User, CheckCircle2, AlertTriangle, Plus, Navigation, XCircle } from 'lucide-react';
import { useState } from 'react';
import { CrearAuditoria, AuditFormData } from './CrearAuditoria';
import { mockDB } from '../../data/mockData';

interface ModuloAuditoriasProps {
  onScheduledAuditClick: (auditId: string) => void;
  onCompletedAuditClick: (auditId: string) => void;
}

const scheduledAudits = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo A',
    piso: 'Piso 4',
    salon: 'Oficinas Generales',
    auditor_id: 'u2b3c4d5-e6f7-8901-bcde-f12345678901',
    auditor: 'Ana Gutiérrez',
    fecha: '2026-02-25',
    hora: '10:00',
    status: 'pending',
    activos_programados: 18,
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
    campus: 'Campus Central',
    edificio: 'Data Center Principal',
    piso: 'Planta Baja',
    salon: 'Sala de Servidores A',
    auditor_id: 'u3c4d5e6-f7g8-9012-cdef-234567890123',
    auditor: 'Jorge Pérez',
    fecha: '2026-02-26',
    hora: '14:00',
    status: 'pending',
    activos_programados: 12,
  },
];

const completedAudits = [
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-234567890123',
    activo_codigo: 'AST-2024-001',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo A',
    piso: 'Piso 3',
    salon: 'Oficina 3B-14',
    auditor_id: 'u1a2b3c4-d5e6-7890-abcd-ef1234567890',
    auditor: 'Carlos Mendoza',
    fecha_hora: '2026-02-23 14:30',
    coordenadas_gps: 'POINT(-99.1332 19.4326)', // Ciudad de México
    coincidencia_ubicacion: true,
    estado_reportado: 'BUENO',
    estado_reportado_id: 1,
    comentarios: null,
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-345678901234',
    activo_codigo: 'AST-2023-156',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo B',
    piso: 'Piso 1',
    salon: 'Sala de Impresión Contabilidad',
    auditor_id: 'u4d5e6f7-g8h9-0123-defg-345678901234',
    auditor: 'María Rodríguez',
    fecha_hora: '2026-02-22 09:30',
    coordenadas_gps: 'POINT(-99.1325 19.4320)',
    coincidencia_ubicacion: true,
    estado_reportado: 'DANADO',
    estado_reportado_id: 2,
    comentarios: 'Impresora HP LaserJet Pro encontrada dañada. Requiere mantenimiento urgente. Componente de alimentación de papel con falla mecánica.',
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-456789012345',
    activo_codigo: 'AST-2024-045',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo A',
    piso: 'Piso 2',
    salon: 'Oficina 2A-08',
    auditor_id: 'u2b3c4d5-e6f7-8901-bcde-f12345678901',
    auditor: 'Ana Gutiérrez',
    fecha_hora: '2026-02-22 11:15',
    coordenadas_gps: 'POINT(-99.1330 19.4322)',
    coincidencia_ubicacion: true,
    estado_reportado: 'BUENO',
    estado_reportado_id: 1,
    comentarios: null,
  },
  {
    id: 'f6g7h8i9-j0k1-2345-fghi-567890123456',
    activo_codigo: 'AST-2024-078',
    campus: 'Campus Norte',
    edificio: 'Edificio Operaciones',
    piso: 'Piso 2',
    salon: 'Almacén General',
    auditor_id: 'u3c4d5e6-f7g8-9012-cdef-234567890123',
    auditor: 'Jorge Pérez',
    fecha_hora: '2026-02-21 16:00',
    coordenadas_gps: 'POINT(-99.1400 19.4400)',
    coincidencia_ubicacion: false,
    estado_reportado: 'NO_ENCONTRADO',
    estado_reportado_id: 3,
    comentarios: 'Activo no localizado en el área asignada. Posible transferencia no registrada o extravío. Requiere investigación.',
  },
];

const estadoColors = {
  BUENO: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700/30', icon: CheckCircle2 },
  DANADO: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700/30', icon: AlertTriangle },
  NO_ENCONTRADO: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-700/30', icon: XCircle },
};

export function ModuloAuditorias({ onScheduledAuditClick, onCompletedAuditClick }: ModuloAuditoriasProps) {
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);

  const handleCreateAudit = () => {
    setIsCreatingAudit(true);
  };

  const handleSaveAudit = (formData: AuditFormData) => {
    // Obtener información adicional para mostrar la confirmación
    const sede = mockDB.sedes.find(s => s.id === formData.sede_id);
    const auditor = mockDB.usuarios.find(u => u.id === formData.auditor_id);
    
    let ubicacionTexto = '';
    if (formData.tipo_ubicacion === 'oficina' && formData.oficina_id) {
      const oficina = mockDB.oficinas.find(o => o.id === formData.oficina_id);
      const piso = mockDB.pisos.find(p => p.id === oficina?.piso_id);
      const edificio = mockDB.edificios.find(e => e.id === piso?.edificio_id);
      ubicacionTexto = `${sede?.nombre} → ${edificio?.nombre} → ${piso?.nombre} → ${oficina?.nombre}`;
    } else if (formData.tipo_ubicacion === 'estante' && formData.estante_id) {
      const estante = mockDB.estantes.find(e => e.id === formData.estante_id);
      const pasillo = mockDB.pasillos.find(p => p.id === estante?.pasillo_id);
      const almacen = mockDB.almacenes.find(a => a.id === pasillo?.almacen_id);
      ubicacionTexto = `${sede?.nombre} → ${almacen?.nombre} → ${pasillo?.nombre} → ${estante?.nombre}`;
    }

    console.log('Nueva auditoría programada:', {
      ...formData,
      ubicacion_texto: ubicacionTexto,
      auditor_nombre: auditor?.nombre_completo,
    });
    
    alert(`✅ Auditoría programada exitosamente\n\n📍 Ubicación: ${ubicacionTexto}\n👤 Auditor: ${auditor?.nombre_completo}\n📅 Fecha: ${formData.fecha} a las ${formData.hora}\n📦 Activos: ${formData.activos_programados.length}`);
    
    setIsCreatingAudit(false);
  };

  const handleCloseModal = () => {
    setIsCreatingAudit(false);
  };

  return (
    <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Módulo de Auditorías</h1>
          <p className="text-gray-600 dark:text-gray-400">Programación y seguimiento con validación PostGIS</p>
        </div>

        {/* Schedule Audit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">Programar Nueva Auditoría</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
              onClick={handleCreateAudit}
            >
              <Plus className="w-4 h-4" />
              Crear Auditoría
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campus
              </label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                <option>Campus Central</option>
                <option>Campus Norte</option>
                <option>Campus Sur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edificio
              </label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                <option>Edificio Administrativo A</option>
                <option>Edificio Administrativo B</option>
                <option>Data Center Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auditor Asignado
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <select className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                  <option>Ana Gutiérrez</option>
                  <option>Jorge Pérez</option>
                  <option>María Rodríguez</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha y Hora
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="datetime-local"
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scheduled Audits */}
        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Auditorías Programadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledAudits.map((audit, index) => (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onScheduledAuditClick(audit.id)}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 dark:text-white">{audit.campus}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{audit.edificio} → {audit.piso}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{audit.salon}</p>
                  </div>
                  <div className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700/30">
                    Pendiente
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{audit.auditor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{audit.fecha} a las {audit.hora}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{audit.activos_programados}</span> activos programados
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completed Audits */}
        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Auditorías Completadas (Logs)</h2>
          <div className="space-y-3">
            {completedAudits.map((audit, index) => {
              const estadoConfig = estadoColors[audit.estado_reportado as keyof typeof estadoColors];
              const IconComponent = estadoConfig.icon;

              return (
                <motion.div
                  key={audit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => onCompletedAuditClick(audit.id)}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg dark:text-white">{audit.activo_codigo}</h3>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border}`}>
                          <IconComponent className="w-4 h-4" />
                          <span>{audit.estado_reportado.replace('_', ' ')}</span>
                        </div>
                        {audit.coincidencia_ubicacion && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-700/30">
                            <Navigation className="w-3 h-3" />
                            <span>PostGIS Validado</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="font-medium">{audit.campus}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{audit.edificio}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <User className="w-4 h-4" />
                          <span>{audit.auditor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>{audit.fecha_hora}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-500">
                          GPS: {audit.coordenadas_gps}
                        </div>
                      </div>

                      {audit.comentarios && (
                        <div className={`mt-4 p-4 rounded-2xl border-2 ${estadoConfig.bg} ${estadoConfig.border}`}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${estadoConfig.text}`} />
                            <div>
                              <p className={`text-sm font-semibold mb-1 ${estadoConfig.text}`}>Comentarios del Auditor</p>
                              <p className={`text-sm ${estadoConfig.text}`}>{audit.comentarios}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Crear Auditoría */}
      {isCreatingAudit && (
        <CrearAuditoria
          onClose={handleCloseModal}
          onSave={handleSaveAudit}
        />
      )}
    </main>
  );
}