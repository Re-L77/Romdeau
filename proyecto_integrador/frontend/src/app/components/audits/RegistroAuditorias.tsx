import { motion } from 'motion/react';
import { Calendar, User, CheckCircle2, AlertTriangle, XCircle, Navigation, Filter, Search, Download } from 'lucide-react';
import { useState } from 'react';
import { ExportarReporte, ExportFormData } from '../reports/ExportarReporte';

const auditLogs = [
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-234567890123',
    activo_codigo: 'AST-2024-001',
    activo_nombre: 'MacBook Pro 16" M3',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo A',
    piso: 'Piso 3',
    salon: 'Oficina 3B-14',
    auditor: 'Carlos Mendoza',
    fecha_hora: '2026-02-23 14:30',
    coordenadas_gps: 'POINT(-99.1332 19.4326)',
    coincidencia_ubicacion: true,
    estado_reportado: 'BUENO',
    estado_reportado_id: 1,
    comentarios: null,
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-345678901234',
    activo_codigo: 'AST-2023-156',
    activo_nombre: 'Impresora HP LaserJet Pro',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo B',
    piso: 'Piso 1',
    salon: 'Sala de Impresión Contabilidad',
    auditor: 'María Rodríguez',
    fecha_hora: '2026-02-22 09:30',
    coordenadas_gps: 'POINT(-99.1325 19.4320)',
    coincidencia_ubicacion: true,
    estado_reportado: 'DANADO',
    estado_reportado_id: 2,
    comentarios: 'Impresora encontrada dañada. Requiere mantenimiento urgente.',
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-456789012345',
    activo_codigo: 'AST-2024-045',
    activo_nombre: 'iPhone 15 Pro',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo A',
    piso: 'Piso 2',
    salon: 'Oficina 2A-08',
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
    activo_nombre: 'Dell PowerEdge R750',
    campus: 'Campus Norte',
    edificio: 'Edificio Operaciones',
    piso: 'Piso 2',
    salon: 'Almacén General',
    auditor: 'Jorge Pérez',
    fecha_hora: '2026-02-21 16:00',
    coordenadas_gps: 'POINT(-99.1400 19.4400)',
    coincidencia_ubicacion: false,
    estado_reportado: 'NO_ENCONTRADO',
    estado_reportado_id: 3,
    comentarios: 'Activo no localizado. Posible transferencia no registrada.',
  },
  {
    id: 'g7h8i9j0-k1l2-3456-ghij-678901234567',
    activo_codigo: 'AST-2023-089',
    activo_nombre: 'Monitor LG UltraWide 34"',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo A',
    piso: 'Piso 3',
    salon: 'Oficina 3B-14',
    auditor: 'Carlos Mendoza',
    fecha_hora: '2026-02-22 16:45',
    coordenadas_gps: 'POINT(-99.1332 19.4326)',
    coincidencia_ubicacion: true,
    estado_reportado: 'BUENO',
    estado_reportado_id: 1,
    comentarios: null,
  },
  {
    id: 'h8i9j0k1-l2m3-4567-hijk-789012345678',
    activo_codigo: 'AST-2024-112',
    activo_nombre: 'iPad Pro 12.9"',
    campus: 'Campus Sur',
    edificio: 'Centro de Innovación',
    piso: 'Piso 1',
    salon: 'Lab de Diseño',
    auditor: 'Ana Gutiérrez',
    fecha_hora: '2026-02-20 10:15',
    coordenadas_gps: 'POINT(-99.1500 19.4100)',
    coincidencia_ubicacion: true,
    estado_reportado: 'BUENO',
    estado_reportado_id: 1,
    comentarios: null,
  },
  {
    id: 'i9j0k1l2-m3n4-5678-ijkl-890123456789',
    activo_codigo: 'AST-2023-201',
    activo_nombre: 'Cisco Switch 48 Port',
    campus: 'Campus Central',
    edificio: 'Data Center Principal',
    piso: 'Planta Baja',
    salon: 'Rack A12',
    auditor: 'Jorge Pérez',
    fecha_hora: '2026-02-19 14:00',
    coordenadas_gps: 'POINT(-99.1335 19.4328)',
    coincidencia_ubicacion: true,
    estado_reportado: 'DANADO',
    estado_reportado_id: 2,
    comentarios: 'Puerto 24 no funciona. Requiere reemplazo.',
  },
  {
    id: 'j0k1l2m3-n4o5-6789-jklm-901234567890',
    activo_codigo: 'AST-2024-055',
    activo_nombre: 'ThinkPad X1 Carbon',
    campus: 'Campus Central',
    edificio: 'Edificio Administrativo B',
    piso: 'Piso 2',
    salon: 'Oficina 2C-10',
    auditor: 'María Rodríguez',
    fecha_hora: '2026-02-18 11:30',
    coordenadas_gps: 'POINT(-99.1328 19.4318)',
    coincidencia_ubicacion: true,
    estado_reportado: 'BUENO',
    estado_reportado_id: 1,
    comentarios: null,
  },
];

