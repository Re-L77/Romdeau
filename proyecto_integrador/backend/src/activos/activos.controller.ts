import { Controller, Get } from '@nestjs/common';
import { ActivosService } from './activos.service';

@Controller('api/activos')
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Get()
  findAll() {
    return this.activosService.findAll();
  }
}
