import { memo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import { DepreciationProjectionItemDto } from '../../../hooks/useAnalytics';

interface Props {
  data: DepreciationProjectionItemDto[];
}

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function ProjTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-white text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-rose-300">Valor proyectado: {fmt(payload[0].value)}</p>
    </div>
  );
}

export const DepreciationProjection = memo(function DepreciationProjection({ data }: Props) {
  if (!data.length) return null;

  const current = data[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Proyección de Depreciación</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Estimación del valor en libros — próximos 6 meses</p>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Valor actual libros</p>
          <p className="text-2xl font-bold dark:text-white tabular-nums">{fmt(current?.valor_proyectado || 0)}</p>
        </div>
        {data.length > 1 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">En 6 meses</p>
            <p className="text-2xl font-bold text-rose-500 tabular-nums">{fmt(data[data.length - 1]?.valor_proyectado || 0)}</p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ProjTooltip />} />
          <Line
            type="monotone"
            dataKey="valor_proyectado"
            stroke="#f43f5e"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#f43f5e', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 7 }}
            strokeDasharray="6 3"
          />
          <ReferenceDot
            x={current?.mes}
            y={current?.valor_proyectado}
            r={6}
            fill="#6366f1"
            stroke="white"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
});
