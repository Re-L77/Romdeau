import { memo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Medal } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { UserPerformanceItemDto } from '../../../hooks/useAnalytics';

interface Props {
  data: UserPerformanceItemDto[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white shadow-xl">
      <p className="font-semibold mb-1 truncate max-w-[180px]">{label}</p>
      <p className="text-indigo-300">{payload[0].value} auditorías totales</p>
    </div>
  );
}

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];

export const UserPerformance = memo(function UserPerformance({ data }: Props) {
  if (!data.length) return null;

  const top5 = data.slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Desempeño por Auditor</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ranking de actividad — todas las auditorías</p>
      </div>

      {/* Top 3 badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {data.slice(0, 3).map((u, i) => (
          <div
            key={u.usuario_id}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 text-center"
          >
            <Medal className={`w-5 h-5 mx-auto mb-1 ${MEDAL_COLORS[i]}`} />
            <p className="text-xs font-bold dark:text-white truncate">{u.nombre.split(' ')[0]}</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {u.total_auditorias}
            </p>
            <div className={`flex items-center justify-center gap-0.5 text-xs ${u.variacion >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {u.variacion >= 0
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />}
              {u.variacion >= 0 ? '+' : ''}{u.variacion}%
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={top5} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="nombre"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
            tickFormatter={(v: string) => v.split(' ')[0]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total_auditorias" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {top5.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
});
