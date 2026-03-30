import { motion } from "motion/react";
import {
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  BarChart3,
  Clock,
  PieChart,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { mockDB } from "../../data/mockData";

function formatCurrency(value: number) {
  return "$" + value.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDiasRestantes(fechaFin: string) {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function buildActivosConFinanzas() {
  return mockDB.activos.map((activo) => {
    const datos = mockDB.datosFinancieros.find(
      (d) => d.activo_id === activo.id,
    );
    const categoria = mockDB.categorias.find(
      (c) => c.id === activo.categoria_id,
    );
    const depreciacionAcumulada = datos
      ? datos.costo_adquisicion - datos.valor_libro_actual
      : 0;
    const porcentajeDepreciado =
      datos && datos.costo_adquisicion > 0
        ? (depreciacionAcumulada / datos.costo_adquisicion) * 100
        : 0;
    const diasGarantia = datos?.fin_garantia
      ? getDiasRestantes(datos.fin_garantia)
      : null;

    return {
      ...activo,
      datos,
      categoria,
      depreciacionAcumulada,
      porcentajeDepreciado,
      diasGarantia,
    };
  });
}

// Pie Chart Component
function SimplePieChart({
  data,
  size = 160,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = size / 2 + (size / 2 - 8) * Math.cos(startAngle);
    const y1 = size / 2 + (size / 2 - 8) * Math.sin(startAngle);
    const x2 = size / 2 + (size / 2 - 8) * Math.cos(endAngle);
    const y2 = size / 2 + (size / 2 - 8) * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${size / 2 - 8} ${size / 2 - 8} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path,
      color: item.color,
      name: item.name,
      percentage: ((item.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        {slices.map((slice, i) => (
          <motion.path
            key={i}
            d={slice.path}
            fill={slice.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
}

// Bar Chart Component
function SimpleBarChart({
  data,
  maxValue,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  maxValue: number;
}) {
  const barWidth = 100 / data.length;
  const chartHeight = 200;

  return (
    <div className="flex items-end justify-center gap-2 h-64 p-4">
      {data.map((item, i) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className={`flex-1 ${item.color} rounded-t-lg shadow-lg hover:shadow-xl transition-shadow relative group`}
            style={{ minHeight: "4px" }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              <p className="text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-2 py-1 rounded">
                {formatCurrency(item.value)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Donut Chart Component
function DonutChart({
  data,
  size = 140,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const innerRadius = size / 4;
  const outerRadius = size / 2;
  let currentAngle = -Math.PI / 2;

  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = size / 2 + outerRadius * Math.cos(startAngle);
    const y1 = size / 2 + outerRadius * Math.sin(startAngle);
    const x2 = size / 2 + outerRadius * Math.cos(endAngle);
    const y2 = size / 2 + outerRadius * Math.sin(endAngle);
    const x3 = size / 2 + innerRadius * Math.cos(endAngle);
    const y3 = size / 2 + innerRadius * Math.sin(endAngle);
    const x4 = size / 2 + innerRadius * Math.cos(startAngle);
    const y4 = size / 2 + innerRadius * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      path,
      color: item.color,
      name: item.name,
      percentage: ((item.value / total) * 100).toFixed(0),
    };
  });

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        {slices.map((slice, i) => (
          <motion.path
            key={i}
            d={slice.path}
            fill={slice.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
}

export function Alertas() {
  const activosFinanzas = buildActivosConFinanzas();
  const conDatos = activosFinanzas.filter((a) => a.datos);

  const valorTotalAdquisicion = conDatos.reduce(
    (sum, a) => sum + (a.datos?.costo_adquisicion ?? 0),
    0,
  );
  const valorLibroTotal = conDatos.reduce(
    (sum, a) => sum + (a.datos?.valor_libro_actual ?? 0),
    0,
  );
  const depreciacionTotal = valorTotalAdquisicion - valorLibroTotal;
  const porcentajeDepreciacionGlobal =
    valorTotalAdquisicion > 0
      ? (depreciacionTotal / valorTotalAdquisicion) * 100
      : 0;

  const garantiasVigentes = conDatos.filter(
    (a) => a.diasGarantia !== null && a.diasGarantia > 0,
  );
  const garantiasVencidas = conDatos.filter(
    (a) => a.diasGarantia !== null && a.diasGarantia <= 0,
  );
  const garantiasPorVencer = conDatos.filter(
    (a) =>
      a.diasGarantia !== null && a.diasGarantia > 0 && a.diasGarantia <= 90,
  );

  // Datos para gráficas
  const garActivityChartData = {
    vigentes: garantiasVigentes.length,
    porVencer: garantiasPorVencer.length,
    vencidas: garantiasVencidas.length,
  };

  const categoriaDepreciacion = mockDB.categorias
    .map((cat) => {
      const activosCat = conDatos.filter((a) => a.categoria_id === cat.id);
      const depCat = activosCat.reduce(
        (sum, a) => sum + a.depreciacionAcumulada,
        0,
      );
      return { id: cat.id, name: cat.nombre, value: depCat };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const activosPorValor = conDatos
    .sort(
      (a, b) =>
        (b.datos?.costo_adquisicion ?? 0) - (a.datos?.costo_adquisicion ?? 0),
    )
    .slice(0, 6);

  const pieChartData = categoriaDepreciacion.map((cat, i) => ({
    name: cat.name,
    value: cat.value,
    color:
      [
        "rgb(59, 130, 246)",
        "rgb(34, 197, 94)",
        "rgb(249, 115, 22)",
        "rgb(239, 68, 68)",
        "rgb(168, 85, 247)",
      ][i] || "rgb(107, 114, 128)",
  }));

  const barChartData = activosPorValor.map((activo, i) => ({
    name: (activo.nombre ?? "Asset").substring(0, 10),
    value: activo.datos?.costo_adquisicion ?? 0,
    color: [
      "bg-blue-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-red-500",
    ][i],
  }));

  const donutData = [
    {
      name: "Vigentes",
      value: garantiasVigentes.length,
      color: "rgb(34, 197, 94)",
    },
    {
      name: "Por Vencer",
      value: garantiasPorVencer.length,
      color: "rgb(249, 115, 22)",
    },
    {
      name: "Vencidas",
      value: garantiasVencidas.length,
      color: "rgb(239, 68, 68)",
    },
  ].filter((d) => d.value > 0);

  const kpis = [
    {
      label: "Valor Total Adquisición",
      value: formatCurrency(valorTotalAdquisicion),
      icon: DollarSign,
      color: "blue",
      bg: "bg-blue-50 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Valor en Libros",
      value: formatCurrency(valorLibroTotal),
      icon: BarChart3,
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Depreciación Acumulada",
      value: formatCurrency(depreciacionTotal),
      subtext: `${porcentajeDepreciacionGlobal.toFixed(1)}% del total`,
      icon: TrendingDown,
      color: "red",
      bg: "bg-red-50 dark:bg-red-500/20",
      text: "text-red-600 dark:text-red-400",
    },
    {
      label: "Garantías Vigentes",
      value: `${garantiasVigentes.length}`,
      subtext: `${garantiasVencidas.length} vencidas`,
      icon: ShieldCheck,
      color: "amber",
      bg: "bg-amber-50 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <main className="pl-6 lg:pl-80 pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 mt-6"
        >
          <div className="relative overflow-hidden rounded-3xl bg-black dark:bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-400/20 rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/30 dark:bg-purple-400/20 rounded-full -ml-48 -mb-48" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-white mb-2">
                    Depreciación y Garantías
                  </h1>
                  <p className="text-lg text-gray-200 dark:text-gray-300">
                    Panel integral de valoración de activos y cobertura de
                    garantías
                  </p>
                </div>
                <div className="hidden md:block text-5xl opacity-10">📊</div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20 dark:border-gray-700/50">
                <div>
                  <p className="text-sm text-gray-100 dark:text-gray-200 mb-1">
                    Total de Activos
                  </p>
                  <p className="text-3xl font-bold text-white dark:text-white">
                    {conDatos.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-100 dark:text-gray-200 mb-1">
                    Garantías Vigentes
                  </p>
                  <p className="text-3xl font-bold text-emerald-200 dark:text-emerald-300">
                    {garantiasVigentes.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-100 dark:text-gray-200 mb-1">
                    Garantías Críticas
                  </p>
                  <p className="text-3xl font-bold text-red-200 dark:text-red-300">
                    {garantiasPorVencer.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.8)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-14 h-14 ${kpi.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <kpi.icon className={`w-7 h-7 ${kpi.text}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {kpi.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {kpi.value}
              </p>
              {kpi.subtext && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {kpi.subtext}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart - Depreciación por Categoría */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-500/30">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Depreciación por Categoría
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Top 5 categorías
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              {pieChartData.length > 0 ? (
                <>
                  <SimplePieChart data={pieChartData} size={140} />
                  <div className="mt-6 w-full space-y-2">
                    {pieChartData.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-300 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Sin datos disponibles
                </p>
              )}
            </div>
          </motion.div>

          {/* Donut Chart - Estado de Garantías */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-amber-200 dark:border-amber-500/30">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Estado de Garantías
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {conDatos.filter((a) => a.datos?.fin_garantia).length}{" "}
                    activos
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              {donutData.length > 0 ? (
                <>
                  <DonutChart data={donutData} size={140} />
                  <div className="mt-6 w-full space-y-2">
                    {donutData.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Sin datos disponibles
                </p>
              )}
            </div>
          </motion.div>

          {/* Bar Chart - Top Activos por Valor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 px-6 py-4 border-b border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Top Activos por Valor
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Primeros 6 activos
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {barChartData.length > 0 && valorTotalAdquisicion > 0 ? (
                <>
                  <SimpleBarChart
                    data={barChartData.map((item) => ({
                      ...item,
                      color: item.color,
                    }))}
                    maxValue={Math.max(...barChartData.map((d) => d.value))}
                  />
                  <div className="mt-4 space-y-1.5">
                    {barChartData.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs px-2"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.name}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {((item.value / valorTotalAdquisicion) * 100).toFixed(
                            1,
                          )}
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                  Sin datos disponibles
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
