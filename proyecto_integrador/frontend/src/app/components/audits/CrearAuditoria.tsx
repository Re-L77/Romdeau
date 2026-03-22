import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, User, Clock, Package, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mockDB } from '../../data/mockData';

interface CrearAuditoriaProps {
  onClose: () => void;
  onSave: (auditData: AuditFormData) => void;
}

export interface AuditFormData {
  sede_id: string;
  edificio_id?: string;
  piso_id?: string;
  oficina_id?: string;
  almacen_id?: string;
  pasillo_id?: string;
  estante_id?: string;
  auditor_id: string;
  fecha: string;
  hora: string;
  tipo_ubicacion: 'oficina' | 'estante';
  activos_programados: string[];
}

export function CrearAuditoria({ onClose, onSave }: CrearAuditoriaProps) {
  const [formData, setFormData] = useState<AuditFormData>({
    sede_id: '',
    auditor_id: '',
    fecha: '',
    hora: '',
    tipo_ubicacion: 'oficina',
    activos_programados: [],
  });

  const [selectedSede, setSelectedSede] = useState('');
  const [selectedEdificio, setSelectedEdificio] = useState('');
  const [selectedPiso, setSelectedPiso] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState('');
  const [selectedPasillo, setSelectedPasillo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrar edificios por sede seleccionada
  const edificiosFiltrados = mockDB.edificios.filter(e => e.sede_id === selectedSede);
  
  // Filtrar pisos por edificio seleccionado
  const pisosFiltrados = mockDB.pisos.filter(p => p.edificio_id === selectedEdificio);
  
  // Filtrar oficinas por piso seleccionado
  const oficinasFiltradas = mockDB.oficinas.filter(o => o.piso_id === selectedPiso);

  // Filtrar almacenes por sede seleccionada
  const almacenesFiltrados = mockDB.almacenes.filter(a => a.sede_id === selectedSede);
  
  // Filtrar pasillos por almacén seleccionado
  const pasillosFiltrados = mockDB.pasillos.filter(p => p.almacen_id === selectedAlmacen);
  
  // Filtrar estantes por pasillo seleccionado
  const estantesFiltrados = mockDB.estantes.filter(e => e.pasillo_id === selectedPasillo);

  // Filtrar solo auditores
  const auditores = mockDB.usuarios.filter(u => u.rol_id === 2 || u.rol_id === 1); // AUDITOR o ADMIN

  // Obtener activos en la ubicación seleccionada
  const getActivosEnUbicacion = () => {
    if (formData.tipo_ubicacion === 'oficina' && formData.oficina_id) {
      return mockDB.activos.filter(a => a.oficina_id === formData.oficina_id);
    } else if (formData.tipo_ubicacion === 'estante' && formData.estante_id) {
      return mockDB.activos.filter(a => a.estante_id === formData.estante_id);
    }
    return [];
  };

  const activosDisponibles = getActivosEnUbicacion();

  // Actualizar formData cuando cambian las selecciones
  useEffect(() => {
    setFormData(prev => ({ ...prev, sede_id: selectedSede }));
  }, [selectedSede]);

  useEffect(() => {
    if (formData.tipo_ubicacion === 'oficina') {
      setFormData(prev => ({ 
        ...prev, 
        edificio_id: selectedEdificio,
        almacen_id: undefined,
        pasillo_id: undefined,
        estante_id: undefined,
      }));
    }
  }, [selectedEdificio, formData.tipo_ubicacion]);

  useEffect(() => {
    if (formData.tipo_ubicacion === 'oficina') {
      setFormData(prev => ({ 
        ...prev, 
        piso_id: selectedPiso,
      }));
    }
  }, [selectedPiso, formData.tipo_ubicacion]);

  useEffect(() => {
    if (formData.tipo_ubicacion === 'estante') {
      setFormData(prev => ({ 
        ...prev, 
        almacen_id: selectedAlmacen,
        edificio_id: undefined,
        piso_id: undefined,
        oficina_id: undefined,
      }));
    }
  }, [selectedAlmacen, formData.tipo_ubicacion]);

  useEffect(() => {
    if (formData.tipo_ubicacion === 'estante') {
      setFormData(prev => ({ 
        ...prev, 
        pasillo_id: selectedPasillo,
      }));
    }
  }, [selectedPasillo, formData.tipo_ubicacion]);

  const handleTipoUbicacionChange = (tipo: 'oficina' | 'estante') => {
    setFormData({
      ...formData,
      tipo_ubicacion: tipo,
      edificio_id: undefined,
      piso_id: undefined,
      oficina_id: undefined,
      almacen_id: undefined,
      pasillo_id: undefined,
      estante_id: undefined,
      activos_programados: [],
    });
    setSelectedEdificio('');
    setSelectedPiso('');
    setSelectedAlmacen('');
    setSelectedPasillo('');
  };

  const handleToggleActivo = (activoId: string) => {
    setFormData(prev => ({
      ...prev,
      activos_programados: prev.activos_programados.includes(activoId)
        ? prev.activos_programados.filter(id => id !== activoId)
        : [...prev.activos_programados, activoId],
    }));
  };

  const handleSelectAllActivos = () => {
    const todosLosIds = activosDisponibles.map(a => a.id);
    setFormData(prev => ({
      ...prev,
      activos_programados: todosLosIds,
    }));
  };

  const handleDeselectAllActivos = () => {
    setFormData(prev => ({
      ...prev,
      activos_programados: [],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sede_id) newErrors.sede = 'Selecciona una sede';
    if (!formData.auditor_id) newErrors.auditor = 'Selecciona un auditor';
    if (!formData.fecha) newErrors.fecha = 'Selecciona una fecha';
    if (!formData.hora) newErrors.hora = 'Selecciona una hora';

    if (formData.tipo_ubicacion === 'oficina') {
      if (!formData.oficina_id) newErrors.ubicacion = 'Selecciona una oficina';
    } else {
      if (!formData.estante_id) newErrors.ubicacion = 'Selecciona un estante';
    }

    if (formData.activos_programados.length === 0) {
      newErrors.activos = 'Selecciona al menos un activo para auditar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  // Obtener fecha mínima (hoy)
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
          className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Programar Nueva Auditoría</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Selecciona ubicación, auditor y activos a verificar
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
              {/* Tipo de Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de Ubicación
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleTipoUbicacionChange('oficina')}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      formData.tipo_ubicacion === 'oficina'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Oficina
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoUbicacionChange('estante')}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      formData.tipo_ubicacion === 'estante'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Almacén / Estante
                  </button>
                </div>
              </div>

              {/* Sede */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Sede *
                </label>
                <select
                  value={selectedSede}
                  onChange={(e) => setSelectedSede(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  <option value="">Selecciona una sede</option>
                  {mockDB.sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                  ))}
                </select>
                {errors.sede && <p className="text-red-500 text-xs mt-1">{errors.sede}</p>}
              </div>

              {/* Jerarquía Administrativa (Oficinas) */}
              {formData.tipo_ubicacion === 'oficina' && selectedSede && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Edificio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Edificio *
                      </label>
                      <select
                        value={selectedEdificio}
                        onChange={(e) => setSelectedEdificio(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      >
                        <option value="">Selecciona edificio</option>
                        {edificiosFiltrados.map(edificio => (
                          <option key={edificio.id} value={edificio.id}>{edificio.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Piso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Piso *
                      </label>
                      <select
                        value={selectedPiso}
                        onChange={(e) => setSelectedPiso(e.target.value)}
                        disabled={!selectedEdificio}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                      >
                        <option value="">Selecciona piso</option>
                        {pisosFiltrados.map(piso => (
                          <option key={piso.id} value={piso.id}>{piso.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Oficina */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Oficina *
                      </label>
                      <select
                        value={formData.oficina_id || ''}
                        onChange={(e) => setFormData({ ...formData, oficina_id: e.target.value })}
                        disabled={!selectedPiso}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                      >
                        <option value="">Selecciona oficina</option>
                        {oficinasFiltradas.map(oficina => (
                          <option key={oficina.id} value={oficina.id}>{oficina.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Jerarquía de Almacenamiento (Estantes) */}
              {formData.tipo_ubicacion === 'estante' && selectedSede && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Almacén */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Almacén *
                      </label>
                      <select
                        value={selectedAlmacen}
                        onChange={(e) => setSelectedAlmacen(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      >
                        <option value="">Selecciona almacén</option>
                        {almacenesFiltrados.map(almacen => (
                          <option key={almacen.id} value={almacen.id}>{almacen.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Pasillo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pasillo *
                      </label>
                      <select
                        value={selectedPasillo}
                        onChange={(e) => setSelectedPasillo(e.target.value)}
                        disabled={!selectedAlmacen}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                      >
                        <option value="">Selecciona pasillo</option>
                        {pasillosFiltrados.map(pasillo => (
                          <option key={pasillo.id} value={pasillo.id}>{pasillo.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Estante */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estante *
                      </label>
                      <select
                        value={formData.estante_id || ''}
                        onChange={(e) => setFormData({ ...formData, estante_id: e.target.value })}
                        disabled={!selectedPasillo}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent disabled:opacity-50"
                      >
                        <option value="">Selecciona estante</option>
                        {estantesFiltrados.map(estante => (
                          <option key={estante.id} value={estante.id}>{estante.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {errors.ubicacion && <p className="text-red-500 text-xs">{errors.ubicacion}</p>}

              {/* Auditor, Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Auditor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Auditor Asignado *
                  </label>
                  <select
                    value={formData.auditor_id}
                    onChange={(e) => setFormData({ ...formData, auditor_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="">Selecciona auditor</option>
                    {auditores.map(auditor => (
                      <option key={auditor.id} value={auditor.id}>
                        {auditor.nombre_completo}
                      </option>
                    ))}
                  </select>
                  {errors.auditor && <p className="text-red-500 text-xs mt-1">{errors.auditor}</p>}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                  {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                  {errors.hora && <p className="text-red-500 text-xs mt-1">{errors.hora}</p>}
                </div>
              </div>

              {/* Selección de Activos */}
              {activosDisponibles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Package className="w-4 h-4 inline mr-1" />
                      Activos en esta ubicación ({activosDisponibles.length})
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllActivos}
                        className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                      >
                        Seleccionar todos
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllActivos}
                        className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Deseleccionar todos
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {activosDisponibles.map(activo => {
                      const isSelected = formData.activos_programados.includes(activo.id);
                      return (
                        <button
                          key={activo.id}
                          type="button"
                          onClick={() => handleToggleActivo(activo.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                {activo.codigo_etiqueta}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {activo.nombre || 'Activo sin nombre'}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 ml-2 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.activos && <p className="text-red-500 text-xs mt-2">{errors.activos}</p>}
                </div>
              )}

              {activosDisponibles.length === 0 && (formData.oficina_id || formData.estante_id) && (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay activos en esta ubicación
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.activos_programados.length} activos seleccionados
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
                  <Calendar className="w-4 h-4" />
                  Programar Auditoría
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
