import { Controller, Get, Query } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';

@Controller('api/ubicaciones')
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @Get('oficinas')
  findAllOficinas() {
    return this.ubicacionesService.findAllOficinas();
  }

  @Get('estantes')
  findAllEstantes(@Query('sedeId') sedeId?: string) {
    return this.ubicacionesService.findAllEstantes(sedeId);
  }
}
