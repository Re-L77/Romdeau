import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Mail, Phone, Globe, MapPin, FileText, User, Shield, CheckCircle, AlertCircle, Loader2, ClipboardList, Star } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface AgregarProveedorProps {
  onClose: () => void;
  onSave: (proveedorData: ProveedorFormData) => void;
  initialData?: Partial<ProveedorFormData>;
}

export interface ProveedorFormData {
  nombre_empresa: string;
  rfc: string;
  razon_social: string;
  categoria: string;
  email: string;
  telefono: string;
  telefono_alternativo?: string;
  sitio_web?: string;
  contacto_principal: string;
  puesto_contacto: string;
  direccion_calle: string;
  direccion_colonia: string;
  direccion_ciudad: string;
  direccion_estado: string;
  direccion_cp: string;
  tipo_productos_servicios: string;
  calificacion_inicial: number;
  notas?: string;
  direccion_fiscal?: string;
}

// Helper component: flies the map to a new center whenever it changes
function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);
  return null;
}



const categoriaOptions = [
  { value: 'TECNOLOGIA', label: 'Tecnología y Electrónica', icon: '💻' },
  { value: 'MOBILIARIO', label: 'Mobiliario y Equipo de Oficina', icon: '🪑' },
  { value: 'MANTENIMIENTO', label: 'Servicios de Mantenimiento', icon: '🔧' },
  { value: 'SOFTWARE', label: 'Software y Licencias', icon: '📱' },
  { value: 'CONSTRUCCION', label: 'Construcción y Obra', icon: '🏗️' },
  { value: 'PAPELERIA', label: 'Papelería y Suministros', icon: '📋' },
  { value: 'LIMPIEZA', label: 'Servicios de Limpieza', icon: '🧹' },
  { value: 'SEGURIDAD', label: 'Seguridad y Vigilancia', icon: '🛡️' },
  { value: 'OTROS', label: 'Otros Servicios', icon: '📦' },
];

const estadosMexico = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
  'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas'
];

