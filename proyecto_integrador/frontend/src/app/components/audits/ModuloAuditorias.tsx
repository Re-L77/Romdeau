import { motion } from "motion/react";
import {
  Calendar,
  Clock3,
  MapPin,
  User,
  Plus,
  Filter,
  Search,
  RotateCcw,
  Download,
  FileText,
  FileSpreadsheet,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  CrearAuditoria,
  AuditFormData,
  AuditoriaFormCatalogs,
  CreateAuditoriaProgramadaDto,
} from "./CrearAuditoria";
import { auditoriasProgramadasApi } from "../../../services/api";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "../../../contexts/AuthContext";

interface ModuloAuditoriasProps {
  onScheduledAuditClick: (auditId: string) => void;
  onCompletedAuditClick: (auditId: string) => void;
}

const getStateColor = (estadoNombre: string) => {
  const estado = estadoNombre?.toLowerCase().trim() ?? "";

  if (estado.includes("pendiente") || estado.includes("programada")) {
    return {
      bg: "bg-blue-100 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-700/30",
    };
  }
  if (estado.includes("progreso") || estado.includes("ejecución")) {
    return {
      bg: "bg-amber-100 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-700/30",
    };
  }
  if (estado.includes("completada") || estado.includes("finalizada")) {
    return {
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-700/30",
    };
  }
  if (estado.includes("cancelada") || estado.includes("rechazada")) {
    return {
      bg: "bg-red-100 dark:bg-red-500/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-700/30",
    };
  }
  if (estado.includes("vencida") || estado.includes("expirada")) {
    return {
      bg: "bg-orange-100 dark:bg-orange-500/20",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-700/30",
    };
  }

  return {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700/30",
  };
};

