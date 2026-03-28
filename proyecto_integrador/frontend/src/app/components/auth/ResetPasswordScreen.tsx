import { motion } from "motion/react";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { authApi } from "../../../services/api";
import iconSrc from "../../../../assets/icon.png";

interface ResetPasswordScreenProps {
  refreshToken: string | null;
  initialError?: string | null;
  onBackToLogin: () => void;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;

export function ResetPasswordScreen({
  refreshToken,
  initialError = null,
  onBackToLogin,
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const validatePassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) {
      return "Debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!refreshToken) {
      setError("El enlace de recuperación es inválido o está incompleto.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(password, refreshToken);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.8)] p-12">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img
                src={iconSrc}
                alt="Romdeau Icon"
                className="w-20 h-20 object-contain dark:invert"
              />
            </div>
            <h1 className="text-3xl font-bold mb-3 dark:text-white">
              Crear nueva contraseña
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ingresa y confirma tu nueva contraseña para recuperar el acceso.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Contraseña actualizada exitosamente. Ya puedes iniciar sesión.
              </p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Requisitos: 8+ caracteres, mayúscula, minúscula, número y
                símbolo.
              </p>

              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
              </motion.button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full mt-2 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors shadow-lg"
            >
              Ir a iniciar sesión
            </button>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
