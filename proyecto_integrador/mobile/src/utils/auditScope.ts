import { AuditoriaProgramada } from "@/api/auditorias";
import { ActivoDetalle } from "@/api/activos";
import { resolveAuditoriaStatus } from "../data/auditoriaStatus";

function getAuditPriority(audit: AuditoriaProgramada): number {
  const status = resolveAuditoriaStatus(audit);
  if (status === "en_progreso") return 2;
  if (status === "programada") return 1;
  return 0;
}

function getAuditRecency(audit: AuditoriaProgramada): number {
  const raw = audit.updated_at || audit.fecha_inicio || audit.fecha_programada;
  return raw ? new Date(raw).getTime() : 0;
}

export function getMatchingActiveAuditId(
  asset: ActivoDetalle | null,
  auditorias: AuditoriaProgramada[],
): string | null {
  if (!asset) return null;

  const activeAudits = auditorias.filter((audit) => {
    const status = resolveAuditoriaStatus(audit);
    return status === "programada" || status === "en_progreso";
  });

  const matches = activeAudits.filter((audit) => {
    if (audit.estante_id && asset.estante_id) {
      return audit.estante_id === asset.estante_id;
    }

    if (audit.oficina_id && asset.oficina_id) {
      return audit.oficina_id === asset.oficina_id;
    }

    return false;
  });

  if (matches.length === 0) return null;

  const best = [...matches].sort((a, b) => {
    const byPriority = getAuditPriority(b) - getAuditPriority(a);
    if (byPriority !== 0) return byPriority;
    return getAuditRecency(b) - getAuditRecency(a);
  })[0];

  return best?.id || null;
}