import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, FileSpreadsheet, Calendar, Filter, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ExportarReporteProps {
  onClose: () => void;
  onExport: (exportData: ExportFormData) => void;
}

export interface ExportFormData {
  formato: 'PDF' | 'EXCEL' | 'CSV';
  periodo: 'today' | 'week' | 'month' | 'custom';
  fecha_inicio?: string;
  fecha_fin?: string;
  incluir_fotos: boolean;
  incluir_coordenadas: boolean;
  incluir_comentarios: boolean;
  filtro_estado: 'todos' | 'BUENO' | 'DANADO' | 'NO_ENCONTRADO';
  agrupar_por: 'fecha' | 'ubicacion' | 'auditor' | 'estado';
}

const formatoOptions = [
  { value: 'PDF', label: 'PDF', icon: FileText, description: 'Documento imprimible con formato' },
  { value: 'EXCEL', label: 'Excel', icon: FileSpreadsheet, description: 'Análisis y tablas dinámicas' },
  { value: 'CSV', label: 'CSV', icon: FileText, description: 'Datos sin formato' },
];

const periodoOptions = [
  { value: 'today', label: 'Hoy', description: 'Solo auditorías de hoy' },
  { value: 'week', label: 'Esta Semana', description: 'Últimos 7 días' },
  { value: 'month', label: 'Este Mes', description: 'Últimos 30 días' },
  { value: 'custom', label: 'Personalizado', description: 'Selecciona rango de fechas' },
];

const estadoOptions = [
  { value: 'todos', label: 'Todos los Estados' },
  { value: 'BUENO', label: 'Solo BUENO' },
  { value: 'DANADO', label: 'Solo DAÑADO' },
  { value: 'NO_ENCONTRADO', label: 'Solo NO ENCONTRADO' },
];

const agruparOptions = [
  { value: 'fecha', label: 'Agrupar por Fecha' },
  { value: 'ubicacion', label: 'Agrupar por Ubicación' },
  { value: 'auditor', label: 'Agrupar por Auditor' },
  { value: 'estado', label: 'Agrupar por Estado' },
];

export function ExportarReporte({ onClose, onExport }: ExportarReporteProps) {
  const [formData, setFormData] = useState<ExportFormData>({
    formato: 'PDF',
    periodo: 'month',
    incluir_fotos: true,
    incluir_coordenadas: true,
    incluir_comentarios: true,
    filtro_estado: 'todos',
    agrupar_por: 'fecha',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.periodo === 'custom') {
      if (!formData.fecha_inicio) {
        newErrors.fecha_inicio = 'Selecciona fecha de inicio';
      }
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = 'Selecciona fecha de fin';
      }
      if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio > formData.fecha_fin) {
        newErrors.fecha_fin = 'La fecha fin debe ser posterior a la fecha inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onExport(formData);
      onClose();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Exportar Reporte de Auditorías</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configura el formato y contenido del reporte
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Formato de Exportación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Formato de Archivo
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {formatoOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = formData.formato === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, formato: option.value as any })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold">{option.label}</span>
                        </div>
                        <p className={`text-xs ${
                          isSelected 
                            ? 'text-white/80 dark:text-black/80' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Período de Tiempo
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {periodoOptions.map(option => {
                    const isSelected = formData.periodo === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, periodo: option.value as any })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {option.description}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rango de Fechas Personalizado */}
              {formData.periodo === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      max={today}
                      value={formData.fecha_inicio || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    {errors.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      max={today}
                      value={formData.fecha_fin || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                    {errors.fecha_fin && <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>}
                  </div>
                </div>
              )}

              {/* Filtros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filtros
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filtro por Estado */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Estado de Activos
                    </label>
                    <select
                      value={formData.filtro_estado}
                      onChange={(e) => setFormData({ ...formData, filtro_estado: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    >
                      {estadoOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Agrupar Por */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Agrupar Por
                    </label>
                    <select
                      value={formData.agrupar_por}
                      onChange={(e) => setFormData({ ...formData, agrupar_por: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    >
                      {agruparOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Opciones de Contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Contenido del Reporte
                </label>
                <div className="space-y-3">
                  {/* Incluir Fotos */}
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        formData.incluir_fotos 
                          ? 'bg-black dark:bg-white border-black dark:border-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.incluir_fotos && (
                          <CheckCircle className="w-4 h-4 text-white dark:text-black" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Incluir Fotografías</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Imágenes de evidencia de auditoría</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.incluir_fotos}
                      onChange={(e) => setFormData({ ...formData, incluir_fotos: e.target.checked })}
                      className="sr-only"
                    />
                  </label>

                  {/* Incluir Coordenadas GPS */}
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        formData.incluir_coordenadas 
                          ? 'bg-black dark:bg-white border-black dark:border-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.incluir_coordenadas && (
                          <CheckCircle className="w-4 h-4 text-white dark:text-black" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Incluir Coordenadas GPS</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Datos PostGIS de geolocalización</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.incluir_coordenadas}
                      onChange={(e) => setFormData({ ...formData, incluir_coordenadas: e.target.checked })}
                      className="sr-only"
                    />
                  </label>

                  {/* Incluir Comentarios */}
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        formData.incluir_comentarios 
                          ? 'bg-black dark:bg-white border-black dark:border-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.incluir_comentarios && (
                          <CheckCircle className="w-4 h-4 text-white dark:text-black" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Incluir Comentarios del Auditor</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Notas y observaciones de campo</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.incluir_comentarios}
                      onChange={(e) => setFormData({ ...formData, incluir_comentarios: e.target.checked })}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Resumen de Exportación */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-2">
                  Resumen de Exportación
                </h4>
                <ul className="text-sm text-emerald-800 dark:text-emerald-300 space-y-1">
                  <li>• Formato: <span className="font-semibold">{formData.formato}</span></li>
                  <li>• Período: <span className="font-semibold">
                    {formData.periodo === 'custom' && formData.fecha_inicio && formData.fecha_fin
                      ? `${formData.fecha_inicio} - ${formData.fecha_fin}`
                      : periodoOptions.find(p => p.value === formData.periodo)?.label
                    }
                  </span></li>
                  <li>• Agrupado por: <span className="font-semibold">
                    {agruparOptions.find(a => a.value === formData.agrupar_por)?.label}
                  </span></li>
                  <li>• Filtros: <span className="font-semibold">
                    {estadoOptions.find(e => e.value === formData.filtro_estado)?.label}
                  </span></li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                El reporte se descargará automáticamente
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generar Reporte
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}