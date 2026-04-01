import { motion } from 'motion/react';
import { X, Save, Package, MapPin, User, DollarSign, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';

interface CreateEditAssetProps {
  assetId?: string;
  onClose: () => void;
  onSave: () => void;
}

export function CreateEditAsset({ assetId, onClose, onSave }: CreateEditAssetProps) {
  const isEditing = !!assetId;
  const [formData, setFormData] = useState({
    name: isEditing ? 'MacBook Pro 16" M3' : '',
    category: isEditing ? 'Computing' : '',
    serialNumber: isEditing ? 'C02ZK3YJMD6R' : '',
    location: isEditing ? 'Oficina Central - Piso 3' : '',
    exactLocation: isEditing ? 'Desk 3B-14' : '',
    custodian: isEditing ? 'Carlos Mendoza' : '',
    purchaseDate: isEditing ? '2024-01-15' : '',
    purchasePrice: isEditing ? '3499' : '',
    warrantyExpiration: isEditing ? '2027-01-15' : '',
    supplier: isEditing ? 'Apple Inc.' : '',
    condition: isEditing ? 'Excellent' : '',
    // JSONB specs
    processor: isEditing ? 'Apple M3 Max' : '',
    ram: isEditing ? '32GB Unified Memory' : '',
    storage: isEditing ? '1TB SSD' : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] mx-2 md:mx-0 overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 md:p-8 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              {isEditing ? 'Editar Activo' : 'Crear Nuevo Activo'}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isEditing ? `ID: ${assetId}` : 'Complete la información del activo'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 md:w-10 md:h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 dark:text-white" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base md:text-lg font-bold dark:text-white">Información Básica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Activo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 md:px-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                  placeholder="Ej: MacBook Pro 16"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-black appearance-none"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Computing">Computing</option>
                  <option value="Servers">Servers & Infrastructure</option>
                  <option value="Printing">Printing</option>
                  <option value="Networking">Networking</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-black transition-all"
                  placeholder="Ej: C02ZK3YJMD6R"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Custody */}
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base md:text-lg font-bold dark:text-white">Ubicación y Custodia</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación General
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 md:px-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                  placeholder="Ej: Oficina Central - Piso 3"
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación Exacta
                </label>
                <input
                  type="text"
                  value={formData.exactLocation}
                  onChange={(e) => setFormData({ ...formData, exactLocation: e.target.value })}
                  className="w-full px-3 md:px-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                  placeholder="Ej: Desk 3B-14"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custodio
                </label>
                <div className="relative">
                  <User className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.custodian}
                    onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                    className="w-full pl-9 md:pl-14 pr-3 md:pr-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                    placeholder="Nombre del custodio"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base md:text-lg font-bold dark:text-white">Información Financiera</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Compra
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full pl-9 md:pl-14 pr-3 md:pr-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio de Compra (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full pl-7 md:pl-10 pr-3 md:pr-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vencimiento de Garantía
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.warrantyExpiration}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
                    className="w-full pl-9 md:pl-14 pr-3 md:pr-5 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg md:rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-black transition-all"
                  placeholder="Ej: Apple Inc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications (JSONB) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-bold">Especificaciones Técnicas (JSONB)</h3>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-4">
              <p className="text-sm text-blue-900">
                Estos campos son dinámicos y se almacenan en formato JSONB. Puede agregar más especificaciones según el tipo de activo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procesador
                </label>
                <input
                  type="text"
                  value={formData.processor}
                  onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-black transition-all"
                  placeholder="Ej: Apple M3 Max"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RAM
                </label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-black transition-all"
                  placeholder="Ej: 32GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Almacenamiento
                </label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-black transition-all"
                  placeholder="Ej: 1TB SSD"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-800">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 md:px-6 py-2 md:py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg md:rounded-full font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full sm:flex-1 px-4 md:px-6 py-2 md:py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg md:rounded-full font-semibold hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" />
              {isEditing ? 'Guardar Cambios' : 'Crear Activo'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
