import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { FinancieroDto, GraficasDto } from "../../../hooks/useDashboard";

interface FinancialWidgetsProps {
  financiero: FinancieroDto | null;
  graficas: GraficasDto | null;
}

const ESTADO_COLORS: Record<string, string> = {
  Bueno: "#10b981",
  Activo: "#10b981",
  Operativo: "#10b981",
  Mantenimiento: "#f59e0b",
  "En reparación": "#f59e0b",
  Baja: "#ef4444",
  "Dado de baja": "#ef4444",
  Deteriorado: "#f97316",
};
const FALLBACK_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#3b82f6",
];

const BAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  "#ede9fe",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Custom PieChart Label ───────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function PieCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Custom AreaChart Tooltip ────────────────────────────────────────────────
function AuditTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-white text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-indigo-300">{payload[0].value} auditorías</p>
    </div>
  );
}

// ─── Custom BarChart Tooltip ─────────────────────────────────────────────────
function DeptTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-white text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-purple-300">{payload[0].value} activos</p>
    </div>
  );
}

export const FinancialWidgets = memo(function FinancialWidgets({
  financiero,
  graficas,
}: FinancialWidgetsProps) {
  const currentMonthIndex = new Date().getMonth();
  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  // Sort dept data desc
  const deptData = useMemo(
    () =>
      [...(graficas?.activosPorDepartamento || [])].sort(
        (a, b) => b.cantidad - a.cantidad,
      ),
    [graficas?.activosPorDepartamento],
  );

  const estadoData = useMemo(
    () => graficas?.activosPorEstado || [],
    [graficas?.activosPorEstado],
  );

  const auditData = useMemo(
    () => graficas?.auditoriasPorMes || [],
    [graficas?.auditoriasPorMes],
  );

  const totalActivos = estadoData.reduce((s, e) => s + e.cantidad, 0);

  const acummDep = financiero?.depreciacion_acumulada || 0;
  const pctDep = financiero?.porcentaje_depreciacion || 0;
  const monthlyDep = Math.round(acummDep / 12);

  return (
    <div className="space-y-6">
      {/* ─── Row 1: Area Chart + Depreciation Mini ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auditorías por Mes — AreaChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-1 dark:text-white">
              Auditorías por Mes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Actividad de auditoría — año en curso
            </p>
          </div>
          {auditData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
              Sin datos de auditorías este año.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={auditData}
                margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="auditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<AuditTooltip />} />
                {/* Highlight current month */}
                <ReferenceLine
                  x={monthNames[currentMonthIndex]}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#auditGrad)"
                  dot={(props: any) => {
                    const isCurrent = props.index === currentMonthIndex;
                    return (
                      <circle
                        key={props.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={isCurrent ? 6 : 4}
                        fill={isCurrent ? "#6366f1" : "white"}
                        stroke="#6366f1"
                        strokeWidth={isCurrent ? 3 : 1.5}
                      />
                    );
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#6366f1",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Depreciation mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                Depreciación
              </span>
            </div>
            <h3 className="text-3xl font-bold dark:text-white mb-1 tabular-nums">
              {pctDep.toFixed(1)}%
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              del valor original depreciado
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pctDep, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${pctDep > 50 ? "bg-red-500" : pctDep > 25 ? "bg-amber-500" : "bg-emerald-500"}`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Estimado mensual
                </span>
                <span className="font-bold text-red-500 dark:text-red-400 tabular-nums">
                  -{formatCurrency(monthlyDep)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Row 2: BarChart + PieChart ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activos por Departamento — BarChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-1 dark:text-white">
              Activos por Departamento
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Distribución de custodios — mayor a menor
            </p>
          </div>
          {deptData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
              Sin datos de departamentos.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={deptData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e5e7eb"
                  strokeOpacity={0.4}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="departamento"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<DeptTooltip />} />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="cantidad"
                    position="right"
                    style={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Activos por Estado — PieChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 md:p-8"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1 dark:text-white">
              Activos por Estado
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total:{" "}
              <span className="font-bold text-gray-800 dark:text-white">
                {totalActivos}
              </span>{" "}
              activos
            </p>
          </div>
          {estadoData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
              Sin datos de estados.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={estadoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="cantidad"
                  nameKey="estado"
                  labelLine={false}
                  label={PieCustomLabel}
                >
                  {estadoData.map((entry, i) => (
                    <Cell
                      key={entry.estado}
                      fill={
                        ESTADO_COLORS[entry.estado] ||
                        FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `${val} (${((val / totalActivos) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
});
