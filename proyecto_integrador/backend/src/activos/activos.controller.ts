import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ActivosService } from './activos.service';

interface FindActivosQuery {
  id?: string;
  page?: string;
  limit?: string;
  q?: string;
  nombre?: string;
  codigoEtiqueta?: string;
  categoriaId?: string;
  categoriaNombre?: string;
  estadoOperativoId?: string;
  oficinaId?: string;
  custodioId?: string;
  estanteId?: string;
  sinCustodio?: string;
  proveedorId?: string;
}

@Controller('api/activos')
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  private parsePositiveInt(value: string | undefined, fieldName: string) {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${fieldName} debe ser un entero positivo`);
    }

    return parsed;
  }

  private parseBoolean(value: string | undefined, fieldName: string) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }

    throw new BadRequestException(`${fieldName} debe ser true o false`);
  }

  @Get()
  findAll(@Query() query: FindActivosQuery) {
    const page = this.parsePositiveInt(query.page, 'page') ?? 1;
    const limit = this.parsePositiveInt(query.limit, 'limit') ?? 20;
    const estadoOperativoId = this.parsePositiveInt(
      query.estadoOperativoId,
      'estadoOperativoId',
    );
    const sinCustodio = this.parseBoolean(query.sinCustodio, 'sinCustodio');

    return this.activosService.findAll({
      id: query.id,
      page,
      limit,
      q: query.q,
      nombre: query.nombre,
      codigoEtiqueta: query.codigoEtiqueta,
      categoriaId: query.categoriaId,
      categoriaNombre: query.categoriaNombre,
      estadoOperativoId,
      oficinaId: query.oficinaId,
      custodioId: query.custodioId,
      estanteId: query.estanteId,
      sinCustodio,
      proveedorId: query.proveedorId,
    });
  }
}
