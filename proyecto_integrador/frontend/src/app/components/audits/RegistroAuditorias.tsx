import { motion } from "motion/react";
import {
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
  Filter,
  Search,
  Download,
  ClipboardList,
  FileText,
  FileSpreadsheet,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { logsAuditoriaApi, LogAuditoria } from "../../../services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
const getEstadoConfig = (nombre: string | null) => {
  const n = (nombre ?? "").toUpperCase();
  if (n.includes("BUENO") || n.includes("NUEVO"))
    return {
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-700/30",
      icon: CheckCircle2,
    };
  if (n.includes("DA") || n.includes("MALO") || n.includes("DETERIORADO"))
    return {
      bg: "bg-amber-100 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-700/30",
      icon: AlertTriangle,
    };
  if (
    n.includes("BAJA") ||
    n.includes("NO_ENCONTRADO") ||
    n.includes("NO ENCONTRADO")
  )
    return {
      bg: "bg-red-100 dark:bg-red-500/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-700/30",
      icon: XCircle,
    };
  return {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
    icon: ClipboardList,
  };
};

const formatFecha = (value: string | null) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const hoy = () => new Date().toISOString().split("T")[0];

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const esc = (s: string | null | undefined) => {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const LogSkeleton = () => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4 animate-pulse border border-gray-100 dark:border-gray-800/50">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-3" />
          <div className="h-4 w-32 bg-gray-300/80 dark:bg-gray-700/80 rounded-lg mb-2" />
          {i === 1 && (
            <div className="h-2.5 w-24 bg-gray-200 dark:bg-gray-800 rounded-full mt-2" />
          )}
          {i === 5 && (
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full mt-2" />
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportarCSV(logs: LogAuditoria[], periodo: string) {
  const e = (v: string | null | undefined) => {
    const s = v ?? "";
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const meta = [
    `"LOGS DE AUDITORÍA"`,
    `"Generado:","${formatFecha(new Date().toISOString())}"`,
    `"Período:","${periodo}"`,
    `"Total registros:","${logs.length}"`,
    "",
  ];
  const headers = [
    "Código Activo",
    "Nombre Activo",
    "Ubicación",
    "Método",
    "Auditor",
    "Plan / Auditoría",
    "Fecha y Hora",
    "Estado",
    "Comentarios",
  ];
  const rows = logs.map((l) =>
    [
      e(l.activo?.codigo_etiqueta),
      e(l.activo?.nombre),
      e(l.ubicacion),
      e(l.metodo_auditoria),
      e(l.auditor),
      e(l.plan_auditoria),
      e(formatFecha(l.fecha_hora)),
      e(l.estado_reportado),
      e(l.comentarios),
    ].join(","),
  );
  const csv = [...meta, headers.join(","), ...rows].join("\n");
  descargar(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    `logs_auditoria_${hoy()}.csv`,
  );
}

// ─── Excel SpreadsheetML ──────────────────────────────────────────────────────
function exportarExcel(logs: LogAuditoria[], periodo: string) {
  const cell = (val: string, styleId: string) =>
    `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${esc(val)}</Data></Cell>`;

  const filas = logs
    .map((l, i) => {
      const s = i % 2 === 0 ? "Even" : "Odd";
      return `<Row>
      ${cell(l.activo?.codigo_etiqueta ?? "—", s)}
      ${cell(l.activo?.nombre ?? "—", s)}
      ${cell(l.ubicacion ?? "—", s)}
      ${cell(l.metodo_auditoria ?? "—", s)}
      ${cell(l.auditor ?? "—", s)}
      ${cell(l.plan_auditoria ?? "—", s)}
      ${cell(formatFecha(l.fecha_hora), s)}
      ${cell(l.estado_reportado ?? "—", s)}
      ${cell(l.comentarios ?? "", s)}
    </Row>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Logs de Auditoría</Title>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Title"><Font ss:Bold="1" ss:Size="14" ss:Color="#1E3A5F"/></Style>
    <Style ss:ID="Meta"><Font ss:Italic="1" ss:Size="10" ss:Color="#666666"/></Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
      <Interior ss:Color="#1E3A5F" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F2447"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F2447"/>
      </Borders>
    </Style>
    <Style ss:ID="Even">
      <Interior ss:Color="#EBF2FB" ss:Pattern="Solid"/>
      <Font ss:Size="10"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C8D9ED"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C8D9ED"/>
      </Borders>
    </Style>
    <Style ss:ID="Odd">
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      <Font ss:Size="10"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C8D9ED"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C8D9ED"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="Logs Auditoría">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="110"/><Column ss:Width="160"/><Column ss:Width="150"/>
      <Column ss:Width="120"/><Column ss:Width="160"/><Column ss:Width="160"/>
      <Column ss:Width="140"/><Column ss:Width="110"/><Column ss:Width="200"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="Title"><Data ss:Type="String">LOGS DE AUDITORÍA</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="Meta"><Data ss:Type="String">Generado: ${formatFecha(new Date().toISOString())}</Data></Cell>
        <Cell ss:StyleID="Meta"><Data ss:Type="String">Período: ${periodo}</Data></Cell>
        <Cell ss:StyleID="Meta"><Data ss:Type="String">Total: ${logs.length} registros</Data></Cell>
      </Row>
      <Row/>
      <Row ss:Height="22">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Código Activo</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Nombre Activo</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Ubicación</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Método</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Auditor</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Plan / Auditoría</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Fecha y Hora</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Estado</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Comentarios</Data></Cell>
      </Row>
      ${filas}
    </Table>
  </Worksheet>
</Workbook>`;

  descargar(
    new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    `logs_auditoria_${hoy()}.xls`,
  );
}

// ─── PDF via ventana de impresión ─────────────────────────────────────────────
function exportarPDF(logs: LogAuditoria[], periodo: string) {
  const filas = logs
    .map(
      (l, i) => `
    <tr class="${i % 2 === 0 ? "even" : ""}">
      <td>${esc(l.activo?.codigo_etiqueta)}</td>
      <td>${esc(l.activo?.nombre)}</td>
      <td>${esc(l.ubicacion)}</td>
      <td>${esc(l.metodo_auditoria ?? "MANUAL")}</td>
      <td>${esc(l.auditor)}</td>
      <td>${esc(l.plan_auditoria ?? "N/A")}</td>
      <td>${esc(formatFecha(l.fecha_hora))}</td>
      <td>${esc(l.estado_reportado)}</td>
    </tr>`,
    )
    .join("");

  const ventana = window.open("", "_blank", "width=1100,height=750");
  if (!ventana) return;
  ventana.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Logs de Auditoría</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;padding:28px;color:#111}
  h1{font-size:22px;color:#1E3A5F;margin-bottom:4px}
  .meta{font-size:11px;color:#666;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:12px}
  thead tr{background:#1E3A5F;color:#fff}
  th{padding:9px 10px;text-align:left;font-weight:600;border-right:1px solid #0F2447}
  td{padding:7px 10px;border-bottom:1px solid #dce8f5;border-right:1px solid #dce8f5}
  tr.even td{background:#EBF2FB}
  .footer{margin-top:16px;font-size:10px;color:#999;text-align:right}
  @media print{@page{margin:14mm;size:A4 landscape}body{padding:0}}
</style></head>
<body>
  <h1>Logs de Auditoría</h1>
  <p class="meta">Período: ${periodo} &nbsp;·&nbsp; Generado: ${formatFecha(new Date().toISOString())} &nbsp;·&nbsp; ${logs.length} registros</p>
  <table>
    <thead><tr>
      <th>Código</th><th>Activo</th><th>Ubicación</th><th>Método</th>
      <th>Auditor</th><th>Plan / Auditoría</th><th>Fecha y Hora</th><th>Estado</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <p class="footer">Sistema ROMDEAU — Logs de Auditoría</p>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
</body></html>`);
  ventana.document.close();
}

// ─── Período ──────────────────────────────────────────────────────────────────
type Periodo = "today" | "week" | "month" | "custom";

function filtrarPorPeriodo(
  logs: LogAuditoria[],
  periodo: Periodo,
  fechaInicio?: string,
  fechaFin?: string,
): LogAuditoria[] {
  const now = new Date();
  return logs.filter((l) => {
    if (!l.fecha_hora) return true;
    const fecha = new Date(l.fecha_hora);
    if (periodo === "today") return fecha.toDateString() === now.toDateString();
    if (periodo === "week") {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      return fecha >= d;
    }
    if (periodo === "month") {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      return fecha >= d;
    }
    if (periodo === "custom" && fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio + "T00:00:00");
      const fin = new Date(fechaFin + "T23:59:59");
      return fecha >= inicio && fecha <= fin;
    }
    return true;
  });
}

const periodoLabel: Record<Periodo, string> = {
  today: "Hoy",
  week: "Últimos 7 días",
  month: "Últimos 30 días",
  custom: "Rango personalizado",
};

// ─── Modal de exportación ─────────────────────────────────────────────────────
type FormatoExport = "CSV" | "EXCEL" | "PDF";

const formatoOpciones: {
  value: FormatoExport;
  label: string;
  desc: string;
  icon: typeof FileText;
}[] = [
  {
    value: "CSV",
    label: "CSV",
    desc: "Texto separado por comas · universal",
    icon: FileText,
  },
  {
    value: "EXCEL",
    label: "Excel",
    desc: "Hoja de cálculo con estilos",
    icon: FileSpreadsheet,
  },
  {
    value: "PDF",
    label: "PDF",
    desc: "Documento listo para imprimir",
    icon: FileText,
  },
];

const periodoOpciones: { value: Periodo; label: string; desc: string }[] = [
  { value: "today", label: "Hoy", desc: "Solo registros de hoy" },
  { value: "week", label: "Esta semana", desc: "Últimos 7 días" },
  { value: "month", label: "Este mes", desc: "Últimos 30 días" },
  { value: "custom", label: "Personalizado", desc: "Elige rango de fechas" },
];

interface ExportModalProps {
  logs: LogAuditoria[];
  onClose: () => void;
}

function ExportModal({ logs, onClose }: ExportModalProps) {
  const [formato, setFormato] = useState<FormatoExport>("EXCEL");
  const [periodo, setPeriodo] = useState<Periodo>("month");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const logsExport = useMemo(
    () => filtrarPorPeriodo(logs, periodo, fechaInicio, fechaFin),
    [logs, periodo, fechaInicio, fechaFin],
  );

  const etiquetaPeriodo =
    periodo === "custom" && fechaInicio && fechaFin
      ? `${fechaInicio} — ${fechaFin}`
      : periodoLabel[periodo];

  const handleExport = async () => {
    setDateError(null);
    if (periodo === "custom") {
      if (!fechaInicio || !fechaFin) {
        setDateError("Selecciona fecha de inicio y fin");
        return;
      }
      if (fechaInicio > fechaFin) {
        setDateError("La fecha de fin debe ser posterior al inicio");
        return;
      }
    }
    try {
      setExporting(true);
      setExportError(null);
      await new Promise((r) => setTimeout(r, 250));
      if (formato === "CSV") exportarCSV(logsExport, etiquetaPeriodo);
      if (formato === "EXCEL") exportarExcel(logsExport, etiquetaPeriodo);
      if (formato === "PDF") exportarPDF(logsExport, etiquetaPeriodo);
      onClose();
    } catch {
      setExportError("Error al generar el archivo. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const today = hoy();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold dark:text-white">
              Exportar Logs de Auditoría
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Configura el período y formato del reporte
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 dark:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Período */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Período de tiempo
            </p>
            <div className="grid grid-cols-2 gap-3">
              {periodoOpciones.map(({ value, label, desc }) => {
                const active = periodo === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriodo(value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      active
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium text-sm ${active ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}
                        >
                          {label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {desc}
                        </p>
                      </div>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {periodo === "custom" && (
              <div className="mt-3 grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    max={today}
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    max={today}
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {dateError && (
                  <p className="col-span-2 text-xs text-red-500">{dateError}</p>
                )}
              </div>
            )}
          </div>

          {/* Formato */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Formato de archivo
            </p>
            <div className="grid grid-cols-1 gap-3">
              {formatoOpciones.map(({ value, label, desc, icon: Icon }) => {
                const active = formato === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormato(value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? "border-black dark:border-white bg-black dark:bg-white"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-white/20 dark:bg-black/20" : "bg-white dark:bg-gray-700"}`}
                    >
                      <Icon
                        className={`w-5 h-5 ${active ? "text-white dark:text-black" : "text-gray-600 dark:text-gray-300"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold text-sm ${active ? "text-white dark:text-black" : "text-gray-900 dark:text-white"}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${active ? "text-white/70 dark:text-black/60" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {desc}
                      </p>
                    </div>
                    {active && (
                      <CheckCircle2 className="w-5 h-5 text-white dark:text-black flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-400 mb-2">
              Resumen de exportación
            </p>
            <ul className="text-sm text-emerald-800 dark:text-emerald-300 space-y-1">
              <li>
                • Formato: <span className="font-semibold">{formato}</span>
              </li>
              <li>
                • Período:{" "}
                <span className="font-semibold">{etiquetaPeriodo}</span>
              </li>
              <li>
                • Registros a exportar:{" "}
                <span className="font-semibold">{logsExport.length}</span>
                {logsExport.length !== logs.length && (
                  <span className="text-emerald-600/70 dark:text-emerald-400/70">
                    {" "}
                    (de {logs.length} total filtrados)
                  </span>
                )}
              </li>
            </ul>
          </div>

          {exportError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {exportError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            El archivo se descargará automáticamente
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={exporting}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || logsExport.length === 0}
              className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar {formato}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface RegistroAuditoriasProps {
  onAuditClick: (auditId: string) => void;
}

export function RegistroAuditorias({ onAuditClick }: RegistroAuditoriasProps) {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ubicacionFilter, setUbicacionFilter] = useState<string>("all");
  const [auditorFilter, setAuditorFilter] = useState<string>("all");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await logsAuditoriaApi.getList({ limit: 200 });
      setLogs(result.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar los registros";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const statuses = useMemo(
    () =>
      [
        "all",
        ...Array.from(
          new Set(logs.map((l) => l.estado_reportado).filter(Boolean)),
        ),
      ] as string[],
    [logs],
  );

  const ubicaciones = useMemo(
    () =>
      [
        "all",
        ...Array.from(new Set(logs.map((l) => l.ubicacion).filter(Boolean))),
      ] as string[],
    [logs],
  );

  const auditors = useMemo(
    () =>
      [
        "all",
        ...Array.from(new Set(logs.map((l) => l.auditor).filter(Boolean))),
      ] as string[],
    [logs],
  );

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          if (
            !log.activo?.nombre?.toLowerCase().includes(q) &&
            !log.activo?.codigo_etiqueta?.toLowerCase().includes(q) &&
            !log.auditor?.toLowerCase().includes(q)
          )
            return false;
        }
        if (statusFilter !== "all" && log.estado_reportado !== statusFilter)
          return false;
        if (ubicacionFilter !== "all" && log.ubicacion !== ubicacionFilter)
          return false;
        if (auditorFilter !== "all" && log.auditor !== auditorFilter)
          return false;
        return true;
      }),
    [logs, searchTerm, statusFilter, ubicacionFilter, auditorFilter],
  );

  const stats = useMemo(() => {
    const n = (v: string | null) => (v ?? "").toLowerCase();
    return {
      total: filteredLogs.length,
      bueno: filteredLogs.filter(
        (l) =>
          n(l.estado_reportado).includes("bueno") ||
          n(l.estado_reportado).includes("nuevo"),
      ).length,
      danado: filteredLogs.filter(
        (l) =>
          n(l.estado_reportado).includes("da") ||
          n(l.estado_reportado).includes("malo"),
      ).length,
      noEncontrado: filteredLogs.filter(
        (l) =>
          n(l.estado_reportado).includes("no") ||
          n(l.estado_reportado).includes("baja"),
      ).length,
    };
  }, [filteredLogs]);

  const statCards = [
    { label: "Total Auditorías", value: stats.total, color: "dark:text-white" },
    {
      label: "Buen estado",
      value: stats.bueno,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Dañados / Malos",
      value: stats.danado,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "No Encontrados",
      value: stats.noEncontrado,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <main className="transition-[padding] duration-300 pl-6 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Título */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Logs de Auditoría
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historial completo de auditorías —{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {filteredLogs.length} de {logs.length} registros
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
            >
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                {s.label}
              </p>
              <p className={`text-3xl font-bold ${s.color}`}>
                {loading ? "—" : s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold dark:text-white">
                Filtros y Búsqueda
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || filteredLogs.length === 0}
              onClick={() => setIsExportModalOpen(true)}
              className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar Reporte
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar activo o auditor..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            {/* Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "Todos los estados" : s}
                </option>
              ))}
            </select>

            {/* Ubicación */}
            <select
              value={ubicacionFilter}
              onChange={(e) => setUbicacionFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {ubicaciones.map((u) => (
                <option key={u} value={u}>
                  {u === "all" ? "Todas las ubicaciones" : u}
                </option>
              ))}
            </select>

            {/* Auditor */}
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {auditors.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "Todos los auditores" : a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <LogSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400 font-medium flex-1">
              {error}
            </p>
            <button
              onClick={fetchLogs}
              className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && filteredLogs.length === 0 && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-16 flex flex-col items-center gap-4">
            <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No se encontraron registros de auditoría
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && filteredLogs.length > 0 && (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => {
              const cfg = getEstadoConfig(log.estado_reportado);
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    console.log('--- NAVEGACIÓN DESDE LOG ---');
                    console.log('ID del Log:', log.id);
                    onAuditClick(log.id);
                  }}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-all cursor-pointer"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Activo */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Activo
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {log.activo?.codigo_etiqueta ?? "—"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {log.activo?.nombre ?? "Sin nombre"}
                      </p>
                    </div>

                    {/* Ubicación */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Ubicación
                      </p>
                      {log.ubicacion ? (
                        <div className="flex items-start gap-1.5">
                          <Navigation className="w-3.5 h-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.ubicacion}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-600">
                          —
                        </p>
                      )}
                    </div>

                    {/* Método */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Método
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          log.metodo_auditoria === "QR"
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700/30"
                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30"
                        }`}
                      >
                        {log.metodo_auditoria ?? "MANUAL"}
                      </span>
                    </div>

                    {/* Auditor + Plan */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Auditor
                      </p>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                          {log.auditor ?? "—"}
                        </p>
                      </div>
                      {log.plan_auditoria && (
                        <p
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 truncate max-w-[120px]"
                          title={log.plan_auditoria}
                        >
                          Plan: {log.plan_auditoria}
                        </p>
                      )}
                    </div>

                    {/* Fecha + Estado */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        Fecha y Hora
                      </p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {formatFecha(log.fecha_hora)}
                        </p>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{log.estado_reportado ?? "Sin estado"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comentarios */}
                  {log.comentarios && (
                    <div
                      className={`mt-4 p-4 rounded-2xl border-2 ${cfg.bg} ${cfg.border}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 ${cfg.text}`}
                        />
                        <p className={`text-sm ${cfg.text}`}>
                          {log.comentarios}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {isExportModalOpen && (
        <ExportModal
          logs={filteredLogs}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </main>
  );
}
