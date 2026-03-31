import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResumenDto, FinancieroDto, AuditoriaRecienteDto, AlertaDto, GraficasDto, AuditoriaProgramadaDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumen(): Promise<ResumenDto> {
    const total_activos = await this.prisma.activos.count();
    
    // Assets that have at least one audit
    const activos_auditados = await this.prisma.activos.count({
      where: {
        logs_auditoria: {
          some: {}
        }
      }
    });

    // We consider it an inconsistency if there is an alert from audits or state mismatch
    // As an approximation, let's find assets with states typically denoting issues, e.g. state != 1 (Bueno)
    const activos_con_inconsistencias = await this.prisma.activos.count({
      where: {
        estado_operativo_id: {
          not: 1 // Assuming 1 is the ideal state
        }
      }
    });

    // Assets that have movements registered
    const activos_en_movimiento = await this.prisma.movimientos_activos.count();

    // Assets never audited
    const auditorias_pendientes = await this.prisma.activos.count({
      where: {
        logs_auditoria: {
          none: {}
        }
      }
    });

    return {
      total_activos,
      activos_auditados,
      activos_con_inconsistencias,
      activos_en_movimiento,
      auditorias_pendientes
    };
  }

  async getFinanciero(): Promise<FinancieroDto> {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [datosFinancierosAll, logsDepreciacion] = await Promise.all([
      this.prisma.datos_financieros.findMany({
        select: { fecha_compra: true, costo_adquisicion: true, valor_libro_actual: true },
        orderBy: { fecha_compra: 'asc' }
      }),
      this.prisma.logs_depreciacion.findMany({
        select: { fecha_calculo: true, monto_depreciado: true },
        orderBy: { fecha_calculo: 'asc' }
      })
    ]);

    let sumCosto = 0;
    let sumValorLibro = 0;
    let thisMonthAcquisitions = 0;

    datosFinancierosAll.forEach(d => {
      const costo = Number(d.costo_adquisicion || 0);
      sumCosto += costo;
      sumValorLibro += Number(d.valor_libro_actual || 0);
      if (new Date(d.fecha_compra) >= startOfThisMonth) {
        thisMonthAcquisitions += costo;
      }
    });

    const depreciacion_acumulada = sumCosto - sumValorLibro;
    const porcentaje_depreciacion = sumCosto > 0 ? (depreciacion_acumulada / sumCosto) * 100 : 0;

    const allTimeBeforeThisMonth = sumCosto - thisMonthAcquisitions;
    const variacion_mensual = allTimeBeforeThisMonth > 0
      ? Number(((thisMonthAcquisitions / allTimeBeforeThisMonth) * 100).toFixed(1))
      : sumCosto > 0 ? 100 : 0;

    const monthsArray: Date[] = [];
    for (let i = 9; i >= 0; i--) {
      monthsArray.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }

    let cumulativeCosto = 0;
    let dIndex = 0;
    const inventoryTrend = monthsArray.map((monthStart, i) => {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
      while (dIndex < datosFinancierosAll.length && new Date(datosFinancierosAll[dIndex].fecha_compra) <= monthEnd) {
        cumulativeCosto += Number(datosFinancierosAll[dIndex].costo_adquisicion || 0);
        dIndex++;
      }
      return { x: i * 20, y: cumulativeCosto };
    });

    let cumulativeDep = 0;
    let logIndex = 0;
    const depreciationTrend = monthsArray.map((monthStart, i) => {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
      while (logIndex < logsDepreciacion.length && new Date(logsDepreciacion[logIndex].fecha_calculo) <= monthEnd) {
        cumulativeDep += Number(logsDepreciacion[logIndex].monto_depreciado || 0);
        logIndex++;
      }
      return { x: i * 20, y: cumulativeDep };
    });

    return {
      valor_total_activos: sumCosto,
      depreciacion_acumulada,
      porcentaje_depreciacion: Number(porcentaje_depreciacion.toFixed(2)),
      variacion_mensual,
      inventoryTrend,
      depreciationTrend
    };
  }


  async getAuditoriasRecientes(): Promise<AuditoriaRecienteDto[]> {
    const logs = await this.prisma.logs_auditoria.findMany({
      take: 5,
      orderBy: { fecha_hora: 'desc' },
      include: {
        usuarios: true,
        estados_auditoria: true,
        activos: {
          include: {
            oficinas: true
          }
        }
      }
    });

    return logs.map(log => ({
      id: log.id,
      usuario: log.usuarios.nombre_completo || log.usuarios.email,
      fecha: log.fecha_hora || new Date(),
      ubicacion: log.activos.oficinas?.nombre || 'Desconocida',
      actividad: `Activo '${log.activos.nombre || log.activos.codigo_etiqueta}' auditado como: ${log.estados_auditoria.nombre}`
    }));
  }

  async getAuditoriasProgramadas(): Promise<AuditoriaProgramadaDto[]> {
    const programadas = await this.prisma.auditorias_programadas.findMany({
      take: 20,
      orderBy: { fecha_programada: 'asc' },
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: true,
      },
    });

    return programadas.map(ap => ({
      id: ap.id,
      titulo: ap.titulo,
      usuario: ap.usuarios.nombre_completo || ap.usuarios.email,
      fechaProgramada: ap.fecha_programada,
      ubicacion: ap.oficinas?.nombre || 'Sin ubicación',
      estado: ap.estados_auditoria_programada.nombre,
      estadoId: ap.estado_id,
    }));
  }

  async getAlertas(): Promise<AlertaDto[]> {
    const alertas: AlertaDto[] = [];

    // 1. Assets without audits
    const sinAuditar = await this.prisma.activos.findMany({
      where: { logs_auditoria: { none: {} } },
      take: 5
    });
    sinAuditar.forEach(a => {
      alertas.push({
        id: `sin-aud-act-${a.id}`,
        tipo: 'SIN_AUDITAR',
        mensaje: `Activo '${a.nombre || a.codigo_etiqueta}' no tiene auditorías.`,
        nivel: 'AMARILLO'
      });
    });

    // 2. Assets with inconsistencies (estado_operativo_id != 1)
    const inconsistencias = await this.prisma.activos.findMany({
      where: { estado_operativo_id: { not: 1 } },
      include: { estados_activo: true },
      take: 5
    });
    inconsistencias.forEach(a => {
      alertas.push({
        id: `inc-act-${a.id}`,
        tipo: 'INCONSISTENCIA',
        mensaje: `Activo '${a.nombre || a.codigo_etiqueta}' presenta estado: ${a.estados_activo.nombre}.`,
        nivel: 'ROJO'
      });
    });

    // 3. Warranties about to expire
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);
    const garantias = await this.prisma.datos_financieros.findMany({
      where: {
        fin_garantia: { lte: en30Dias, gte: new Date() }
      },
      include: { activos: true },
      take: 5
    });
    garantias.forEach(g => {
      alertas.push({
        id: `gar-act-${g.activo_id}`,
        tipo: 'GARANTIA_VENCER',
        mensaje: `La garantía del activo '${g.activos.nombre || g.activos.codigo_etiqueta}' vencerá el ${g.fin_garantia?.toLocaleDateString() || 'pronto'}.`,
        nivel: 'AMARILLO'
      });
    });

    return alertas;
  }

  async getGraficas(): Promise<GraficasDto> {
    // 1. Assets by state
    const activosPorEstadoGrouping = await this.prisma.activos.groupBy({
      by: ['estado_operativo_id'],
      _count: { id: true }
    });
    const estados = await this.prisma.estados_activo.findMany();
    const mapEstados = new Map(estados.map(e => [e.id, e.nombre]));
    
    const activosPorEstado = activosPorEstadoGrouping.map(item => ({
      estado: mapEstados.get(item.estado_operativo_id) || 'Desconocido',
      cantidad: item._count.id
    }));

    // 2. Assets by department (using the related user's department as an approximation based on custodio_actual_id)
    // To do this simply, we will find unique departments and count their assets.
    // Given Prisma's limitations on deep nested groupBy, we will do a simpler query:
    const departamentos = await this.prisma.departamentos.findMany({
      include: {
        usuarios: {
          include: {
            _count: {
              select: {
                activos: true
              }
            }
          }
        }
      }
    });

    const activosPorDepartamento = departamentos.map(dept => {
      const cantidad = dept.usuarios.reduce((acc, user) => acc + user._count.activos, 0);
      return {
        departamento: dept.nombre,
        cantidad
      };
    }).filter(d => d.cantidad > 0);

    // 3. Audits per month (Current year)
    // Due to $queryRaw restrictions and type safety, we can pull the logs of the current year and map them in memory
    // (efficient enough for normal dashboard sizes, alternatively $queryRaw can be used)
    const currentYear = new Date().getFullYear();
    const auditsThisYear = await this.prisma.logs_auditoria.findMany({
      where: {
        fecha_hora: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
        }
      },
      select: { fecha_hora: true }
    });

    const monthCounts = new Array(12).fill(0);
    auditsThisYear.forEach(audit => {
      if (audit.fecha_hora) {
        monthCounts[audit.fecha_hora.getMonth()]++;
      }
    });

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const auditoriasPorMes = monthCounts.map((count, index) => ({
      mes: monthNames[index],
      cantidad: count
    }));

    return {
      activosPorEstado,
      activosPorDepartamento,
      auditoriasPorMes
    };
  }
}
