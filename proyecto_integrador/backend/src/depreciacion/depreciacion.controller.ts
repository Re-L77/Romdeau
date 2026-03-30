import { Controller, Get, Param } from '@nestjs/common';
import { DepreciacionService } from './depreciacion.service';

@Controller('api/depreciacion')
export class DepreciacionController {
  constructor(private readonly depreciacionService: DepreciacionService) {}

  @Get('summary')
  getSummary() {
    return this.depreciacionService.getFinancialSummary();
  }

  @Get('detalle/:tipo')
  getDetalle(@Param('tipo') tipo: string) {
    return this.depreciacionService.getDetalleKpi(tipo);
  }
}
