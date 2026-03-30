import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Phone, Building2, Shield, FileText, PhoneCall, MapPin, Calendar, Package, AlertTriangle, CheckCircle2, Clock, Edit2, PowerOff, Power, AlertOctagon, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AgregarProveedor, ProveedorFormData } from './AgregarProveedor';

interface ProveedorDetailProps {
  proveedorId: string;
  onBack: () => void;
}

interface Proveedor {
  id: string;
  razon_social: string;
  rfc_tax_id?: string | null;
  contacto_soporte?: string | null;
  direccion_fiscal?: string | null;
  sitio_web?: string | null;
  is_active?: boolean | null;
  datos_financieros?: Array<{
    costo_adquisicion: string | number;
    valor_libro_actual: string | number;
    fecha_compra: string;
    fin_garantia: string | null;
  }>;
}

export function ProveedorDetail({ proveedorId, onBack }: ProveedorDetailProps) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmBaja, setShowConfirmBaja] = useState(false);
  const [showConfirmActivar, setShowConfirmActivar] = useState(false);

  // Cargar proveedor desde el backend
  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/proveedores/${proveedorId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProveedor(data);
        setIsActive(data.is_active !== false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el proveedor');
        console.error('Error fetching proveedor:', err);
      } finally {
        setLoading(false);
      }
    };

    if (proveedorId) {
      fetchProveedor();
    }
  }, [proveedorId]);

  if (loading) {
    return (
      <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando proveedor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !proveedor) {
    return (
      <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Proveedores</span>
          </motion.button>
          <p className="text-red-600 dark:text-red-400">{error || 'Proveedor no encontrado'}</p>
        </div>
      </main>
    );
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getLogo = (nombre: string) => nombre.substring(0, 2).toUpperCase();

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Proveedores</span>
          </motion.button>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {getLogo(proveedor.razon_social)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold dark:text-white">{proveedor.razon_social}</h1>
                {proveedor.is_active === false && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-500/30 tracking-wide">
                    INACTIVO
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 font-mono">RFC: {proveedor.rfc_tax_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Información de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Email de Contacto</p>
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{proveedor.contacto_soporte || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Sitio Web</p>
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    {proveedor.sitio_web ? (
                      <a href={`https://${proveedor.sitio_web}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline truncate">
                        {proveedor.sitio_web}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">N/A</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Dirección Fiscal</p>
                  <div className="flex items-start gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-900 dark:text-white">{proveedor.direccion_fiscal || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial Data */}
            {proveedor.datos_financieros && proveedor.datos_financieros.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
              >
                <h2 className="text-xl font-bold mb-6 dark:text-white">Información Financiera</h2>
                <div className="space-y-4">
                  {proveedor.datos_financieros.map((dato, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Costo de Adquisición</p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white font-bold">₴ {dato.costo_adquisicion}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Valor Actual</p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white font-bold">₴ {dato.valor_libro_actual}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Fecha de Compra</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatDate(dato.fecha_compra)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Fin de Garantía</p>
                          <p className="text-sm text-gray-900 dark:text-white">{dato.fin_garantia ? formatDate(dato.fin_garantia) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Estado del Proveedor</h2>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                {proveedor.is_active ? (
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Proveedor Activo</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 bg-red-500 dark:bg-red-400 rounded-full"></div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Proveedor Inactivo</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <h2 className="text-xl font-bold mb-6 dark:text-white">Acciones</h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Proveedor
                </motion.button>

                {/* Dar de Baja / Activar */}
                {isActive ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmBaja(true)}
                    className="w-full px-6 py-4 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full font-medium hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <PowerOff className="w-4 h-4" />
                    Dar de Baja
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmActivar(true)}
                    className="w-full px-6 py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Power className="w-4 h-4" />
                    Activar Proveedor
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Provider Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
            >
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">UUID del Proveedor</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                {proveedor.id}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal Confirmar Dar de Baja */}
      <AnimatePresence>
        {showConfirmBaja && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertOctagon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2 dark:text-white">¿Dar de baja a este proveedor?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                Estás por dar de baja a <span className="font-semibold text-gray-900 dark:text-white">{proveedor.razon_social}</span>.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-8">
                El proveedor quedará inactivo pero sus datos no se eliminarán. Podrás reactivarlo en cualquier momento.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmBaja(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsActive(false); setShowConfirmBaja(false); }}
                  className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-500 text-white rounded-full font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PowerOff className="w-4 h-4" />
                  Sí, dar de baja
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Activar */}
      <AnimatePresence>
        {showConfirmActivar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Power className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2 dark:text-white">¿Reactivar este proveedor?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
                <span className="font-semibold text-gray-900 dark:text-white">{proveedor.razon_social}</span> volverá a estar activo en el directorio.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmActivar(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsActive(true); setShowConfirmActivar(false); }}
                  className="flex-1 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  Sí, activar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar Proveedor */}
      {isEditing && (
        <AgregarProveedor
          onClose={() => setIsEditing(false)}
          onSave={(updated: ProveedorFormData) => {
            console.log('Proveedor actualizado:', updated);
            setIsEditing(false);
          }}
          initialData={{
            nombre_empresa: proveedor.razon_social,
            razon_social: proveedor.razon_social,
            rfc: proveedor.rfc_tax_id || '',
            email: proveedor.contacto_soporte || '',
            sitio_web: proveedor.sitio_web || '',
          }}
        />
      )}
    </main>
  );
}
