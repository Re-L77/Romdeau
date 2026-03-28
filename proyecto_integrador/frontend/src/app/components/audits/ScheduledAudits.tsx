import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, X, MapPin, User, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/api';

// ─── DTO (mirrors backend AuditoriaProgramadaDto) ───────────────────────────
interface AuditoriaProgramadaDto {
  id: string;
  titulo: string;
  usuario: string;
  fechaProgramada: string | Date;
  ubicacion: string;
  estado: string;
  estadoId: number;
}

// ─── Estado colors / icons ────────────────────────────────────────────────────
function getEstadoStyle(estadoId: number): {
  dot: string;
  badge: string;
  text: string;
  Icon: React.ElementType;
} {
  // estadoId 1 = Pendiente, 2 = En proceso, 3 = Completada (adjust if DB differs)
  switch (estadoId) {
    case 2:
      return {
        dot: 'bg-blue-500',
        badge: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300',
        text: 'text-blue-600 dark:text-blue-400',
        Icon: Loader2,
      };
    case 3:
      return {
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
        text: 'text-emerald-600 dark:text-emerald-400',
        Icon: CheckCircle,
      };
    default: // 1 = Pendiente
      return {
        dot: 'bg-amber-400',
        badge: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300',
        text: 'text-amber-600 dark:text-amber-400',
        Icon: Clock,
      };
  }
}

// ─── Audit Item ───────────────────────────────────────────────────────────────
function AuditItem({ audit, index }: { audit: AuditoriaProgramadaDto; index: number }) {
  const style = getEstadoStyle(audit.estadoId);
  const { Icon } = style;

  const formattedDate = new Date(audit.fechaProgramada).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200"
    >
      {/* Header: título + badge de estado */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
          {audit.titulo}
        </p>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${style.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {audit.estado}
        </span>
      </div>

      {/* Detalles */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{audit.usuario}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
          <span className="truncate">{audit.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${style.text}`} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function ScheduledAuditsDrawer({ onClose }: { onClose: () => void }) {
  const [audits, setAudits] = useState<AuditoriaProgramadaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<AuditoriaProgramadaDto[]>('/api/dashboard/auditorias-programadas');
      setAudits(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar auditorías programadas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        key="drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] lg:w-[38%] max-w-[520px] bg-white dark:bg-[#131313] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Auditorías Programadas
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {loading ? 'Cargando...' : `${audits.length} auditorías`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body – scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <p className="text-sm">Cargando auditorías...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchAudits}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <CalendarDays className="w-10 h-10 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay auditorías programadas.
              </p>
            </div>
          ) : (
            audits.map((audit, i) => (
              <AuditItem key={audit.id} audit={audit} index={i} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> En proceso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completada
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────
export function ScheduledAudits() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Auditorías Programadas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Revisa el calendario de auditorías asignadas
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-sm hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 flex-shrink-0"
        >
          <CalendarDays className="w-4 h-4" />
          Ver auditorías programadas
        </button>
      </motion.div>

      <AnimatePresence>
        {open && <ScheduledAuditsDrawer onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
