import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepreciacionService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancialSummary() {
    const activosDetalle = await this.getCalculatedAssets();

    // 4. KPIs globales
    const totalActivos = activosDetalle.length;
    const valorTotalAdquisicion = this.round2(
      activosDetalle.reduce((sum, a) => sum + a.valorAdquisicion, 0),
    );
    const depreciacionAcumulada = this.round2(
      activosDetalle.reduce((sum, a) => sum + a.depreciacionAcumulada, 0),
    );
    const valorEnLibros = this.round2(
      valorTotalAdquisicion - depreciacionAcumulada,
    );
    const porcentajeDepreciado =
      valorTotalAdquisicion > 0
        ? this.round2((depreciacionAcumulada / valorTotalAdquisicion) * 100)
        : 0;

    // 5. Garantías
    const conGarantia = activosDetalle.filter((a) => a.finGarantia !== null);
    const garantiasVigentes = conGarantia.filter(
      (a) => a.garantiaVigente,
    ).length;
    const garantiasVencidas = conGarantia.filter(
      (a) => !a.garantiaVigente,
    ).length;
    const sinGarantia = activosDetalle.filter(
      (a) => a.finGarantia === null,
    ).length;

    // 6. Depreciación agrupada por categoría
    const categoriasMap = new Map<
      string,
      { categoria: string; totalAdquisicion: number; totalDepreciacion: number }
    >();
    for (const activo of activosDetalle) {
      const existing = categoriasMap.get(activo.categoriaId);
      if (existing) {
        existing.totalAdquisicion += activo.valorAdquisicion;
        existing.totalDepreciacion += activo.depreciacionAcumulada;
      } else {
        categoriasMap.set(activo.categoriaId, {
          categoria: activo.categoria,
          totalAdquisicion: activo.valorAdquisicion,
          totalDepreciacion: activo.depreciacionAcumulada,
        });
      }
    }

    const depreciacionPorCategoria = Array.from(categoriasMap.values())
      .map((cat) => ({
        categoria: cat.categoria,
        porcentaje:
          depreciacionAcumulada > 0
            ? this.round2(
                (cat.totalDepreciacion / depreciacionAcumulada) * 100,
              )
            : 0,
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje);

    // 7. Top activos por valor de adquisición
    const topActivos = [...activosDetalle]
      .sort((a, b) => b.valorAdquisicion - a.valorAdquisicion)
      .slice(0, 10)
      .map((a) => ({
        nombre: a.nombre,
        valor: a.valorAdquisicion,
        porcentaje:
          valorTotalAdquisicion > 0
            ? this.round2((a.valorAdquisicion / valorTotalAdquisicion) * 100)
            : 0,
      }));

    return {
      totalActivos,
      valorTotalAdquisicion,
      depreciacionAcumulada,
      valorEnLibros,
      porcentajeDepreciado,
      garantias: {
        vigentes: garantiasVigentes,
        vencidas: garantiasVencidas,
        sinGarantia,
        criticas: 0,
      },
      depreciacionPorCategoria,
      topActivos,
      activosDetalle,
    };
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private async getCalculatedAssets() {
    const activos = await this.prisma.activos.findMany({
      include: {
        datos_financieros: true,
        categorias: true,
        estados_activo: true,
      },
    });

    const today = new Date();
    const todayTime = today.getTime();

    const activosConFinanzas = activos.filter((a) => a.datos_financieros);

    return activosConFinanzas.map((activo) => {
      const df = activo.datos_financieros!;
      const categoria = activo.categorias;
      const costoAdquisicion = Number(df.costo_adquisicion);
      const vidaUtilAnios = categoria.vida_util_anios;
      const fechaCompra = new Date(df.fecha_compra);

      const msTranscurridos = todayTime - fechaCompra.getTime();
      const aniosTranscurridos = Math.max(0, msTranscurridos / (365.25 * 24 * 60 * 60 * 1000));

      const depreciacionAnual = vidaUtilAnios > 0 ? costoAdquisicion / vidaUtilAnios : 0;
      const depreciacionAcumulada = Math.min(depreciacionAnual * aniosTranscurridos, costoAdquisicion);
      const valorEnLibros = costoAdquisicion - depreciacionAcumulada;

      const finGarantia = df.fin_garantia ? new Date(df.fin_garantia) : null;
      const garantiaVigente = finGarantia ? finGarantia >= today : false;
      const pct = costoAdquisicion > 0 ? (depreciacionAcumulada / costoAdquisicion) * 100 : 0;

      return {
        id: activo.id,
        codigoEtiqueta: activo.codigo_etiqueta,
        nombre: activo.nombre || 'Sin nombre',
        categoria: categoria.nombre,
        categoriaId: categoria.id,
        fechaAdquisicion: df.fecha_compra,
        vidaUtil: vidaUtilAnios,
        valorAdquisicion: this.round2(costoAdquisicion),
        depreciacionAnual: this.round2(depreciacionAnual),
        aniosTranscurridos: this.round2(aniosTranscurridos),
        depreciacionAcumulada: this.round2(depreciacionAcumulada),
        valorLibro: this.round2(valorEnLibros),
        porcentajeDepreciado: this.round2(pct),
        finGarantia: df.fin_garantia,
        garantiaVigente,
        estadoOperativo: activo.estados_activo?.nombre || 'Desconocido',
      };
    });
  }

  async getDetalleKpi(tipo: string) {
    const todos = await this.getCalculatedAssets();

    switch (tipo) {
      case 'acquisition':
        return todos.map((a) => ({
          codigo: a.codigoEtiqueta,
          nombre: a.nombre,
          categoria: a.categoria,
          fechaAdquisicion: a.fechaAdquisicion,
          valorAdquisicion: a.valorAdquisicion,
        }));

      case 'bookValue':
        return todos.map((a) => ({
          nombre: a.nombre,
          valorAdquisicion: a.valorAdquisicion,
          depreciacionAcumulada: a.depreciacionAcumulada,
          valorLibro: a.valorLibro,
          porcentajeDepreciado: a.porcentajeDepreciado,
          estado: a.estadoOperativo,
        }));

      case 'depreciation':
        return todos.map((a) => ({
          nombre: a.nombre,
          depreciacionAnual: a.depreciacionAnual,
          aniosTranscurridos: a.aniosTranscurridos,
          depreciacionAcumulada: a.depreciacionAcumulada,
          porcentajeDepreciado: a.porcentajeDepreciado,
        }));

      case 'warranties':
        const conGarantia = todos.filter((a) => a.finGarantia !== null);
        
        const mapeadoGarantias = conGarantia.map((a) => ({
          codigo: a.codigoEtiqueta,
          nombre: a.nombre,
          categoria: a.categoria,
          finGarantia: a.finGarantia,
          estadoGarantia: a.garantiaVigente ? 'Vigente' : 'Vencida',
        }));

        const vigentes = mapeadoGarantias.filter((g) => g.estadoGarantia === 'Vigente');
        const vencidas = mapeadoGarantias.filter((g) => g.estadoGarantia === 'Vencida');

        return { vigentes, vencidas };

      default:
        throw new Error(`Tipo de detalle desconocido: ${tipo}`);
    }
  }
}