export function AgregarProveedor({ onClose, onSave, initialData }: AgregarProveedorProps) {
  const isEditMode = Boolean(initialData);
  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre_empresa: '',
    rfc: '',
    razon_social: '',
    categoria: '',
    email: '',
    telefono: '',
    telefono_alternativo: '',
    sitio_web: '',
    contacto_principal: '',
    puesto_contacto: '',
    direccion_calle: '',
    direccion_colonia: '',
    direccion_ciudad: '',
    direccion_estado: '',
    direccion_cp: '',
    tipo_productos_servicios: '',
    calificacion_inicial: 5,
    notas: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpStatus, setCpStatus] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Local CP lookup data
  const [cpData, setCpData] = useState<Record<string, { estado: string; colonias: string[] }> | null>(null);
  const [cpSuggestions, setCpSuggestions] = useState<string[]>([]);
  const [showCpDropdown, setShowCpDropdown] = useState(false);
  const [availableColonias, setAvailableColonias] = useState<string[]>([]);
  const [showColoniaDropdown, setShowColoniaDropdown] = useState(false);
  const coloniaInputRef = useRef<HTMLInputElement>(null);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load compact CP lookup from public/ (once, lazily)
  useEffect(() => {
    fetch('/cp_mexico.json')
      .then(r => r.json())
      .then((data: Record<string, { estado: string; colonias: string[] }>) => setCpData(data))
      .catch(() => {/* fall back to Nominatim only */ });
  }, []);

  // Geocode CP via Nominatim – map coordinates + ciudad.
  // Fallback: try district CP (floor to nearest 1000) when exact CP isn't in OSM.
  // e.g. 87135 → Nominatim has no data → try 87000 → Ciudad Victoria ✓
  const geocodeCP = useCallback(async (cp: string) => {
    setCpLoading(true);
    setCpStatus('');
    try {
      type NominatimResult = { lat: string; lon: string; address: Record<string, string> };
      const nominatimUrl = (code: string) =>
        `https://nominatim.openstreetmap.org/search?postalcode=${code}&countrycodes=MX&format=json&limit=1&addressdetails=1&accept-language=es`;

      let data: NominatimResult[] = await fetch(nominatimUrl(cp)).then(r => r.json());

      // Fallback: try district CP (e.g. 87135 → 87000)
      if (data.length === 0) {
        const districtCP = String(Math.floor(parseInt(cp, 10) / 1000) * 1000).padStart(5, '0');
        if (districtCP !== cp) {
          data = await fetch(nominatimUrl(districtCP)).then(r => r.json());
        }
      }

      if (data.length > 0) {
        const { lat, lon, address } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        const ciudad = address.city ?? address.town ?? address.county ?? address.municipality ?? '';
        if (ciudad) setFormData(prev => ({ ...prev, direccion_ciudad: ciudad }));
      }
    } catch { /* silent */ }
    finally { setCpLoading(false); }
  }, []);

  // Handle CP field changes: show suggestions dropdown + auto-fill from local JSON
  const handleCpChange = useCallback((raw: string) => {
    const cp = raw.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, direccion_cp: cp }));
    setErrors(prev => ({ ...prev, direccion_cp: '' }));

    if (!cpData || cp.length < 2) {
      setCpSuggestions([]);
      setShowCpDropdown(false);
      return;
    }

    const matches = Object.keys(cpData).filter(k => k.startsWith(cp)).slice(0, 10);
    setCpSuggestions(matches);
    setShowCpDropdown(matches.length > 0 && cp.length < 5);

    if (cp.length === 5 && cpData[cp]) {
      applyCP(cp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpData]);

  // Apply a selected CP: fill estado + colonias from local JSON, map via Nominatim
  const applyCP = useCallback((cp: string) => {
    if (!cpData) return;
    const entry = cpData[cp];
    if (entry) {
      setFormData(prev => ({
        ...prev,
        direccion_cp: cp,
        direccion_colonia: '',
        direccion_estado: entry.estado || prev.direccion_estado,
      }));
      setAvailableColonias(entry.colonias);
      setCpStatus('✓ Datos completados automáticamente');
      // Auto-focus colonia input so the dropdown opens immediately
      setTimeout(() => coloniaInputRef.current?.focus(), 120);
    } else {
      setCpStatus('C.P. no encontrado en catálogo');
    }
    setShowCpDropdown(false);
    setErrors(prev => ({ ...prev, direccion_cp: '' }));
    geocodeCP(cp);
  }, [cpData, geocodeCP]);

  const validateRFC = (rfc: string) => {
    // RFC puede ser de 12 o 13 caracteres (persona moral o física)
    const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone: string) => {
    // Validar teléfono mexicano (10 dígitos)
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(phone.replace(/\s|-/g, ''));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_empresa.trim()) {
      newErrors.nombre_empresa = 'El nombre de la empresa es obligatorio';
    }

    if (!isEditMode) {
      // Creación: RFC obligatorio y con formato válido
      if (!formData.rfc.trim()) {
        newErrors.rfc = 'El RFC es obligatorio';
      } else if (!validateRFC(formData.rfc)) {
        newErrors.rfc = 'RFC inválido (formato: ABC123456XYZ)';
      }
    } else {
      // Edición: solo valida formato si el usuario escribió algo
      if (formData.rfc.trim() && !validateRFC(formData.rfc)) {
        newErrors.rfc = 'RFC inválido (formato: ABC123456XYZ)';
      }
    }

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    }

    if (!isEditMode && !formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode) {
      // Creación: email obligatorio
      if (!formData.email.trim()) {
        newErrors.email = 'El email es obligatorio';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    } else {
      // Edición: solo valida formato si hay contenido
      if (formData.email.trim() && !validateEmail(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    if (!isEditMode) {
      // Creación: teléfono obligatorio
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es obligatorio';
      } else if (!validatePhone(formData.telefono)) {
        newErrors.telefono = 'Teléfono inválido (10 dígitos)';
      }
    } else {
      // Edición: solo valida formato si hay contenido
      if (formData.telefono.trim() && !validatePhone(formData.telefono)) {
        newErrors.telefono = 'Teléfono inválido (10 dígitos)';
      }
    }

    if (formData.telefono_alternativo && !validatePhone(formData.telefono_alternativo)) {
      newErrors.telefono_alternativo = 'Teléfono alternativo inválido';
    }

    // En edición estos campos no son obligatorios
    if (!isEditMode && !formData.contacto_principal.trim()) {
      newErrors.contacto_principal = 'El nombre del contacto es obligatorio';
    }

    if (!isEditMode && !formData.puesto_contacto.trim()) {
      newErrors.puesto_contacto = 'El puesto del contacto es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode) {
      // En modo creación todos los campos de dirección son obligatorios
      if (!formData.direccion_calle.trim()) {
        newErrors.direccion_calle = 'La calle es obligatoria';
      }
      if (!formData.direccion_ciudad.trim()) {
        newErrors.direccion_ciudad = 'La ciudad es obligatoria';
      }
      if (!formData.direccion_estado) {
        newErrors.direccion_estado = 'El estado es obligatorio';
      }
      if (!formData.direccion_cp.trim()) {
        newErrors.direccion_cp = 'El código postal es obligatorio';
      } else if (!/^\d{5}$/.test(formData.direccion_cp)) {
        newErrors.direccion_cp = 'CP inválido (5 dígitos)';
      }
    } else {
      // En edición: solo validar formato del CP si fue rellenado
      if (formData.direccion_cp.trim() && !/^\d{5}$/.test(formData.direccion_cp)) {
        newErrors.direccion_cp = 'CP inválido (5 dígitos)';
      }
    }

    if (!formData.tipo_productos_servicios.trim()) {
      newErrors.tipo_productos_servicios = 'Describe los productos/servicios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  // Navigate back to any already-completed step by clicking the indicator
  const navigateToStep = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      setErrors({});
    }
  };

  const handleFinalSubmit = async () => {
    const parts = [
      formData.direccion_calle,
      formData.direccion_colonia,
      formData.direccion_ciudad,
      formData.direccion_estado,
    ].filter(Boolean);
    // Si el usuario no tocó los campos individuales pero hay una dirección_fiscal preexistente, conservarla
    const direccion_fiscal = parts.length > 0 ? parts.join(', ') : (formData.direccion_fiscal || '');
    setIsSaving(true);
    try {
      await onSave({ ...formData, direccion_fiscal });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = useCallback((field: keyof ProveedorFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => prev[field] ? { ...prev, [field]: '' } : prev);
  }, []);

  const steps = [
    { number: 1, title: 'Empresa', icon: Building2 },
    { number: 2, title: 'Contacto', icon: User },
    { number: 3, title: 'Dirección', icon: MapPin },
    { number: 4, title: 'Resumen', icon: ClipboardList },
  ];

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
          className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">{isEditMode ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEditMode ? 'Modifica la información del proveedor' : 'Completa la información para registrar un proveedor'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-center max-w-lg mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => navigateToStep(step.number)}
                        disabled={!isCompleted}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                            ? 'bg-emerald-500 border-emerald-500 cursor-pointer hover:bg-emerald-600'
                            : isActive
                              ? 'bg-black dark:bg-white border-black dark:border-white cursor-default'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed'
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-500'
                            }`} />
                        )}
                      </button>
                      <p className={`text-xs mt-1.5 font-medium whitespace-nowrap ${isActive
                          ? 'text-black dark:text-white'
                          : isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-3 mb-5 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="overflow-y-auto max-h-[calc(90vh-300px)]">
            <div className="p-6 space-y-6">
              {/* Step 1: Información de la Empresa */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre Empresa */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Nombre de la Empresa *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre_empresa}
                        onChange={(e) => updateField('nombre_empresa', e.target.value)}
                        placeholder="Ej: Tech Solutions México S.A. de C.V."
                        className={`w-full px-4 py-3 rounded-xl border ${errors.nombre_empresa
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.nombre_empresa && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.nombre_empresa}
                        </p>
                      )}
                    </div>

                    {/* RFC */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Shield className="w-4 h-4 inline mr-1" />
                        RFC *
                      </label>
                      <input
                        type="text"
                        value={formData.rfc}
                        onChange={(e) => updateField('rfc', e.target.value.toUpperCase())}
                        placeholder="ABC123456XYZ"
                        maxLength={13}
                        className={`w-full px-4 py-3 rounded-xl border uppercase ${errors.rfc
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.rfc && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.rfc}
                        </p>
                      )}
                    </div>

                    {/* Razón Social */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Razón Social *
                      </label>
                      <input
                        type="text"
                        value={formData.razon_social}
                        onChange={(e) => updateField('razon_social', e.target.value)}
                        placeholder="Razón social completa"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.razon_social
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.razon_social && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.razon_social}
                        </p>
                      )}
                    </div>

                    {/* Categoría */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoría de Productos/Servicios {isEditMode ? <span className="text-gray-400 font-normal">(Opcional)</span> : '*'}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoriaOptions.map(option => {
                          const isSelected = formData.categoria === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateField('categoria', option.value)}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                              <div className="text-2xl mb-1">{option.icon}</div>
                              <p className="text-xs font-medium">{option.label}</p>
                            </button>
                          );
                        })}
                      </div>
                      {errors.categoria && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.categoria}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Información de Contacto */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Corporativo *
                      </label>
                      <input
                        type="text"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="contacto@empresa.com"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.email
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Sitio Web */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Sitio Web
                      </label>
                      <input
                        type="text"
                        value={formData.sitio_web}
                        onChange={(e) => updateField('sitio_web', e.target.value)}
                        placeholder="www.ejemplo.com (opcional)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Teléfono Principal *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => updateField('telefono', e.target.value)}
                        placeholder="5512345678"
                        maxLength={10}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.telefono
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.telefono && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.telefono}
                        </p>
                      )}
                    </div>

                    {/* Teléfono Alternativo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Teléfono Alternativo
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono_alternativo}
                        onChange={(e) => updateField('telefono_alternativo', e.target.value)}
                        placeholder="5598765432 (opcional)"
                        maxLength={10}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>

                    {/* Contacto Principal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Nombre Contacto Principal *
                      </label>
                      <input
                        type="text"
                        value={formData.contacto_principal}
                        onChange={(e) => updateField('contacto_principal', e.target.value)}
                        placeholder="Juan Pérez González"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.contacto_principal
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.contacto_principal && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.contacto_principal}
                        </p>
                      )}
                    </div>

                    {/* Puesto Contacto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Puesto del Contacto *
                      </label>
                      <input
                        type="text"
                        value={formData.puesto_contacto}
                        onChange={(e) => updateField('puesto_contacto', e.target.value)}
                        placeholder="Gerente de Ventas"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.puesto_contacto
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.puesto_contacto && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.puesto_contacto}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Dirección y Detalles */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Address Fields */}
                    <div className="space-y-3">
                      {/* Código Postal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Código Postal *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.direccion_cp}
                            onChange={(e) => handleCpChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowCpDropdown(false), 150)}
                            placeholder="03100"
                            maxLength={5}
                            autoComplete="off"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.direccion_cp
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent pr-10`}
                          />
                          {cpLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                          )}
                          {showCpDropdown && cpSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                              {cpSuggestions.map(cp => (
                                <button
                                  key={cp}
                                  type="button"
                                  onMouseDown={() => applyCP(cp)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between first:rounded-t-xl last:rounded-b-xl"
                                >
                                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{cp}</span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 truncate ml-2">{cpData?.[cp]?.estado}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {cpStatus && !errors.direccion_cp && (
                          <p className={`text-xs mt-1 ${cpStatus.startsWith('✓') ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {cpStatus}
                          </p>
                        )}
                        {errors.direccion_cp && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.direccion_cp}
                          </p>
                        )}
                      </div>

                      {/* Estado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estado *
                        </label>
                        <select
                          value={formData.direccion_estado}
                          onChange={(e) => updateField('direccion_estado', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.direccion_estado
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                        >
                          <option value="">Selecciona un estado</option>
                          {estadosMexico.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                        {errors.direccion_estado && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.direccion_estado}
                          </p>
                        )}
                      </div>

                      {/* Ciudad */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={formData.direccion_ciudad}
                          onChange={(e) => updateField('direccion_ciudad', e.target.value)}
                          placeholder="Ciudad de México"
                          className={`w-full px-4 py-3 rounded-xl border ${errors.direccion_ciudad
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                        />
                        {errors.direccion_ciudad && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.direccion_ciudad}
                          </p>
                        )}
                      </div>

                      {/* Colonia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Colonia / Localidad
                        </label>
                        <div className="relative">
                          <input
                            ref={coloniaInputRef}
                            type="text"
                            value={formData.direccion_colonia}
                            onChange={(e) => {
                              updateField('direccion_colonia', e.target.value);
                              setShowColoniaDropdown(true);
                            }}
                            onFocus={() => availableColonias.length > 0 && setShowColoniaDropdown(true)}
                            onBlur={() => setTimeout(() => setShowColoniaDropdown(false), 150)}
                            placeholder={availableColonias.length > 0 ? 'Selecciona o escribe una colonia...' : 'Del Valle, Polanco, Santa Fe...'}
                            autoComplete="off"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                          />
                          {showColoniaDropdown && (() => {
                            const q = (formData.direccion_colonia || '').toLowerCase();
                            const filtered = availableColonias.filter(c => c.toLowerCase().includes(q)).slice(0, 12);
                            return filtered.length > 0 ? (
                              <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                                {filtered.map(col => (
                                  <button
                                    key={col}
                                    type="button"
                                    onMouseDown={() => { updateField('direccion_colonia', col); setShowColoniaDropdown(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white first:rounded-t-xl last:rounded-b-xl"
                                  >
                                    {col}
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {/* Calle y Número */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Calle y Número *
                        </label>
                        <input
                          type="text"
                          value={formData.direccion_calle}
                          onChange={(e) => updateField('direccion_calle', e.target.value)}
                          placeholder="Av. Insurgentes Sur 1234"
                          className={`w-full px-4 py-3 rounded-xl border ${errors.direccion_calle
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                        />
                        {errors.direccion_calle && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.direccion_calle}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Right: Map */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Ubicación en el Mapa
                      </label>
                      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-[300px] lg:h-auto lg:flex-1">
                        <MapContainer
                          center={mapCenter ?? [23.6345, -102.5528]}
                          zoom={mapCenter ? 14 : 5}
                          style={{ height: '100%', width: '100%', minHeight: '280px' }}
                          scrollWheelZoom
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          />
                          {mapCenter && (
                            <>
                              <MapFlyTo center={mapCenter} />
                              <CircleMarker
                                center={mapCenter}
                                radius={10}
                                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.5, weight: 2 }}
                              />
                            </>
                          )}
                        </MapContainer>
                      </div>
                      {!mapCenter && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                          Ingresa un C.P. para ver la ubicación en el mapa
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {/* Tipo de Productos/Servicios */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción de Productos/Servicios *
                      </label>
                      <textarea
                        value={formData.tipo_productos_servicios}
                        onChange={(e) => updateField('tipo_productos_servicios', e.target.value)}
                        placeholder="Ej: Venta de equipos de cómputo, laptops, servidores, accesorios..."
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.tipo_productos_servicios
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.tipo_productos_servicios && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.tipo_productos_servicios}
                        </p>
                      )}
                    </div>

                    {/* Calificación Inicial */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Calificación Inicial
                      </label>
                      {/* Estrellas interactivas con medias estrellas */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex gap-1"
                          onMouseLeave={() => setHoverRating(null)}
                        >
                          {Array.from({ length: 10 }).map((_, i) => {
                            const displayVal = hoverRating ?? formData.calificacion_inicial;
                            const fillPct = displayVal >= i + 1 ? 100 : displayVal >= i + 0.5 ? 50 : 0;
                            return (
                              <div
                                key={i}
                                className="relative cursor-pointer select-none"
                                style={{ width: 28, height: 28 }}
                                onMouseMove={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = e.clientX - rect.left;
                                  setHoverRating(x < rect.width / 2 ? i + 0.5 : i + 1);
                                }}
                                onClick={() => updateField('calificacion_inicial', hoverRating ?? formData.calificacion_inicial)}
                              >
                                {/* Estrella vacía (fondo) */}
                                <Star className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                                {/* Estrella rellena (encima, recortada) */}
                                {fillPct > 0 && (
                                  <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${fillPct}%` }}
                                  >
                                    <Star className="w-7 h-7 text-amber-400 fill-amber-400" style={{ minWidth: 28 }} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-amber-400 leading-none">
                            {(hoverRating ?? formData.calificacion_inicial).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">/ 10</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        Haz clic sobre la estrella para asignar la calificación
                      </p>
                    </div>

                    {/* Notas Adicionales */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notas Adicionales
                      </label>
                      <textarea
                        value={formData.notas}
                        onChange={(e) => updateField('notas', e.target.value)}
                        placeholder="Información adicional, condiciones comerciales, observaciones..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Resumen */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Revisa la información antes de registrar al proveedor. Puedes hacer clic en cualquier paso completado para editar.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Empresa */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Empresa</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Nombre</p>
                          <p className="text-sm font-semibold dark:text-white">{formData.nombre_empresa}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">RFC</p>
                            <p className="text-sm font-mono font-semibold dark:text-white">{formData.rfc}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Razón Social</p>
                            <p className="text-sm dark:text-white truncate">{formData.razon_social}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Categoría</p>
                          <p className="text-sm dark:text-white">
                            {categoriaOptions.find(c => c.value === formData.categoria)?.icon}{' '}
                            {categoriaOptions.find(c => c.value === formData.categoria)?.label ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Contacto</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                          <p className="text-sm dark:text-white">{formData.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Teléfono</p>
                            <p className="text-sm dark:text-white">{formData.telefono}</p>
                          </div>
                          {formData.telefono_alternativo && (
                            <div>
                              <p className="text-xs text-gray-400 dark:text-gray-500">Tel. Alternativo</p>
                              <p className="text-sm dark:text-white">{formData.telefono_alternativo}</p>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Contacto Principal</p>
                            <p className="text-sm font-semibold dark:text-white">{formData.contacto_principal}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Puesto</p>
                            <p className="text-sm dark:text-white">{formData.puesto_contacto}</p>
                          </div>
                        </div>
                        {formData.sitio_web && (
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Sitio Web</p>
                            <p className="text-sm text-blue-500 truncate">{formData.sitio_web}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Dirección Fiscal</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Calle y Número</p>
                          <p className="text-sm dark:text-white">{formData.direccion_calle}</p>
                        </div>
                        {formData.direccion_colonia && (
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Colonia</p>
                            <p className="text-sm dark:text-white">{formData.direccion_colonia}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Ciudad</p>
                            <p className="text-sm dark:text-white">{formData.direccion_ciudad}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Estado</p>
                            <p className="text-sm dark:text-white">{formData.direccion_estado}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">C.P.</p>
                          <p className="text-sm font-mono dark:text-white">{formData.direccion_cp}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Detalles</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Productos / Servicios</p>
                          <p className="text-sm dark:text-white">{formData.tipo_productos_servicios}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Calificación Inicial</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 10 }).map((_, i) => {
                                const fillPct = formData.calificacion_inicial >= i + 1 ? 100
                                  : formData.calificacion_inicial >= i + 0.5 ? 50 : 0;
                                return (
                                  <div key={i} className="relative" style={{ width: 14, height: 14 }}>
                                    <Star className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                                    {fillPct > 0 && (
                                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" style={{ minWidth: 14 }} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-sm font-semibold dark:text-white">{formData.calificacion_inicial.toFixed(1)}/10</span>
                          </div>
                        </div>
                        {formData.notas && (
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Notas</p>
                            <p className="text-sm dark:text-white">{formData.notas}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Paso {currentStep} de 4
              </div>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSaving}
                    className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isSaving ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Registrar Proveedor')}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}