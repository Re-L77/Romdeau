import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Building2, Shield, CheckCircle, AlertCircle, Camera, Upload, Key, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CrearUsuarioProps {
  onClose: () => void;
  onSave: (usuarioData: UsuarioFormData) => void;
}

export interface UsuarioFormData {
  nombre_completo: string;
  email: string;
  telefono: string;
  departamento: string;
  puesto: string;
  rol: 'ADMIN' | 'AUDITOR' | 'GESTOR_ACTIVOS' | 'CONSULTOR';
  campus?: string;
  edificio?: string;
  permisos: string[];
  enviar_email_bienvenida: boolean;
  generar_password_temporal: boolean;
  password_temporal?: string;
  notas?: string;
}

const rolesOptions = [
  { 
    value: 'ADMIN', 
    label: 'Administrador del Sistema',
    icon: '👑',
    color: 'from-purple-400 to-purple-600',
    description: 'Acceso total al sistema',
    permisos: [
      'Crear y eliminar usuarios',
      'Modificar roles y permisos',
      'Acceso a todos los activos',
      'Gestión de auditorías',
      'Configuración del sistema',
      'Exportar reportes',
      'Gestión de proveedores',
      'Acceso a análisis financiero'
    ]
  },
  { 
    value: 'AUDITOR', 
    label: 'Auditor de Campo',
    icon: '📋',
    color: 'from-blue-400 to-blue-600',
    description: 'Ejecuta auditorías QR',
    permisos: [
      'Escanear códigos QR',
      'Reportar estado de activos',
      'Tomar fotografías',
      'Registrar ubicación GPS',
      'Agregar comentarios',
      'Ver activos asignados'
    ]
  },
  { 
    value: 'GESTOR_ACTIVOS', 
    label: 'Gestor de Activos',
    icon: '📦',
    color: 'from-emerald-400 to-emerald-600',
    description: 'Administra inventario',
    permisos: [
      'Crear y editar activos',
      'Gestionar ubicaciones',
      'Asignar activos a ubicaciones',
      'Ver garantías',
      'Exportar reportes de inventario',
      'Gestionar proveedores'
    ]
  },
  { 
    value: 'CONSULTOR', 
    label: 'Consultor',
    icon: '👁️',
    color: 'from-gray-400 to-gray-600',
    description: 'Solo lectura',
    permisos: [
      'Ver activos',
      'Ver auditorías',
      'Ver reportes',
      'Exportar datos (solo lectura)'
    ]
  }
];

const departamentosOptions = [
  'Tecnología',
  'Recursos Humanos',
  'Contabilidad',
  'Operaciones',
  'Administración',
  'Auditoría Interna',
  'Compras',
  'Finanzas',
  'Legal',
  'Otro'
];

