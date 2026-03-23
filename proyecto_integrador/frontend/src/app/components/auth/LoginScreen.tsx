import { motion } from "motion/react";
import { Lock, Mail, AlertCircle, Loader, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { getErrorMessage } from "../../../utils/errors";
import { authApi } from "../../../services/api";
import iconSrc from "../../../../assets/icon.png";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("124051537@upq.edu.mx");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, errorType, clearError } = useAuth();
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResetError(null);

    if (isForgotPassword) {
      setResetLoading(true);
      try {
        await authApi.forgotPassword(email);
        setResetSuccess(true);
      } catch (err: any) {
        setResetError(err.message || "Error al solicitar restablecimiento de contraseña");
      } finally {
        setResetLoading(false);
      }
      return;
    }

    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const displayError = error || (errorType ? getErrorMessage(errorType) : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.8)] p-12">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center mx-auto mb-6"
            >
              <img
                src={iconSrc}
                alt="Romdeau Icon"
                className="w-20 h-20 object-contain dark:invert"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-3 dark:text-white"
            >
              {isForgotPassword ? "Restablecer Contraseña" : "Romdeau"}
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isForgotPassword
                ? "Ingresa tu correo para recibir instrucciones."
                : "Enterprise Asset Management"}
            </p>
          </div>

          {!isForgotPassword && displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {displayError}
              </p>
            </motion.div>
          )}

          {isForgotPassword && resetError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {resetError}
              </p>
            </motion.div>
          )}

          {isForgotPassword && resetSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Si tu correo está registrado, recibirás un enlace de recuperación.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="admin@romdeau.com"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || resetLoading}
                    required
                  />
                </div>
              </div>
            )}

            {!isForgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: (isLoading || resetLoading) ? 1 : 1.02 }}
              whileTap={{ scale: (isLoading || resetLoading) ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading || resetLoading || resetSuccess}
              className="w-full mt-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isLoading || resetLoading) && <Loader className="w-5 h-5 animate-spin" />}
              {isForgotPassword
                ? resetLoading ? "Enviando..." : resetSuccess ? "Enviado" : "Enviar enlace"
                : isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </motion.button>
            
            {isForgotPassword && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSuccess(false);
                    setResetError(null);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </form>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 text-sm mt-6"
        >
          Enterprise-grade asset tracking and audit management
        </motion.p>
      </motion.div>
    </div>
  );
}
