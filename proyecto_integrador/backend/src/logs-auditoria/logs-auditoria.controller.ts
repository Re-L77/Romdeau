import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { LogsAuditoriaService } from './logs-auditoria.service';

interface FindLogsQuery {
  page?: string;
  limit?: string;
  auditorId?: string;
  activoId?: string;
  estadoId?: string;
}

@Controller('api/logs-auditoria')
export class LogsAuditoriaController {
  constructor(private readonly logsAuditoriaService: LogsAuditoriaService) {}

  private parsePositiveInt(value: string | undefined, fieldName: string) {
    if (value === undefined) return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${fieldName} debe ser un entero positivo`);
    }
    return parsed;
  }

  @Get()
  findAll(@Query() query: FindLogsQuery) {
    const page = this.parsePositiveInt(query.page, 'page') ?? 1;
    const limit = this.parsePositiveInt(query.limit, 'limit') ?? 50;
    const estadoId = this.parsePositiveInt(query.estadoId, 'estadoId');

    return this.logsAuditoriaService.findAll({
      page,
      limit,
      auditorId: query.auditorId,
      activoId: query.activoId,
      estadoId,
    });
  }
}
