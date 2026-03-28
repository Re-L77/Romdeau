import { memo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import { CostByDepartmentItemDto } from '../../../hooks/useAnalytics';

interface Props {
  data: CostByDepartmentItemDto[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#ec4899', '#14b8a6', '#f59e0b'];

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: CostByDepartmentItemDto = payload[0]?.payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white shadow-xl space-y-1">
      <p className="font-semibold">{label}</p>
      <p className="text-indigo-300">Costo original: {fmt(d.costo_total)}</p>
      <p className="text-emerald-300">Valor actual: {fmt(d.valor_actual)}</p>
      <p className="text-gray-400">{d.activos_count} activos</p>
    </div>
  );
}

export const CostByDepartment = memo(function CostByDepartment({ data }: Props) {
  if (!data.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1 dark:text-white">Costo por Departamento</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Valor de inversión y libros por área</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 8, bottom: 0 }}>
          <XAxis
            type="number"
            tickFormatter={fmt}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="departamento"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="costo_total" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList
              dataKey="costo_total"
              position="right"
              formatter={fmt}
              style={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
});
