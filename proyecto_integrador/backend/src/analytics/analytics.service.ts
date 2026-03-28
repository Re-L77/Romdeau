import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HealthScoreDto,
  UserPerformanceItemDto,
  CostByDepartmentItemDto,
  TemporalComparisonDto,
  CriticalAssetsDto,
  MovementsByMonthItemDto,
  OperationalTimesDto,
  DepreciationProjectionItemDto,
  TopMovedAssetDto,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Health Score ───────────────────────────────────────────────────────────
  async getHealthScore(): Promise<HealthScoreDto> {
    const total = await this.prisma.activos.count();
    if (total === 0) {
      return { score: 0, nivel: 'CRITICO', breakdown: { auditados_pct: 0, buen_estado_pct: 0, con_ubicacion_pct: 0, con_custodio_pct: 0 } };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [auditadosRecientes, buenoEstado, conUbicacion, conCustodio] = await Promise.all([
      // Assets audited in the last 30 days
      this.prisma.activos.count({
        where: {
          logs_auditoria: {
            some: { fecha_hora: { gte: thirtyDaysAgo } },
          },
        },
      }),
      // Assets in good/excellent operational state (id = 1 = good)
      this.prisma.activos.count({ where: { estado_operativo_id: { in: [1, 2] } } }),
      // Assets with a location (oficina assigned)
      this.prisma.activos.count({ where: { oficina_id: { not: null } } }),
      // Assets with a custodian
      this.prisma.activos.count({ where: { custodio_actual_id: { not: null } } }),
    ]);

    const auditados_pct = Math.round((auditadosRecientes / total) * 100);
    const buen_estado_pct = Math.round((buenoEstado / total) * 100);
    const con_ubicacion_pct = Math.round((conUbicacion / total) * 100);
    const con_custodio_pct = Math.round((conCustodio / total) * 100);

    const score = Math.round((auditados_pct + buen_estado_pct + con_ubicacion_pct + con_custodio_pct) / 4);

    let nivel: HealthScoreDto['nivel'];
    if (score >= 90) nivel = 'EXCELENTE';
    else if (score >= 75) nivel = 'BUENO';
    else if (score >= 50) nivel = 'MODERADO';
    else if (score >= 25) nivel = 'BAJO';
    else nivel = 'CRITICO';

    return { score, nivel, breakdown: { auditados_pct, buen_estado_pct, con_ubicacion_pct, con_custodio_pct } };
  }

  // ─── User Performance ──────────────────────────────────────────────────────
  async getUserPerformance(): Promise<UserPerformanceItemDto[]> {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const auditors = await this.prisma.usuarios.findMany({
      where: { logs_auditoria: { some: {} } },
      select: {
        id: true,
        nombre_completo: true,
        nombres: true,
        apellido_paterno: true,
        logs_auditoria: {
          select: { fecha_hora: true },
        },
      },
    });

    return auditors.map((u) => {
      const total_auditorias = u.logs_auditoria.length;
      const mes_actual = u.logs_auditoria.filter(
        (l) => l.fecha_hora && l.fecha_hora >= startOfCurrentMonth,
      ).length;
      const mes_anterior = u.logs_auditoria.filter(
        (l) => l.fecha_hora && l.fecha_hora >= startOfPrevMonth && l.fecha_hora < startOfCurrentMonth,
      ).length;
      const variacion = mes_anterior === 0 ? (mes_actual > 0 ? 100 : 0) : Math.round(((mes_actual - mes_anterior) / mes_anterior) * 100);

      return {
        usuario_id: u.id,
        nombre: u.nombre_completo ?? `${u.nombres} ${u.apellido_paterno}`,
        total_auditorias,
        mes_actual,
        mes_anterior,
        variacion,
      };
    });
  }

  // ─── Cost by Department ────────────────────────────────────────────────────
  async getCostByDepartment(): Promise<CostByDepartmentItemDto[]> {
    const usuarios = await this.prisma.usuarios.findMany({
      where: { departamento_id: { not: null } },
      select: {
        departamentos: { select: { nombre: true } },
        activos: {
          select: {
            datos_financieros: {
              select: { costo_adquisicion: true, valor_libro_actual: true },
            },
          },
        },
      },
    });

    const deptMap = new Map<string, { costo_total: number; valor_actual: number; activos_count: number }>();

    for (const u of usuarios) {
      const dept = u.departamentos?.nombre ?? 'Sin departamento';
      if (!deptMap.has(dept)) deptMap.set(dept, { costo_total: 0, valor_actual: 0, activos_count: 0 });
      const entry = deptMap.get(dept)!;
      for (const a of u.activos) {
        if (a.datos_financieros) {
          entry.costo_total += Number(a.datos_financieros.costo_adquisicion);
          entry.valor_actual += Number(a.datos_financieros.valor_libro_actual);
          entry.activos_count += 1;
        }
      }
    }

    return Array.from(deptMap.entries())
      .map(([departamento, data]) => ({ departamento, ...data }))
      .sort((a, b) => b.costo_total - a.costo_total);
  }

  // ─── Temporal Comparison ───────────────────────────────────────────────────
  async getTemporalComparison(): Promise<TemporalComparisonDto> {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const calcVariacion = (actual: number, anterior: number) =>
      anterior === 0 ? (actual > 0 ? 100 : 0) : Math.round(((actual - anterior) / anterior) * 100);

    const [audCurrent, audPrev, movCurrent, movPrev, newCurrent, newPrev] = await Promise.all([
      this.prisma.logs_auditoria.count({ where: { fecha_hora: { gte: startOfCurrentMonth } } }),
      this.prisma.logs_auditoria.count({ where: { fecha_hora: { gte: startOfPrevMonth, lt: startOfCurrentMonth } } }),
      this.prisma.movimientos_activos.count({ where: { fecha_movimiento: { gte: startOfCurrentMonth } } }),
      this.prisma.movimientos_activos.count({ where: { fecha_movimiento: { gte: startOfPrevMonth, lt: startOfCurrentMonth } } }),
      this.prisma.activos.count({ where: { created_at: { gte: startOfCurrentMonth } } }),
      this.prisma.activos.count({ where: { created_at: { gte: startOfPrevMonth, lt: startOfCurrentMonth } } }),
    ]);

    // Valor adquirido this month vs prev month
    const [valCurrent, valPrev] = await Promise.all([
      this.prisma.datos_financieros.aggregate({
        _sum: { costo_adquisicion: true },
        where: { activos: { created_at: { gte: startOfCurrentMonth } } },
      }),
      this.prisma.datos_financieros.aggregate({
        _sum: { costo_adquisicion: true },
        where: { activos: { created_at: { gte: startOfPrevMonth, lt: startOfCurrentMonth } } },
      }),
    ]);

    const valCurrentNum = Number(valCurrent._sum.costo_adquisicion ?? 0);
    const valPrevNum = Number(valPrev._sum.costo_adquisicion ?? 0);

    return {
      auditorias: { actual: audCurrent, anterior: audPrev, variacion: calcVariacion(audCurrent, audPrev) },
      movimientos: { actual: movCurrent, anterior: movPrev, variacion: calcVariacion(movCurrent, movPrev) },
      activos_nuevos: { actual: newCurrent, anterior: newPrev, variacion: calcVariacion(newCurrent, newPrev) },
      valor_adquirido: { actual: valCurrentNum, anterior: valPrevNum, variacion: calcVariacion(valCurrentNum, valPrevNum) },
    };
  }

  // ─── Critical Assets ───────────────────────────────────────────────────────
  async getCriticalAssets(): Promise<CriticalAssetsDto> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [altoValor, sinAuditoriaReciente, altaRotacion] = await Promise.all([
      // Top 10 highest-value assets
      this.prisma.activos.findMany({
        where: { datos_financieros: { isNot: null } },
        orderBy: { datos_financieros: { valor_libro_actual: 'desc' } },
        take: 10,
        select: {
          id: true,
          nombre: true,
          codigo_etiqueta: true,
          datos_financieros: { select: { valor_libro_actual: true } },
        },
      }),
      // Assets not audited in last 90 days
      this.prisma.activos.findMany({
        where: {
          NOT: {
            logs_auditoria: { some: { fecha_hora: { gte: ninetyDaysAgo } } },
          },
        },
        take: 10,
        select: {
          id: true,
          nombre: true,
          codigo_etiqueta: true,
          logs_auditoria: { select: { fecha_hora: true }, orderBy: { fecha_hora: 'desc' }, take: 1 },
        },
      }),
      // Top 10 most moved assets
      this.prisma.activos.findMany({
        where: { movimientos_activos: { some: {} } },
        orderBy: { movimientos_activos: { _count: 'desc' } },
        take: 10,
        select: {
          id: true,
          nombre: true,
          codigo_etiqueta: true,
          _count: { select: { movimientos_activos: true } },
        },
      }),
    ]);

    const now = new Date();

    return {
      alto_valor: altoValor.map((a) => ({
        id: a.id,
        nombre: a.nombre ?? 'Sin nombre',
        codigo_etiqueta: a.codigo_etiqueta,
        valor: Number(a.datos_financieros?.valor_libro_actual ?? 0),
      })),
      sin_auditoria_reciente: sinAuditoriaReciente.map((a) => {
        const lastAudit = a.logs_auditoria[0]?.fecha_hora;
        const dias_sin_auditoria = lastAudit
          ? Math.floor((now.getTime() - lastAudit.getTime()) / (1000 * 60 * 60 * 24))
          : 9999;
        return { id: a.id, nombre: a.nombre ?? 'Sin nombre', codigo_etiqueta: a.codigo_etiqueta, dias_sin_auditoria };
      }),
      alta_rotacion: altaRotacion.map((a) => ({
        id: a.id,
        nombre: a.nombre ?? 'Sin nombre',
        codigo_etiqueta: a.codigo_etiqueta,
        total_movimientos: a._count.movimientos_activos,
      })),
    };
  }

  // ─── Movements by Month ────────────────────────────────────────────────────
  async getMovementsByMonth(): Promise<MovementsByMonthItemDto[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const movements = await this.prisma.movimientos_activos.findMany({
      where: { fecha_movimiento: { gte: twelveMonthsAgo } },
      select: { fecha_movimiento: true },
    });

    const monthMap = new Map<string, number>();
    for (const m of movements) {
      if (!m.fecha_movimiento) continue;
      const key = `${m.fecha_movimiento.getFullYear()}-${String(m.fecha_movimiento.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }

    // Build last 12 months array
    const result: MovementsByMonthItemDto[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ mes: key, cantidad: monthMap.get(key) ?? 0 });
    }

    return result;
  }

  // ─── Operational Times ─────────────────────────────────────────────────────
  async getOperationalTimes(): Promise<OperationalTimesDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [auditados30, auditados90, totalActivos] = await Promise.all([
      this.prisma.activos.count({
        where: { logs_auditoria: { some: { fecha_hora: { gte: thirtyDaysAgo } } } },
      }),
      this.prisma.activos.count({
        where: { logs_auditoria: { some: { fecha_hora: { gte: ninetyDaysAgo } } } },
      }),
      this.prisma.activos.count(),
    ]);

    const sinAuditoriaReciente = totalActivos - auditados90;

    // Calculate average days between audits using raw aggregation approximation
    const allAudits = await this.prisma.logs_auditoria.findMany({
      select: { activo_id: true, fecha_hora: true },
      orderBy: { fecha_hora: 'asc' },
    });

    const byAsset = new Map<string, Date[]>();
    for (const a of allAudits) {
      if (!a.fecha_hora) continue;
      if (!byAsset.has(a.activo_id)) byAsset.set(a.activo_id, []);
      byAsset.get(a.activo_id)!.push(a.fecha_hora);
    }

    let totalDias = 0;
    let intervals = 0;
    for (const dates of byAsset.values()) {
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        totalDias += diff;
        intervals++;
      }
    }

    const promedio_dias_entre_auditorias = intervals > 0 ? Math.round(totalDias / intervals) : 0;

    return {
      promedio_dias_entre_auditorias,
      activos_auditados_30dias: auditados30,
      activos_auditados_90dias: auditados90,
      activos_sin_auditoria_reciente: sinAuditoriaReciente,
    };
  }

  // ─── Depreciation Projection ───────────────────────────────────────────────
  async getDepreciationProjection(): Promise<DepreciationProjectionItemDto[]> {
    const assets = await this.prisma.datos_financieros.findMany({
      select: { valor_libro_actual: true },
    });

    const totalCurrentValue = assets.reduce((sum, a) => sum + Number(a.valor_libro_actual), 0);

    // Get average depreciation rate from categories
    const categorias = await this.prisma.categorias.findMany({
      select: { porcentaje_depreciacion: true },
      where: { porcentaje_depreciacion: { not: null } },
    });

    const avgDepRate =
      categorias.length > 0
        ? categorias.reduce((s, c) => s + Number(c.porcentaje_depreciacion ?? 0), 0) / categorias.length / 100 / 12
        : 0.01; // fallback 1% monthly

    const result: DepreciationProjectionItemDto[] = [];
    let runningValue = totalCurrentValue;

    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ mes, valor_proyectado: Math.round(runningValue) });
      runningValue = runningValue * (1 - avgDepRate);
    }

    return result;
  }

  // ─── Top Moved Assets ──────────────────────────────────────────────────────
  async getTopMovedAssets(): Promise<TopMovedAssetDto[]> {
    const assets = await this.prisma.activos.findMany({
      where: { movimientos_activos: { some: {} } },
      orderBy: { movimientos_activos: { _count: 'desc' } },
      take: 10,
      select: {
        id: true,
        nombre: true,
        codigo_etiqueta: true,
        _count: { select: { movimientos_activos: true } },
      },
    });

    return assets.map((a) => ({
      id: a.id,
      nombre: a.nombre ?? 'Sin nombre',
      codigo_etiqueta: a.codigo_etiqueta,
      total_movimientos: a._count.movimientos_activos,
    }));
  }
}