const estadoColors = {
  BUENO: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700/30', icon: CheckCircle2 },
  DANADO: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700/30', icon: AlertTriangle },
  NO_ENCONTRADO: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-700/30', icon: XCircle },
};

interface RegistroAuditoriasProps {
  onAuditClick: (auditId: string) => void;
}

export function RegistroAuditorias({ onAuditClick }: RegistroAuditoriasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campusFilter, setCampusFilter] = useState<string>('all');
  const [auditorFilter, setAuditorFilter] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
  };

  const handleExport = (exportData: ExportFormData) => {
    console.log('Exportando reporte con configuración:', exportData);
    
    // Simular descarga
    const fileName = `Reporte_Auditorias_${new Date().toISOString().split('T')[0]}.${exportData.formato.toLowerCase()}`;
    
    alert(`✅ Reporte generado exitosamente\n\n📄 Formato: ${exportData.formato}\n📅 Período: ${exportData.periodo}\n📊 Agrupado por: ${exportData.agrupar_por}\n🔍 Filtro: ${exportData.filtro_estado}\n📸 Incluye fotos: ${exportData.incluir_fotos ? 'Sí' : 'No'}\n📍 Incluye GPS: ${exportData.incluir_coordenadas ? 'Sí' : 'No'}\n💬 Incluye comentarios: ${exportData.incluir_comentarios ? 'Sí' : 'No'}\n\n📥 Archivo: ${fileName}`);
    
    setIsExportModalOpen(false);
  };

  // Extract unique values
  const statuses = ['all', ...new Set(auditLogs.map(a => a.estado_reportado))];
  const campuses = ['all', ...new Set(auditLogs.map(a => a.campus))];
  const auditors = ['all', ...new Set(auditLogs.map(a => a.auditor))];

  // Filter logic
  const filteredLogs = auditLogs.filter(log => {
    if (searchTerm && !log.activo_codigo.toLowerCase().includes(searchTerm.toLowerCase()) && !log.activo_nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter !== 'all' && log.estado_reportado !== statusFilter) return false;
    if (campusFilter !== 'all' && log.campus !== campusFilter) return false;
    if (auditorFilter !== 'all' && log.auditor !== auditorFilter) return false;
    return true;
  });

  // Stats
  const stats = {
    total: auditLogs.length,
    bueno: auditLogs.filter(l => l.estado_reportado === 'BUENO').length,
    danado: auditLogs.filter(l => l.estado_reportado === 'DANADO').length,
    no_encontrado: auditLogs.filter(l => l.estado_reportado === 'NO_ENCONTRADO').length,
    gps_validados: auditLogs.filter(l => l.coincidencia_ubicacion).length,
  };

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Registro de Auditorías (logs_auditoria)</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Historial completo de auditorías realizadas - <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filteredLogs.length} de {auditLogs.length} registros</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
            onClick={handleOpenExportModal}
          >
            <Download className="w-4 h-4" />
            Exportar Reporte
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Total Auditorías</p>
            <p className="text-3xl font-bold dark:text-white">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Estado: BUENO</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.bueno}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Estado: DAÑADO</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.danado}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">NO ENCONTRADO</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.no_encontrado}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">GPS Validados</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.gps_validados}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtros y Búsqueda</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar activo..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'Todos los estados' : status}
                </option>
              ))}
            </select>

            {/* Campus Filter */}
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {campuses.map(campus => (
                <option key={campus} value={campus}>
                  {campus === 'all' ? 'Todos los campus' : campus}
                </option>
              ))}
            </select>

            {/* Auditor Filter */}
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {auditors.map(auditor => (
                <option key={auditor} value={auditor}>
                  {auditor === 'all' ? 'Todos los auditores' : auditor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="space-y-3">
          {filteredLogs.map((log, index) => {
            const estadoConfig = estadoColors[log.estado_reportado as keyof typeof estadoColors];
            const IconComponent = estadoConfig.icon;

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onAuditClick(log.id)}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Activo</p>
                      <p className="font-bold text-gray-900 dark:text-white">{log.activo_codigo}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{log.activo_nombre}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Ubicación</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.campus}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{log.edificio}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">{log.piso} → {log.salon}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Auditor</p>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{log.auditor}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Fecha y Hora</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs text-gray-700 dark:text-gray-300">{log.fecha_hora}</p>
                      </div>
                      {log.coincidencia_ubicacion && (
                        <div className="flex items-center gap-1 mt-1">
                          <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">GPS Validado</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border}`}>
                        <IconComponent className="w-4 h-4" />
                        <span>{log.estado_reportado.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {log.comentarios && (
                  <div className={`mt-4 p-4 rounded-2xl border-2 ${estadoConfig.bg} ${estadoConfig.border}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${estadoConfig.text}`} />
                      <p className={`text-sm ${estadoConfig.text}`}>{log.comentarios}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal de Exportar Reporte */}
      {isExportModalOpen && (
        <ExportarReporte
          onClose={handleCloseExportModal}
          onExport={handleExport}
        />
      )}
    </main>
  );
}