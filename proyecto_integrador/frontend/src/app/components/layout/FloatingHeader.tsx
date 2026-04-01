import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { currentUser } from "../../data/userData";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";

interface FloatingHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Garantía por Vencer",
    message: "MacBook Pro M3 - La garantía vence en 25 días",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Auditoría Completada",
    message: "Auditoría del Piso 3 completada exitosamente",
    time: "Hace 5 horas",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Nueva Asignación",
    message: "Se asignó iPhone 15 Pro a Ana Gutiérrez",
    time: "Hace 1 día",
    read: true,
  },
  {
    id: 4,
    type: "warning",
    title: "Activo Dañado Reportado",
    message: "Impresora HP LaserJet Pro marcada como dañada",
    time: "Hace 2 días",
    read: true,
  },
];

export function FloatingHeader({
  onSettingsClick,
  onLogout,
}: FloatingHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-50";
      case "success":
        return "bg-emerald-50";
      default:
        return "bg-blue-50";
    }
  };

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-4 md:top-6 left-4 lg:left-80 right-4 md:right-6 z-50 flex items-center gap-3 md:gap-4 pointer-events-none"
    >
      <div className="flex-1" />

      <div className="relative max-sm:hidden pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-[#1a1a1a] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-center hover:shadow-lg transition-shadow"
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-5 md:h-5 bg-amber-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {notificationsOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotificationsOpen(false)}
                className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[60]"
              />

              {/* Notifications Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 md:top-16 w-96 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3rem)] bg-white dark:bg-[#1a1a1a] rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.8)] overflow-hidden z-[70]"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">
                      Notificaciones
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadCount} sin leer
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNotificationsOpen(false)}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 dark:text-white" />
                  </motion.button>
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50/30 dark:bg-blue-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`w-10 h-10 rounded-2xl ${getNotificationBg(notification.type)} flex items-center justify-center flex-shrink-0`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <button className="w-full text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                    Ver todas las notificaciones
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSettingsClick}
        className={`pointer-events-auto w-14 h-14 rounded-full ${!user?.foto_perfil_url ? 'bg-gradient-to-br ' + currentUser.avatarColor : 'bg-white dark:bg-[#1a1a1a]'} shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-center text-white font-semibold cursor-pointer overflow-hidden`}
      >
        {user?.foto_perfil_url ? (
          <img src={user.foto_perfil_url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          user?.nombres ? user.nombres.charAt(0).toUpperCase() : currentUser.initials
        )}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="pointer-events-auto w-14 h-14 bg-white dark:bg-[#1a1a1a] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-center hover:shadow-lg transition-shadow"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLogout}
        className="pointer-events-auto h-14 px-5 bg-white dark:bg-[#1a1a1a] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:shadow-lg transition-shadow"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-semibold">Cerrar sesión</span>
      </motion.button>
    </motion.header>
  );
}