const formatFecha = (value: string | null | undefined) => {
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
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

type FormatoExport = "CSV" | "EXCEL" | "PDF";
type Periodo = "today" | "week" | "month" | "custom";

const periodoLabel: Record<Periodo, string> = {
  today: "Hoy",
  week: "Últimos 7 días",
  month: "Últimos 30 días",
  custom: "Rango personalizado",
};

const periodoOpciones: { value: Periodo; label: string; desc: string }[] = [
  { value: "today", label: "Hoy", desc: "Solo auditorías de hoy" },
  { value: "week", label: "Esta semana", desc: "Últimos 7 días" },
  { value: "month", label: "Este mes", desc: "Últimos 30 días" },
  {
    value: "custom",
    label: "Personalizado",
    desc: "Selecciona inicio y fin",
  },
];

const formatoOpciones: {
  value: FormatoExport;
  label: string;
  desc: string;
  icon: typeof FileText;
}[] = [
  {
    value: "CSV",
    label: "CSV",
    desc: "Texto separado por comas",
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

const getAuditDate = (audit: any) =>
  audit.fecha_programada ?? audit.created_at ?? audit.updated_at ?? null;

function filtrarAuditoriasPorPeriodo(
  audits: any[],
  periodo: Periodo,
  fechaInicio?: string,
  fechaFin?: string,
) {
  const now = new Date();
  return audits.filter((audit) => {
    const raw = getAuditDate(audit);
    if (!raw) return true;
    const fecha = new Date(raw);
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

function exportarAuditoriasCSV(
  audits: any[],
  periodo: string,
  generadoPor: string,
  generadoEn: string,
) {
  const e = (v: string | null | undefined) => {
    const s = v ?? "";
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = audits.map((audit) => {
    const ubicacion = audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "—";
    const estado = audit.estados_auditoria_programada?.nombre ?? "—";
    const auditor = audit.usuarios?.nombre_completo ?? "—";
    return [
      e(audit.titulo),
      e(audit.descripcion),
      e(estado),
      e(auditor),
      e(ubicacion),
      e(formatFecha(audit.fecha_programada)),
      e(formatFecha(audit.fecha_inicio)),
      e(formatFecha(audit.fecha_fin)),
      e(formatFecha(audit.created_at)),
      e(formatFecha(audit.updated_at)),
    ].join(",");
  });

  const csv = [
    '"AUDITORÍAS PROGRAMADAS"',
    `"Generado por:","${generadoPor}"`,
    `"Fecha de generación:","${generadoEn}"`,
    `\"Período:\",\"${periodo}\"`,
    `\"Total:\",\"${audits.length}\"`,
    "",
    [
      "Título",
      "Descripción",
      "Estado",
      "Auditor",
      "Ubicación",
      "Fecha Programada",
      "Inicio",
      "Cierre",
      "Creada",
      "Actualizada",
    ].join(","),
    ...rows,
  ].join("\n");

  descargar(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    `auditorias_programadas_${hoy()}.csv`,
  );
}

function exportarAuditoriasExcel(
  audits: any[],
  periodo: string,
  generadoPor: string,
  generadoEn: string,
) {
  const cell = (val: string, styleId: string) =>
    `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${esc(val)}</Data></Cell>`;

  const filas = audits
    .map((audit, i) => {
      const s = i % 2 === 0 ? "Even" : "Odd";
      const ubicacion = audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "—";
      const estado = audit.estados_auditoria_programada?.nombre ?? "—";
      const auditor = audit.usuarios?.nombre_completo ?? "—";
      return `<Row>
      ${cell(audit.titulo ?? "—", s)}
      ${cell(audit.descripcion ?? "—", s)}
      ${cell(estado, s)}
      ${cell(auditor, s)}
      ${cell(ubicacion, s)}
      ${cell(formatFecha(audit.fecha_programada), s)}
      ${cell(formatFecha(audit.fecha_inicio), s)}
      ${cell(formatFecha(audit.fecha_fin), s)}
    </Row>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1E3A5F" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Even"><Interior ss:Color="#EBF2FB" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Odd"><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="Auditorías">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Generado por: ${esc(generadoPor)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Fecha de generación: ${esc(generadoEn)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Período: ${esc(periodo)}</Data></Cell>
      </Row>
      <Row/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Título</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Descripción</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Estado</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Auditor</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Ubicación</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Fecha Programada</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Inicio</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Cierre</Data></Cell>
      </Row>
      ${filas}
    </Table>
  </Worksheet>
</Workbook>`;

  descargar(
    new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    `auditorias_programadas_${hoy()}.xls`,
  );
}

function exportarAuditoriasPDF(
  audits: any[],
  periodo: string,
  generadoPor: string,
  generadoEn: string,
) {
  const filas = audits
    .map((audit) => {
      const ubicacion = audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "—";
      const estado = audit.estados_auditoria_programada?.nombre ?? "—";
      const auditor = audit.usuarios?.nombre_completo ?? "—";
      return `<tr>
        <td>${esc(audit.titulo ?? "—")}</td>
        <td>${esc(estado)}</td>
        <td>${esc(auditor)}</td>
        <td>${esc(ubicacion)}</td>
        <td>${esc(formatFecha(audit.fecha_programada))}</td>
      </tr>`;
    })
    .join("");

  const w = window.open("", "_blank", "width=1200,height=800");
  if (!w) return;
  w.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>Auditorías</title>
  <style>
    body{font-family:Segoe UI,Arial,sans-serif;padding:24px}
    h1{margin:0 0 6px}
    p{margin:0 0 16px;color:#666}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#1E3A5F;color:#fff}
  </style></head><body>
  <h1>Auditorías Programadas</h1>
  <p>Generado por: ${esc(generadoPor)} · Fecha: ${esc(generadoEn)}</p>
  <p>Período: ${esc(periodo)} · Total: ${audits.length}</p>
  <table><thead><tr><th>Título</th><th>Estado</th><th>Auditor</th><th>Ubicación</th><th>Fecha Programada</th></tr></thead>
  <tbody>${filas}</tbody></table>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
  </body></html>`);
  w.document.close();
}

function ExportAuditoriasModal({
  audits,
  generadoPor,
  onClose,
}: {
  audits: any[];
  generadoPor: string;
  onClose: () => void;
}) {
  const [formato, setFormato] = useState<FormatoExport>("EXCEL");
  const [periodo, setPeriodo] = useState<Periodo>("month");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const auditsExport = filtrarAuditoriasPorPeriodo(
    audits,
    periodo,
    fechaInicio,
    fechaFin,
  );

  const etiquetaPeriodo =
    periodo === "custom" && fechaInicio && fechaFin
      ? `${fechaInicio} — ${fechaFin}`
      : periodoLabel[periodo];
  const generadoEn = formatFecha(new Date().toISOString());

  const handleExport = async () => {
    setError(null);
    if (periodo === "custom" && (!fechaInicio || !fechaFin)) {
      setError("Selecciona fecha de inicio y fin");
      return;
    }
    if (periodo === "custom" && fechaInicio > fechaFin) {
      setError("La fecha de fin debe ser posterior al inicio");
      return;
    }

    try {
      setExporting(true);
      await new Promise((r) => setTimeout(r, 200));
      if (formato === "CSV")
        exportarAuditoriasCSV(
          auditsExport,
          etiquetaPeriodo,
          generadoPor,
          generadoEn,
        );
      if (formato === "EXCEL")
        exportarAuditoriasExcel(
          auditsExport,
          etiquetaPeriodo,
          generadoPor,
          generadoEn,
        );
      if (formato === "PDF")
        exportarAuditoriasPDF(
          auditsExport,
          etiquetaPeriodo,
          generadoPor,
          generadoEn,
        );
      onClose();
    } finally {
      setExporting(false);
    }
  };

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
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold dark:text-white">
              Exportar Auditorías
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Basado en la lista filtrada actual
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 dark:text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
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
                    <p
                      className={`font-medium text-sm ${active ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {periodo === "custom" && (
              <div className="mt-3 grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <input
                  type="date"
                  max={hoy()}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="date"
                  max={hoy()}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Formato de archivo
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
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${active ? "text-white dark:text-black" : "text-gray-600 dark:text-gray-300"}`}
                    />
                    <div>
                      <p
                        className={`font-semibold text-sm ${active ? "text-white dark:text-black" : "text-gray-900 dark:text-white"}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-xs ${active ? "text-white/70 dark:text-black/60" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-400 mb-2">
              Resumen de exportación
            </p>
            <ul className="text-sm text-emerald-800 dark:text-emerald-300 space-y-1">
              <li>
                Formato: <span className="font-semibold">{formato}</span>
              </li>
              <li>
                Período:{" "}
                <span className="font-semibold">{etiquetaPeriodo}</span>
              </li>
              <li>
                Generado por:{" "}
                <span className="font-semibold">{generadoPor}</span>
              </li>
              <li>
                Fecha y hora:{" "}
                <span className="font-semibold">{generadoEn}</span>
              </li>
              <li>
                Registros:{" "}
                <span className="font-semibold">{auditsExport.length}</span>
              </li>
            </ul>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ModuloAuditorias({
  onScheduledAuditClick,
}: ModuloAuditoriasProps) {
  const { user } = useAuth();
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);
  const [scheduledAudits, setScheduledAudits] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [auditorFilter, setAuditorFilter] = useState("all");
  const [edificioFilter, setEdificioFilter] = useState("all");
  const [sedeFilter, setSedeFilter] = useState("all");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [auditores, setAuditores] = useState<any[]>([]);
  const [edificios, setEdificios] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [formCatalogs, setFormCatalogs] = useState<AuditoriaFormCatalogs>({
    auditores: [],
    sedes: [],
  });

  const nombreUsuario = user
    ? [user.nombres, user.apellido_paterno].filter(Boolean).join(" ") ||
      user.email
    : "Sistema";

  const loadData = useCallback(async () => {
    try {
      setLoadingScheduled(true);
      const [
        auditsData,
        auditoresData,
        edificiosData,
        sedesData,
        estadosData,
        formCatalogsData,
      ] = await Promise.all([
        auditoriasProgramadasApi.getAll(),
        auditoriasProgramadasApi.getAllAuditores?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getAllEdificios?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getAllSedes?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getAllStates?.() || Promise.resolve([]),
        auditoriasProgramadasApi.getFormCatalogs?.() ||
          Promise.resolve({ auditores: [], sedes: [] }),
      ]);

      setScheduledAudits(auditsData);
      setAuditores(auditoresData);
      setEdificios(edificiosData);
      setSedes(sedesData);
      setEstados(estadosData);
      setFormCatalogs(formCatalogsData || { auditores: [], sedes: [] });
    } catch (err) {
      console.error("Error loading audits data:", err);
      setScheduledAudits([]);
    } finally {
      setLoadingScheduled(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAudit = () => setIsCreatingAudit(true);

  const handleSaveAudit = async (formData: CreateAuditoriaProgramadaDto) => {
    try {
      // Guardar en la base de datos
      await auditoriasProgramadasApi.create(formData);

      // Mostrar notificación de éxito
      toast.success(`Auditoría "${formData.titulo}" programada correctamente`);

      // Cerrar el modal
      setIsCreatingAudit(false);

      // Recargar la lista de auditorías
      loadData();
    } catch (error) {
      console.error("Error al guardar auditoría:", error);
      toast.error("Error al guardar la auditoría. Intenta de nuevo.");
    }
  };

  const handleCloseModal = () => setIsCreatingAudit(false);

  const handleResetFilters = () => {
    setSearchTerm("");
    setEstadoFilter("all");
    setAuditorFilter("all");
    setEdificioFilter("all");
    setSedeFilter("all");
  };

  const filteredAudits = scheduledAudits
    .filter((audit) => {
      if (
        searchTerm &&
        !audit.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !audit.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (estadoFilter !== "all") {
        const estadoNombre = audit.estados_auditoria_programada?.nombre ?? "";
        if (estadoNombre.toLowerCase() !== estadoFilter) return false;
      }

      if (auditorFilter !== "all") {
        const auditorNombre = audit.usuarios?.nombre_completo ?? "";
        if (auditorNombre.toLowerCase() !== auditorFilter) return false;
      }

      if (edificioFilter !== "all") {
        const ubicacion =
          audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "";
        if (ubicacion.toLowerCase() !== edificioFilter) return false;
      }

      if (sedeFilter !== "all") {
        const ubicacion =
          audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "";
        if (ubicacion.toLowerCase() !== sedeFilter) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(getAuditDate(a) ?? 0).getTime();
      const dateB = new Date(getAuditDate(b) ?? 0).getTime();
      return dateB - dateA;
    });

  return (
    <main className="pl-6 transition-[padding] duration-300 lg:pl-[var(--content-padding,20rem)] pt-6 lg:pt-8 pb-12 px-6 pr-6 lg:pr-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Módulo de Auditorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Programación y seguimiento con validación PostGIS
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold dark:text-white">
                Búsqueda y Filtros
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-medium flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                Exportar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                onClick={handleCreateAudit}
              >
                <Plus className="w-4 h-4" />
                Crear Auditoría
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Estado: todos</option>
              {estados.map((est: any) => (
                <option key={est.id} value={est.nombre.toLowerCase()}>
                  {est.nombre}
                </option>
              ))}
            </select>
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Auditor: todos</option>
              {auditores.map((auditor: any) => (
                <option
                  key={auditor.id}
                  value={auditor.nombre_completo.toLowerCase()}
                >
                  {auditor.nombre_completo}
                </option>
              ))}
            </select>
            <select
              value={edificioFilter}
              onChange={(e) => setEdificioFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Edificio: todos</option>
              {edificios.map((ed: any) => (
                <option key={ed.id} value={ed.nombre.toLowerCase()}>
                  {ed.nombre}
                </option>
              ))}
            </select>
            <select
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none text-center"
            >
              <option value="all">Sede: todas</option>
              {sedes.map((sede: any) => (
                <option key={sede.id} value={sede.nombre.toLowerCase()}>
                  {sede.nombre}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full px-4 py-2.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={handleResetFilters}
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </motion.button>
          </div>
        </motion.div>

        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Auditorías Programadas
          </h2>
          {loadingScheduled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1 mr-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full shrink-0" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay auditorías que coincidan con los filtros aplicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAudits.map((audit, index) => {
                const estadoNombre: string =
                  audit.estados_auditoria_programada?.nombre ?? "Pendiente";
                const estadoColores = getStateColor(estadoNombre);
                const auditorNombre: string =
                  audit.usuarios?.nombre_completo ?? audit.auditor_id ?? "—";
                const fechaProgramada = audit.fecha_programada
                  ? new Date(audit.fecha_programada).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaInicio = audit.fecha_inicio
                  ? new Date(audit.fecha_inicio).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaFin = audit.fecha_fin
                  ? new Date(audit.fecha_fin).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaCreacion = audit.created_at
                  ? new Date(audit.created_at).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const fechaActualizacion = audit.updated_at
                  ? new Date(audit.updated_at).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—";
                const ubicacion =
                  audit.oficinas?.nombre ?? audit.estantes?.nombre ?? "—";

                return (
                  <motion.div
                    key={audit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onScheduledAuditClick(audit.id)}
                    className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1 dark:text-white">
                          {audit.titulo}
                        </h3>
                        {audit.descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {audit.descripcion}
                          </p>
                        )}
                        {ubicacion !== "—" && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {ubicacion}
                          </p>
                        )}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap ${estadoColores.bg} ${estadoColores.text} ${estadoColores.border}`}
                      >
                        {estadoNombre}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <User className="w-4 h-4" />
                        <span>{auditorNombre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Programada: {fechaProgramada}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Registros
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Creada: {fechaCreacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Actualizada: {fechaActualizacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Inicio: {fechaInicio}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Cierre: {fechaFin}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isCreatingAudit && (
        <CrearAuditoria
          onClose={handleCloseModal}
          onSave={handleSaveAudit}
          catalogs={formCatalogs}
          existingAudits={scheduledAudits}
        />
      )}

      {isExportModalOpen && (
        <ExportAuditoriasModal
          audits={filteredAudits}
          generadoPor={nombreUsuario}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </main>
  );
}