export function CrearUsuario({ onClose, onSave }: CrearUsuarioProps) {
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombre_completo: '',
    email: '',
    telefono: '',
    departamento: '',
    puesto: '',
    rol: 'CONSULTOR',
    campus: '',
    edificio: '',
    permisos: rolesOptions[3].permisos, // Permisos de CONSULTOR por defecto
    enviar_email_bienvenida: true,
    generar_password_temporal: true,
    password_temporal: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPermissions, setShowPermissions] = useState(false);

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

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone: string) => {
    const phonePattern = /^\+?52?\s?\d{10}$/;
    return phonePattern.test(phone.replace(/\s|-/g, ''));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (formato: +52 5512345678 o 5512345678)';
    }

    if (!formData.departamento) {
      newErrors.departamento = 'Selecciona un departamento';
    }

    if (!formData.puesto.trim()) {
      newErrors.puesto = 'El puesto es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.rol) {
      newErrors.rol = 'Selecciona un rol';
    }

    if (!formData.generar_password_temporal && !formData.password_temporal) {
      newErrors.password_temporal = 'Ingresa una contraseña o activa generación automática';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep2()) {
      // Si se debe generar contraseña temporal, generarla ahora
      const finalData = { ...formData };
      if (formData.generar_password_temporal) {
        finalData.password_temporal = generatePassword();
      }
      onSave(finalData);
    }
  };

  const updateField = (field: keyof UsuarioFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleRolChange = (rol: 'ADMIN' | 'AUDITOR' | 'GESTOR_ACTIVOS' | 'CONSULTOR') => {
    const selectedRole = rolesOptions.find(r => r.value === rol);
    updateField('rol', rol);
    updateField('permisos', selectedRole?.permisos || []);
  };

  const steps = [
    { number: 1, title: 'Datos Personales', icon: User },
    { number: 2, title: 'Rol y Permisos', icon: Shield },
  ];

  const selectedRoleData = rolesOptions.find(r => r.value === formData.rol);

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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold dark:text-white">Invitar Nuevo Usuario</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Completa la información para crear una nueva cuenta de usuario
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 dark:text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : isActive 
                            ? 'bg-black dark:bg-white border-black dark:border-white' 
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${
                            isActive 
                              ? 'text-white dark:text-black' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        )}
                      </div>
                      <p className={`text-[10px] mt-1 font-medium ${
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
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-4 space-y-3">
              {/* Step 1: Datos Personales */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Avatar Placeholder */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                        <User className="w-8 h-8" />
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Camera className="w-3 h-3 text-white dark:text-black" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Nombre Completo */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <User className="w-3 h-3 inline mr-1" />
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre_completo}
                        onChange={(e) => updateField('nombre_completo', e.target.value)}
                        placeholder="Ej: Carlos Mendoza García"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.nombre_completo 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.nombre_completo && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.nombre_completo}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Mail className="w-3 h-3 inline mr-1" />
                        Email Corporativo *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="carlos.mendoza@empresa.com"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Phone className="w-3 h-3 inline mr-1" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => updateField('telefono', e.target.value)}
                        placeholder="+52 55 1234 5678"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.telefono 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.telefono && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.telefono}
                        </p>
                      )}
                    </div>

                    {/* Departamento */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Building2 className="w-3 h-3 inline mr-1" />
                        Departamento *
                      </label>
                      <select
                        value={formData.departamento}
                        onChange={(e) => updateField('departamento', e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.departamento 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      >
                        <option value="">Selecciona un departamento</option>
                        {departamentosOptions.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.departamento && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.departamento}
                        </p>
                      )}
                    </div>

                    {/* Puesto */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Puesto / Cargo *
                      </label>
                      <input
                        type="text"
                        value={formData.puesto}
                        onChange={(e) => updateField('puesto', e.target.value)}
                        placeholder="Ej: Gerente de TI"
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${
                          errors.puesto 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                      />
                      {errors.puesto && (
                        <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.puesto}
                        </p>
                      )}
                    </div>

                    {/* Campus (Opcional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Campus (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.campus}
                        onChange={(e) => updateField('campus', e.target.value)}
                        placeholder="Ej: Campus Central"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>

                    {/* Edificio (Opcional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Edificio (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.edificio}
                        onChange={(e) => updateField('edificio', e.target.value)}
                        placeholder="Ej: Edificio Administrativo A"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Rol y Permisos */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Selección de Rol */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Rol del Usuario *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {rolesOptions.map(option => {
                        const isSelected = formData.rol === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleRolChange(option.value as any)}
                            className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center text-lg`}>
                                {option.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{option.label}</p>
                                <p className={`text-[10px] truncate ${
                                  isSelected 
                                    ? 'text-white/80 dark:text-black/80' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {option.description}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.rol && (
                      <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {errors.rol}
                      </p>
                    )}
                  </div>

                  {/* Permisos del Rol */}
                  {selectedRoleData && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => setShowPermissions(!showPermissions)}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Permisos incluidos ({formData.permisos.length})
                        </h4>
                        <motion.div
                          animate={{ rotate: showPermissions ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                      </button>
                      {showPermissions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          {formData.permisos.map((permiso, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              <span>{permiso}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Configuración de Contraseña */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-700/30">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Configuración de Contraseña
                    </h4>
                    
                    {/* Generar contraseña automática */}
                    <label className="flex items-center justify-between p-3 rounded-xl border-2 border-blue-200 dark:border-blue-700/30 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          formData.generar_password_temporal 
                            ? 'bg-black dark:bg-white border-black dark:border-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {formData.generar_password_temporal && (
                            <CheckCircle className="w-4 h-4 text-white dark:text-black" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Generar contraseña temporal automática</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">El usuario deberá cambiarla en su primer inicio de sesión</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.generar_password_temporal}
                        onChange={(e) => {
                          updateField('generar_password_temporal', e.target.checked);
                          if (e.target.checked) {
                            updateField('password_temporal', '');
                          }
                        }}
                        className="sr-only"
                      />
                    </label>

                    {/* Contraseña manual */}
                    {!formData.generar_password_temporal && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contraseña Temporal *
                        </label>
                        <input
                          type="text"
                          value={formData.password_temporal}
                          onChange={(e) => updateField('password_temporal', e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.password_temporal 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                        />
                        {errors.password_temporal && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.password_temporal}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enviar email de bienvenida */}
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        formData.enviar_email_bienvenida 
                          ? 'bg-black dark:bg-white border-black dark:border-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.enviar_email_bienvenida && (
                          <CheckCircle className="w-4 h-4 text-white dark:text-black" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Enviar email de bienvenida</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Incluye credenciales de acceso y enlace de activación
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enviar_email_bienvenida}
                      onChange={(e) => updateField('enviar_email_bienvenida', e.target.checked)}
                      className="sr-only"
                    />
                  </label>

                  {/* Notas adicionales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => updateField('notas', e.target.value)}
                      placeholder="Información adicional sobre el usuario, accesos especiales, etc..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Paso {currentStep} de 2
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
                {currentStep < 2 ? (
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
                    Crear Usuario
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