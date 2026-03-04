import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Mail, Phone, Globe, MapPin, FileText, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AgregarProveedorProps {
  onClose: () => void;
  onSave: (proveedorData: ProveedorFormData) => void;
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
  direccion_ciudad: string;
  direccion_estado: string;
  direccion_cp: string;
  direccion_pais: string;
  tipo_productos_servicios: string;
  calificacion_inicial: number;
  notas?: string;
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

export function AgregarProveedor({ onClose, onSave }: AgregarProveedorProps) {
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
    direccion_ciudad: '',
    direccion_estado: '',
    direccion_cp: '',
    direccion_pais: 'México',
    tipo_productos_servicios: '',
    calificacion_inicial: 5,
    notas: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

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

    if (!formData.rfc.trim()) {
      newErrors.rfc = 'El RFC es obligatorio';
    } else if (!validateRFC(formData.rfc)) {
      newErrors.rfc = 'RFC inválido (formato: ABC123456XYZ)';
    }

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (10 dígitos)';
    }

    if (formData.telefono_alternativo && !validatePhone(formData.telefono_alternativo)) {
      newErrors.telefono_alternativo = 'Teléfono alternativo inválido';
    }

    if (!formData.contacto_principal.trim()) {
      newErrors.contacto_principal = 'El nombre del contacto es obligatorio';
    }

    if (!formData.puesto_contacto.trim()) {
      newErrors.puesto_contacto = 'El puesto del contacto es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

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
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep3()) {
      onSave(formData);
    }
  };

  const updateField = (field: keyof ProveedorFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const steps = [
    { number: 1, title: 'Información Empresa', icon: Building2 },
    { number: 2, title: 'Contacto', icon: User },
    { number: 3, title: 'Dirección y Detalles', icon: MapPin },
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
          className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Agregar Nuevo Proveedor</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Completa la información para registrar un proveedor
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
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : isActive 
                            ? 'bg-black dark:bg-white border-black dark:border-white' 
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <StepIcon className={`w-5 h-5 ${
                            isActive 
                              ? 'text-white dark:text-black' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        )}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${
                        isActive 
                          ? 'text-black dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${
                        isCompleted 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-280px)]">
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.nombre_empresa 
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
                        className={`w-full px-4 py-3 rounded-xl border uppercase ${
                          errors.rfc 
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.razon_social 
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
                        Categoría de Productos/Servicios *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoriaOptions.map(option => {
                          const isSelected = formData.categoria === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateField('categoria', option.value)}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                isSelected
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
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="contacto@empresa.com"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.email 
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.telefono 
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.telefono_alternativo 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.telefono_alternativo && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.telefono_alternativo}
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
                        type="url"
                        value={formData.sitio_web}
                        onChange={(e) => updateField('sitio_web', e.target.value)}
                        placeholder="https://www.ejemplo.com (opcional)"
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.contacto_principal 
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.puesto_contacto 
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
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Calle y Número */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Calle y Número *
                      </label>
                      <input
                        type="text"
                        value={formData.direccion_calle}
                        onChange={(e) => updateField('direccion_calle', e.target.value)}
                        placeholder="Av. Insurgentes Sur 1234, Col. Del Valle"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.direccion_calle 
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
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.direccion_ciudad 
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

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado *
                      </label>
                      <select
                        value={formData.direccion_estado}
                        onChange={(e) => updateField('direccion_estado', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.direccion_estado 
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

                    {/* Código Postal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        value={formData.direccion_cp}
                        onChange={(e) => updateField('direccion_cp', e.target.value)}
                        placeholder="03100"
                        maxLength={5}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.direccion_cp 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.direccion_cp && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.direccion_cp}
                        </p>
                      )}
                    </div>

                    {/* País */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.direccion_pais}
                        onChange={(e) => updateField('direccion_pais', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>

                    {/* Tipo de Productos/Servicios */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción de Productos/Servicios *
                      </label>
                      <textarea
                        value={formData.tipo_productos_servicios}
                        onChange={(e) => updateField('tipo_productos_servicios', e.target.value)}
                        placeholder="Ej: Venta de equipos de cómputo, laptops, servidores, accesorios..."
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.tipo_productos_servicios 
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Calificación Inicial: {formData.calificacion_inicial}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.calificacion_inicial}
                        onChange={(e) => updateField('calificacion_inicial', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-black dark:accent-white"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Baja</span>
                        <span>Media</span>
                        <span>Alta</span>
                      </div>
                    </div>

                    {/* Notas Adicionales */}
                    <div className="md:col-span-2">
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
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Paso {currentStep} de 3
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
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Registrar Proveedor
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