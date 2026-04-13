import { motion, AnimatePresence } from 'motion/react';
import { X, Package, MapPin, User, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { activosApi, categoriasApi, usuariosApi, ubicacionesApi, estadosApi, departamentosApi, Categoria } from '../../../services/api';

interface CreateEditAssetProps {
  assetId?: string;
  onClose: () => void;
  onSave: () => void;
}

interface Characteristic {
  key: string;
  value: string;
}

export function CreateEditAsset({ assetId, onClose, onSave }: CreateEditAssetProps) {
  const isEditing = !!assetId;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Data for selectors
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    departamentoId: '',
    custodianId: '',
    officeId: '',
    shelfId: '',
    estadoId: 1,
    locationType: 'office' as 'office' | 'shelf',
    costoAdquisicion: '',
    fechaCompra: new Date().toISOString().split('T')[0],
    finGarantia: ''
  });

  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const isMobile = selectedCategory?.tipo_rastreo === 'MOVIL';

  // Keep modal interactions predictable: lock body scroll and support ESC close
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, usrList, offList, shList, stList, deptList] = await Promise.all([
          categoriasApi.getAll(),
          usuariosApi.getAll(),
          ubicacionesApi.getOficinas(),
          ubicacionesApi.getEstantes(),
          estadosApi.getAll(),
          departamentosApi.getAll()
        ]);
        setCategories(cats);
        setUsers(usrList);
        setOffices(offList);
        setShelves(shList);
        setEstados(stList);
        setDepartamentos(deptList);

        if (isEditing && assetId) {
          const asset = await activosApi.getById(assetId);
          if (asset) {
            setFormData({
              name: asset.nombre || '',
              categoryId: asset.categoria_id || '',
              departamentoId: asset.usuarios?.departamento_id || '',
              custodianId: asset.custodio_actual_id || '',
              officeId: asset.oficina_id || '',
              shelfId: asset.estante_id || '',
              estadoId: asset.estado_operativo_id || 1,
              locationType: asset.estante_id ? 'shelf' : 'office',
              costoAdquisicion: asset.datos_financieros?.costo_adquisicion || '',
              fechaCompra: asset.datos_financieros?.fecha_compra ? new Date(asset.datos_financieros.fecha_compra).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              finGarantia: asset.datos_financieros?.fin_garantia ? new Date(asset.datos_financieros.fin_garantia).toISOString().split('T')[0] : ''
            });

            // Convert specifications JSON back to characteristics array
            if (asset.especificaciones) {
              const specs = asset.especificaciones;
              const chars = Object.entries(specs).map(([key, value]) => ({
                key,
                value: String(value)
              }));
              setCharacteristics(chars);
            }
          }
        }
      } catch (err) {
        console.error("Error loading form data:", err);
        setError("Error al cargar los datos necesarios para el formulario.");
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [isEditing, assetId]);

  const handleAddCharacteristic = () => {
    setCharacteristics([...characteristics, { key: '', value: '' }]);
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const handleCharacteristicChange = (index: number, field: 'key' | 'value', value: string) => {
    const newChars = [...characteristics];
    newChars[index][field] = value;
    setCharacteristics(newChars);
  };

  const validate = () => {
    if (!formData.name) return "El nombre es obligatorio";
    if (!formData.categoryId) return "La categoría es obligatoria";
    if (isMobile && !formData.departamentoId) return "Debe seleccionar un departamento";
    if (formData.custodianId && !formData.departamentoId) return "Selecciona un departamento para el custodio";
    if (!formData.costoAdquisicion || Number(formData.costoAdquisicion) <= 0) return "El costo inicial es obligatorio y debe ser mayor a 0";
    if (!formData.fechaCompra) return "La fecha de compra es obligatoria";
    
    if (formData.finGarantia && new Date(formData.finGarantia) < new Date(formData.fechaCompra)) {
      return "La fecha de fin de garantía no puede ser menor a la fecha de compra";
    }

    if (isMobile) {
      if (!formData.custodianId) return "Un activo móvil requiere un custodio obligatoriamente";
    } else {
      if (!formData.officeId && !formData.shelfId) return "Un activo fijo requiere una ubicación (Oficina o Estante)";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    // Build especificaciones JSON
    const especificaciones: Record<string, any> = {};
    characteristics.forEach(char => {
      if (char.key.trim()) {
        especificaciones[char.key.trim()] = char.value;
      }
    });

    const payload = {
      nombre: formData.name,
      categoria_id: formData.categoryId,
      estado_operativo_id: Number(formData.estadoId),
      costo_adquisicion: Number(formData.costoAdquisicion),
      fecha_compra: new Date(formData.fechaCompra).toISOString(),
      fin_garantia: formData.finGarantia ? new Date(formData.finGarantia).toISOString() : null,
      especificaciones,
      // Limpiar campos según tipo
      custodio_actual_id: isMobile ? formData.custodianId : (formData.custodianId || null),
      oficina_id: !isMobile && formData.locationType === 'office' ? formData.officeId : null,
      estante_id: !isMobile && formData.locationType === 'shelf' ? formData.shelfId : null,
    };

    if (!isEditing) {
      setPendingPayload(payload);
      setShowSummary(true);
      return;
    }

    await executeSave(payload);
  };

  const executeSave = async (payload: any) => {
    setLoading(true);

    try {
      if (isEditing && assetId) {
        await activosApi.update(assetId, payload);
      } else {
        await activosApi.create(payload);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Error al guardar el activo");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-12 flex flex-col items-center border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-medium text-gray-600 dark:text-gray-300">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 md:p-6 overflow-hidden"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col relative border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isEditing ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-black'}`}>
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isEditing ? 'Editar Activo' : 'Crear Nuevo Activo'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isMobile ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                  {selectedCategory ? (isMobile ? 'Móvil' : 'Fijo') : 'Tipo pendiente'}
                </span>
                {isEditing && <span className="text-xs text-gray-500 dark:text-gray-400">ID: {assetId?.split('-')[0]}</span>}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/20 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3"
            >
              <Info className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} id="asset-form" className="space-y-10">
            {/* SECTION: GENERAL DATA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-500/60 dark:text-gray-400/60">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Datos Generales</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-2">NOMBRE DEL ACTIVO</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl transition-all outline-none"
                    placeholder="Ej: Laptop Dell Latitude"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-2">CATEGORÍA</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl transition-all outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre} ({cat.tipo_rastreo})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-2">ESTADO INICIAL</label>
                  <select
                    value={formData.estadoId}
                    onChange={(e) => setFormData({ ...formData, estadoId: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl transition-all outline-none appearance-none cursor-pointer"
                  >
                    {estados.map(est => (
                      <option key={est.id} value={est.id}>{est.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: ASSIGNMENT / TYPE RULES */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-500/60 dark:text-gray-400/60">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Asignación y Ubicación</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              {!selectedCategory ? (
                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-3">
                  <Info className="w-6 h-6 opacity-30" />
                  <p className="text-sm font-medium">Selecciona una categoría primero para ver las opciones de ubicación</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Custodian - Required for Mobile, Optional for Fixed */}
                  <div className="space-y-3 bg-amber-500/5 dark:bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2 uppercase tracking-wider">
                        <User className="w-4 h-4" /> Custodio
                      </label>
                      {isMobile && <span className="bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Obligatorio</span>}
                    </div>
                    
                    <div className="mb-3 text-left">
                      <select
                        value={formData.departamentoId}
                        onChange={(e) => setFormData({ ...formData, departamentoId: e.target.value, custodianId: '' })}
                        className="w-full px-5 py-3 bg-white dark:bg-gray-900 border-2 border-transparent text-sm focus:border-amber-500/50 rounded-xl transition-all outline-none shadow-sm"
                      >
                        <option value="">{isMobile ? 'Seleccionar departamento (Obligatorio)...' : 'Seleccionar departamento (Opcional)...'}</option>
                        {departamentos.map(d => (
                          <option key={d.id} value={d.id}>{d.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <select
                      value={formData.custodianId}
                      onChange={(e) => setFormData({ ...formData, custodianId: e.target.value })}
                      disabled={!formData.departamentoId}
                      className="w-full px-5 py-4 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-amber-500/50 rounded-2xl transition-all outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.departamentoId 
                          ? 'Elige un departamento para ver custodios' 
                          : (isMobile ? 'Seleccionar custodio responsable...' : 'Sin custodio asignado')}
                      </option>
                      {users
                        .filter(u => u.activo !== false && String(u.departamento_id) === String(formData.departamentoId))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-amber-700/70 dark:text-amber-300/70 px-2 italic">
                      {isMobile ? 'Como activo móvil, el custodio es el responsable directo de su seguridad.' : 'Puedes asignar un custodio opcional para activos fijos.'}
                    </p>
                  </div>

                  {/* Physical Location - Only for Fixed */}
                  {!isMobile ? (
                    <div className="space-y-4 bg-gray-100/70 dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                          <MapPin className="w-4 h-4" /> Ubicación Física
                        </label>
                        <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-black text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Obligatorio</span>
                      </div>

                      <div className="flex p-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, locationType: 'office', shelfId: '' })}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.locationType === 'office' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                        >
                          EN OFICINA
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, locationType: 'shelf', officeId: '' })}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.locationType === 'shelf' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                        >
                          EN ESTANTE
                        </button>
                      </div>

                      {formData.locationType === 'office' ? (
                        <select
                          value={formData.officeId}
                          onChange={(e) => setFormData({ ...formData, officeId: e.target.value })}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-amber-500/50 rounded-2xl transition-all outline-none shadow-sm"
                        >
                          <option value="">Seleccionar oficina...</option>
                          {offices.map(o => (
                            <option key={o.id} value={o.id}>{o.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={formData.shelfId}
                          onChange={(e) => setFormData({ ...formData, shelfId: e.target.value })}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-amber-500/50 rounded-2xl transition-all outline-none shadow-sm"
                        >
                          <option value="">Seleccionar estante...</option>
                          {shelves.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[2rem] text-center">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center mb-3 shadow-sm">
                        <X className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">Sin Ubicación Física</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">Los activos móviles se rastrean por su geolocalización o custodio.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION: FINANCIAL DATA */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-500/60 dark:text-gray-400/60">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Información Financiera</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">VALOR INICIAL ($)</label>
                    <span className="bg-red-500/10 text-red-700 dark:text-red-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Obligatorio</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.costoAdquisicion}
                    onChange={(e) => setFormData({ ...formData, costoAdquisicion: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl transition-all outline-none text-xl font-bold text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">FECHA DE COMPRA</label>
                    <span className="bg-red-500/10 text-red-700 dark:text-red-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Obligatorio</span>
                  </div>
                  <input
                    type="date"
                    value={formData.fechaCompra}
                    onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-2">FIN DE GARANTÍA (Opcional)</label>
                  <input
                    type="date"
                    value={formData.finGarantia}
                    min={formData.fechaCompra}
                    onChange={(e) => setFormData({ ...formData, finGarantia: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: DYNAMIC CHARACTERISTICS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-500/60 dark:text-gray-400/60">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Características Adicionales</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {characteristics.map((char, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={char.key}
                          onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                          placeholder="Propiedad (Ej: Color)"
                          className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          value={char.value}
                          onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                          placeholder="Valor (Ej: Plateado)"
                          className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCharacteristic(index)}
                        className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: 'var(--muted)' }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={handleAddCharacteristic}
                  className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-amber-500 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Agregar Característica</span>
                </motion.button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800/30 rounded-b-[2rem]">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-2 border-gray-200 dark:border-gray-700"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              form="asset-form"
              disabled={loading}
              className={`flex-1 px-8 py-4 bg-gray-900 text-white dark:bg-gray-100 dark:text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-xl transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black dark:hover:bg-white'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {isEditing ? 'Guardar Cambios' : 'Finalizar Creación'}
                </>
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showSummary && pendingPayload && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[130]"
                onMouseDown={() => setShowSummary(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                onMouseDown={(event) => event.stopPropagation()}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[131] w-[92vw] max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Resumen antes de crear</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Verifica la información antes de confirmar el alta del activo.</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Nombre</p>
                    <p className="font-semibold">{formData.name}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Categoría</p>
                    <p className="font-semibold">{selectedCategory?.nombre || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Custodio</p>
                    <p className="font-semibold">{users.find((u) => String(u.id) === String(formData.custodianId))?.nombre_completo || 'Sin custodio'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Ubicación</p>
                    <p className="font-semibold">
                      {isMobile
                        ? 'Activo móvil (sin ubicación fija)'
                        : formData.locationType === 'office'
                          ? (offices.find((o) => String(o.id) === String(formData.officeId))?.nombre || 'Sin oficina')
                          : (shelves.find((s) => String(s.id) === String(formData.shelfId))?.nombre || 'Sin estante')}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Costo</p>
                    <p className="font-semibold">${Number(formData.costoAdquisicion || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Características</p>
                    <p className="font-semibold">{Object.keys(pendingPayload.especificaciones || {}).length} registradas</p>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSummary(false)}
                    className="flex-1 px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                  >
                    Revisar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowSummary(false);
                      await executeSave(pendingPayload);
                    }}
                    className="flex-1 px-5 py-3 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-black font-semibold"
                  >
                    Confirmar Creación
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
