import { memo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingDown, RotateCcw, ChevronRight } from 'lucide-react';
import { CriticalAssetsDto } from '../../../hooks/useAnalytics';

interface Props {
  data: CriticalAssetsDto | null;
}

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

type Tab = 'alto_valor' | 'sin_auditoria' | 'alta_rotacion';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'alto_valor',      label: 'Alto Valor',       icon: TrendingDown,   color: '#6366f1' },
  { id: 'sin_auditoria',   label: 'Sin Auditoría',    icon: AlertTriangle,  color: '#f59e0b' },
  { id: 'alta_rotacion',   label: 'Alta Rotación',    icon: RotateCcw,      color: '#ef4444' },
];

export const CriticalAssets = memo(function CriticalAssets({ data }: Props) {
  const [tab, setTab] = useState<Tab>('alto_valor');
  if (!data) return null;

  const rows =
    tab === 'alto_valor'
      ? data.alto_valor
      : tab === 'sin_auditoria'
        ? data.sin_auditoria_reciente
        : data.alta_rotacion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-5">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Activos Críticos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Detección automática de riesgos</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={tab === id ? { backgroundColor: color + '22', color } : {}}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${tab === id
                ? 'ring-1 ring-current'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">Sin activos en esta categoría</p>
        )}
        {rows.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">#{i + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold dark:text-white truncate">{asset.nombre}</p>
                {asset.codigo_etiqueta && (
                  <p className="text-xs text-gray-400">{asset.codigo_etiqueta}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {asset.valor !== undefined && (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{fmt(asset.valor)}</span>
              )}
              {asset.dias_sin_auditoria !== undefined && asset.dias_sin_auditoria < 9999 && (
                <span className="text-xs font-bold text-amber-500">{asset.dias_sin_auditoria}d</span>
              )}
              {asset.dias_sin_auditoria === 9999 && (
                <span className="text-xs font-bold text-red-500">Nunca</span>
              )}
              {asset.total_movimientos !== undefined && (
                <span className="text-xs font-bold text-red-500">{asset.total_movimientos} mov.</span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
