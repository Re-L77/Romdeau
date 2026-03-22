import { motion } from 'motion/react';
import { User, Mail, Lock, Bell, Globe, Shield, Smartphone, Save } from 'lucide-react';
import { useState } from 'react';
import { currentUser } from '../../data/userData';

export function AccountSettings() {
  const [settings, setSettings] = useState({
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    language: 'es',
    timezone: 'America/Mexico_City',
    emailNotifications: true,
    warrantyAlerts: true,
    auditReminders: true,
    twoFactorEnabled: false,
  });

  const handleSave = () => {
    // Save settings logic
    alert('Configuración guardada exitosamente');
  };

  return (
    <main className="pl-6 lg:pl-80 pt-24 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Configuración de Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu perfil y preferencias del sistema</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-white">Información Personal</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Actualiza tu información de perfil</p>
              </div>
            </div>

            <div className="flex items-center gap-8 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                AU
              </div>
              <div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-2"
                >
                  Cambiar Foto
                </motion.button>
                <p className="text-xs text-gray-500 dark:text-gray-500">JPG, PNG o GIF (máx. 2MB)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full pl-14 pr-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{settings.role}</span>
                  <span className="ml-auto px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-white">Seguridad</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona tu contraseña y autenticación</p>
              </div>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-black dark:hover:border-white transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cambiar Contraseña</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza tu contraseña regularmente</p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </motion.button>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Autenticación de Dos Factores</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Seguridad adicional para tu cuenta</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorEnabled}
                      onChange={(e) => setSettings({ ...settings, twoFactorEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-gray-900 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white peer-checked:after:bg-white dark:peer-checked:after:bg-black"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-white">Preferencias</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Personaliza tu experiencia</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-all"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zona Horaria
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-all"
                >
                  <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-white">Notificaciones</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configura tus alertas y recordatorios</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Notificaciones por Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recibe actualizaciones en tu correo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-gray-900 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white peer-checked:after:bg-white dark:peer-checked:after:bg-black"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Alertas de Garantías</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notificar 30 días antes de vencimiento</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.warrantyAlerts}
                    onChange={(e) => setSettings({ ...settings, warrantyAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-gray-900 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white peer-checked:after:bg-white dark:peer-checked:after:bg-black"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Recordatorios de Auditorías</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notificar auditorías programadas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auditReminders}
                    onChange={(e) => setSettings({ ...settings, auditReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-gray-900 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white peer-checked:after:bg-white dark:peer-checked:after:bg-black"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" />
            Guardar Configuración
          </motion.button>
        </div>
      </div>
    </main>
  );
}