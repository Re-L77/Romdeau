import { motion } from "motion/react";
import { Sun, Moon, LogOut } from "lucide-react";
import { currentUser } from "../../data/userData";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";

interface FloatingHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

export function FloatingHeader({
  onSettingsClick,
  onLogout,
}: FloatingHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-6 left-6 lg:left-80 right-6 z-50 flex items-center gap-4 pointer-events-none"
    >
      <div className="flex-1" />

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSettingsClick}
        className={`pointer-events-auto w-14 h-14 rounded-full ${!user?.foto_perfil_url ? "bg-gradient-to-br " + currentUser.avatarColor : "bg-white dark:bg-[#1a1a1a]"} shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-center text-white font-semibold cursor-pointer overflow-hidden`}
      >
        {user?.foto_perfil_url ? (
          <img
            src={user.foto_perfil_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : user?.nombres ? (
          user.nombres.charAt(0).toUpperCase()
        ) : (
          currentUser.initials
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
