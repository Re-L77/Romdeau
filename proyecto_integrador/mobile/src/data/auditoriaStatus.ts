import { AuditoriaProgramada } from "@/api/auditorias";

export type AuditoriaStatusKey =
  | "programada"
  | "en_progreso"
  | "cancelada"
  | "completada"
  | "vencida"
  | "desconocido";

const statusById: Record<number, AuditoriaStatusKey> = {
  1: "programada",
  2: "en_progreso",
  3: "completada",
  4: "cancelada",
  5: "vencida",
};

function normalize(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function parseStatusByName(nombre?: string): AuditoriaStatusKey | undefined {
  if (!nombre) return undefined;

  const normalized = normalize(nombre);

  if (normalized.includes("CANCEL")) return "cancelada";
  if (normalized.includes("COMPLET") || normalized.includes("FINALIZ")) {
    return "completada";
  }
  if (
    normalized.includes("PROGRES") ||
    normalized.includes("PROCESO") ||
    normalized.includes("EN CURSO")
  ) {
    return "en_progreso";
  }
  if (normalized.includes("PROGRAM")) return "programada";
  if (normalized.includes("VENCID")) return "vencida";

  return undefined;
}

export function resolveAuditoriaStatus(
  audit: Pick<
    AuditoriaProgramada,
    "estado_id" | "estados_auditoria_programada"
  >,
): AuditoriaStatusKey {
  return (
    parseStatusByName(audit.estados_auditoria_programada?.nombre) ||
    statusById[audit.estado_id] ||
    "desconocido"
  );
}

export function getAuditoriaStatusLabel(status: AuditoriaStatusKey): string {
  switch (status) {
    case "programada":
      return "Programada";
    case "en_progreso":
      return "En Progreso";
    case "cancelada":
      return "Cancelada";
    case "completada":
      return "Completada";
    case "vencida":
      return "Vencida";
    default:
      return "Desconocido";
  }
}
