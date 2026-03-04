import { motion } from 'motion/react';
import { LayoutDashboard, Package, ClipboardCheck, Building2, Users, Settings, Menu, X, FileText, Bell } from 'lucide-react';
import { useState } from 'react';

interface FloatingSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function FloatingSidebar({ activeView, onNavigate }: FloatingSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'auditorias', label: 'Auditorías', icon: ClipboardCheck },
    { id: 'registro-auditorias', label: 'Logs Auditorías', icon: FileText },
    { id: 'alertas', label: 'Alertas y Mant.', icon: Bell },
    { id: 'proveedores', label: 'Proveedores', icon: Building2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
  ];

  const handleNavigation = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-[60] w-14 h-14 bg-white dark:bg-[#1a1a1a] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-center"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
      </motion.button>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed left-6 top-6 bottom-6 w-64 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 z-50 flex flex-col
          max-lg:left-0 max-lg:top-0 max-lg:bottom-0 max-lg:rounded-none max-lg:rounded-r-3xl
          ${mobileMenuOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1 dark:text-white">Romdeau</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Asset Management</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-medium transition-all ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('settings')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-medium transition-all ${
              activeView === 'settings'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Configuración</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}