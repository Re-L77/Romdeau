import { memo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { MovementsByMonthItemDto } from '../../../hooks/useAnalytics';

interface Props {
  data: MovementsByMonthItemDto[];
}

function MovTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-white text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-purple-300">{payload[0].value} movimientos</p>
    </div>
  );
}

export const MovementAnalysis = memo(function MovementAnalysis({ data }: Props) {
  if (!data.length) return null;

  const currentMonthIndex = new Date().getMonth();
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Análisis de Movimientos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Traslados de activos — año en curso</p>
      </div>

      {data.every(d => d.cantidad === 0) ? (
        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
          No hay movimientos registrados este año.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="movGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<MovTooltip />} />
            <ReferenceLine x={monthNames[currentMonthIndex]} stroke="#8b5cf6" strokeDasharray="4 4" strokeOpacity={0.7} />
            <Area
              type="monotone"
              dataKey="cantidad"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#movGrad)"
              dot={false}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
});
