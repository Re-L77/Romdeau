import { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingDown,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Table as TableIcon,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useFinancialSummary } from "../../hooks/useFinancialSummary";
import { FinancialModal } from "./FinancialModal";
import { useAuth } from "../../../contexts/AuthContext";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

export function Alertas() {
  const { data: summary, loading } = useFinancialSummary();
  const { user } = useAuth();
  const [modalType, setModalType] = useState<
    "acquisition" | "bookValue" | "depreciation" | "warranties" | null
  >(null);

  if (loading || !summary)
    return (
      <div className="p-20 text-center animate-pulse text-gray-400">
        Generando reporte financiero...
      </div>
    );

  const exportDevaluationToPDF = () => {
    const doc = new jsPDF("landscape");

    // Base de diseño: El rojo vino corporativo usado en Excel Exports (Requisiciones) #800020
    const primaryColor: [number, number, number] = [128, 0, 32];

    // Cabecera Principal Corporativa
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Reporte: Devaluación de Activos", 14, 22);

    // Sub-encabezados informativos
    doc.setFontSize(10);
    doc.setTextColor(80);
    const userName = user
      ? `${user.nombres || ""} ${user.apellido_paterno || ""} ${user.apellido_materno || ""}`
          .trim()
          .replace(/\s+/g, " ")
      : "Usuario Desconocido";
    doc.text(`Generado por: ${userName}`, 14, 30);
    doc.text(
      `Fecha de Emisión: ${new Date().toLocaleDateString("es-MX")} a las ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      14,
      36,
    );
    doc.text(`Total Activos Controlados: ${summary.totalActivos}`, 14, 42);

    const headers = [
      "ID",
      "Activo",
      "Categoría",
      "Fecha de Adq.",
      "Vida Útil",
      "Costo Original",
      "Depreciación",
      "Valor en Libros",
      "Desgaste",
      "Estado",
    ];
    const rows: string[][] = [];

    summary.activosDetalle.forEach((activo: any) => {
      const pct = (
        (activo.depreciacionAcumulada / activo.valorAdquisicion) *
        100
      ).toFixed(1);
      const isFullyDepreciated =
        parseFloat(pct) >= 100 || activo.valorLibro <= 0;

      const rowId = activo.id.includes("-")
        ? activo.id.split("-")[1]
        : activo.id;

      rows.push([
        rowId,
        activo.nombre,
        activo.categoria,
        new Date(activo.fechaAdquisicion).toLocaleDateString("es-MX"),
        `${activo.vidaUtil} años`,
        formatCurrency(activo.valorAdquisicion),
        `-${formatCurrency(activo.depreciacionAcumulada)}`,
        formatCurrency(activo.valorLibro),
        `${pct}%`,
        isFullyDepreciated ? "Amortizado" : "Activo",
      ]);
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 48,
      theme: "grid",
      headStyles: { fillColor: primaryColor, textColor: 255, halign: "center" },
      styles: { fontSize: 8, cellPadding: 3, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        5: { halign: "right" }, // Costo
        6: { halign: "right", textColor: [220, 38, 38] }, // Depre (rojo tenue)
        7: { halign: "right", textColor: [22, 163, 74], fontStyle: "bold" }, // Libros (verde)
        8: { halign: "center" }, // Porcentaje
        9: { halign: "center", fontStyle: "bold" }, // Estado
      },
    });

    doc.save("devaluacion_activos.pdf");
  };

  const calculatedPercentage = (
    (summary.depreciacionAcumulada / summary.valorTotalAdquisicion) *
    100
  ).toFixed(1);

  const kpis = [
    {
      id: "acquisition",
      label: "Valor Total Adquisición",
      value: formatCurrency(summary.valorTotalAdquisicion),
      icon: DollarSign,
      color: "blue",
      bg: "bg-blue-50 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "bookValue",
      label: "Valor en Libros",
      value: formatCurrency(summary.valorEnLibros),
      icon: BarChart3,
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "depreciation",
      label: "Depreciación Acumulada",
      value: formatCurrency(summary.depreciacionAcumulada),
      subtext: `${calculatedPercentage}% del total`,
      icon: TrendingDown,
      color: "red",
      bg: "bg-red-50 dark:bg-red-500/20",
      text: "text-red-600 dark:text-red-400",
    },
    {
      id: "warranties",
      label: "Garantías Vigentes",
      value: `${summary.garantias.vigentes} Activas`,
      subtext: `${summary.garantias.vencidas} vencidas`,
      icon: ShieldCheck,
      color: "amber",
      bg: "bg-amber-50 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12 print:p-0 print:m-0">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-1 dark:text-white">
              Depreciación y Activos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análisis detallado de la valoración patrimonial, desgaste de
              infraestructura y estado de cobertura legal.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-fit border border-gray-100 dark:border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Total Activos Auditados
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {summary.totalActivos}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setModalType(kpi.id as any)}
              className="group bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10">
                <div
                  className={`w-14 h-14 ${kpi.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  <kpi.icon className={`w-7 h-7 ${kpi.text}`} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  {kpi.label}
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  {kpi.value}
                </p>
                {kpi.subtext && (
                  <p className="text-xs font-bold text-gray-500">
                    {kpi.subtext}
                  </p>
                )}
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <kpi.icon className="w-32 h-32" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* TABLA DE DEPRECIACIÓN PROFESIONAL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                <TableIcon className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Reporte Contable Detallado
                </h4>
                <p className="text-sm text-gray-500 font-bold">
                  Análisis de depreciación activo por activo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportDevaluationToPDF}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                Descargar PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                    Nombre del Activo
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                    Categoría
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-center">
                    Adquisición
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-center">
                    Vida Útil
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-right">
                    Valor Inicial
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-right">
                    Dep. Acumulada
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-right">
                    Valor Libros
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-center">
                    % Dep.
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-center">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {summary.activosDetalle.map((activo: any) => {
                  const pct = (
                    (activo.depreciacionAcumulada / activo.valorAdquisicion) *
                    100
                  ).toFixed(1);
                  const isFullyDepreciated =
                    parseFloat(pct) >= 100 || activo.valorLibro <= 0;

                  return (
                    <tr
                      key={activo.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                            {activo.id.split("-")[1]}
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                            {activo.nombre}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium text-gray-500 text-xs">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3 h-3 text-gray-400" />
                          {activo.categoria}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-3 h-3 text-gray-400 mb-1" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {new Date(
                              activo.fechaAdquisicion,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black text-gray-500">
                          {activo.vidaUtil} Años
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right font-bold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(activo.valorAdquisicion)}
                      </td>
                      <td className="px-6 py-6 text-right font-medium text-red-500 text-sm">
                        -{formatCurrency(activo.depreciacionAcumulada)}
                      </td>
                      <td className="px-6 py-6 text-right font-black text-emerald-500 text-sm">
                        {formatCurrency(activo.valorLibro)}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 font-black text-[10px] text-gray-600 dark:text-gray-400">
                          {pct}%
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {isFullyDepreciated ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3" /> Depreciado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <FinancialModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType}
        data={summary}
      />
    </main>
  );
}
